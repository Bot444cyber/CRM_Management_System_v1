import { Request, Response } from "express";
import { db } from "../config/db";
import { analytics, activityLogs, customers, inventories, workspaces, projects, workspaceMembers, projectPulse } from "../db/schema";
import { eq, and, sql, desc, inArray } from "drizzle-orm";
import type { MainProduct } from "../db/schema";

// ── Shared helpers ────────────────────────────────────────────────────────────

/** Always return a plain object – MySQL JSON columns sometimes come back as a string */
function parseDetails(raw: any): any {
    if (!raw) return null;
    if (typeof raw === "string") {
        try { return JSON.parse(raw); } catch { return null; }
    }
    return raw;
}

/** Strip currency symbols / spaces and return a float */
function parsePrice(val: any): number {
    if (val == null) return 0;
    const num = parseFloat(String(val).replace(/[^0-9.-]+/g, ""));
    return isNaN(num) ? 0 : num;
}

/** Build an in-memory product-price lookup: inventoryId → subProductName → price */
async function buildPriceLookup(userId: number): Promise<Map<string, number>> {
    const allInv = await db
        .select()
        .from(inventories)
        .where(eq(inventories.userId, userId));

    const lookup = new Map<string, number>(); // key = `${invId}|${subName.toLower()}`

    for (const inv of allInv) {
        let mps = inv.mainProducts as any;
        while (typeof mps === "string") {
            try { mps = JSON.parse(mps); } catch { mps = []; break; }
        }
        if (!Array.isArray(mps)) mps = [];

        for (const mp of mps as MainProduct[]) {
            for (const sp of mp.subProducts ?? []) {
                const price = parsePrice(sp.price);
                if (price > 0) {
                    const key = `${inv.id}|${String(sp.name).trim().toLowerCase()}`;
                    lookup.set(key, price);
                }
            }
        }

        // Legacy sub_products column
        let legacySubs = inv.subProducts as any;
        while (typeof legacySubs === "string") {
            try { legacySubs = JSON.parse(legacySubs); } catch { legacySubs = []; break; }
        }
        if (Array.isArray(legacySubs)) {
            for (const sp of legacySubs) {
                const price = parsePrice(sp.price);
                if (price > 0) {
                    const key = `${inv.id}|${String(sp.name).trim().toLowerCase()}`;
                    lookup.set(key, price);
                }
            }
        }
    }

    return lookup;
}

/** Resolve the per-unit price for a sale log entry */
function resolveUnitPrice(details: any, priceLookup: Map<string, number>): number {
    // 1. Use the logged price if present
    const logged = parsePrice(details.price);
    if (logged > 0) return logged;

    // 2. Fall back to current inventory price
    const invId = String(details.inventoryId ?? "");
    const subName = String(details.subProductName ?? "").trim().toLowerCase();
    const key = `${invId}|${subName}`;
    return priceLookup.get(key) ?? 0;
}

// ── GET /api/analytics ────────────────────────────────────────────────────────
export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        const { inventoryId } = req.query;
        const userId = req.user?.userId;
        if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }

        const allData = await db.select().from(analytics).where(eq(analytics.userId, userId));

        allData.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateA - dateB;
        });

        const inventoryLatest = new Map<string, number>();
        const groupedByDay = new Map<string, number>();

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            groupedByDay.set(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), 0);
        }

        for (const curr of allData) {
            const date = curr.createdAt ? new Date(curr.createdAt) : new Date();
            const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

            inventoryLatest.set(curr.name, curr.value);

            let dayTotal = 0;
            for (const [invId, val] of inventoryLatest.entries()) {
                if (!inventoryId || inventoryId === "all" || inventoryId === invId) dayTotal += val;
            }
            if (groupedByDay.has(dateStr)) groupedByDay.set(dateStr, dayTotal);
        }

        res.status(200).json(
            Array.from(groupedByDay.entries()).map(([name, value]) => ({ name, value }))
        );
    } catch (error) {
        console.error("Error fetching analytics:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ── GET /api/analytics/insights ───────────────────────────────────────────────
export const getDashboardInsights = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }

        // Fetch everything in parallel
        const [salesLogs, allCustomers, priceLookup] = await Promise.all([
            db.select().from(activityLogs)
                .where(and(eq(activityLogs.userId, userId), eq(activityLogs.actionType, "RECORD_SALE"))),
            db.select().from(customers).where(eq(customers.userId, userId)),
            buildPriceLookup(userId),
        ]);

        // ── Marketing KPIs ──
        let totalMarketingRevenue = 0;
        const productSales = new Map<string, number>();

        for (const log of salesLogs) {
            const d = parseDetails(log.entityDetails);
            if (!d) continue;

            const unitPrice = resolveUnitPrice(d, priceLookup);
            const qty = Number(d.quantity) || 1;
            totalMarketingRevenue += unitPrice * qty;

            const prodName = d.subProductName || d.mainProductName;
            if (prodName) productSales.set(prodName, (productSales.get(prodName) ?? 0) + qty);
        }

        const topProducts = Array.from(productSales.entries())
            .map(([name, sales]) => ({ name, sales }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);

        // ── Customer KPIs ──
        const totalCustomers = allCustomers.length;
        let totalCustomerSpend = 0;

        const customerSpends = allCustomers.map(c => {
            const spent = parsePrice(c.spent);
            totalCustomerSpend += spent;
            return { name: c.name, email: c.email, spent, orders: c.orders ?? 0, avatar: c.avatar };
        });

        const averageSpend = totalCustomers > 0 ? totalCustomerSpend / totalCustomers : 0;
        const topCustomers = customerSpends
            .sort((a, b) => b.spent - a.spent)
            .slice(0, 5)
            .map(c => ({ ...c, spentStr: `$${c.spent.toFixed(2)}` }));

        const topNames = topCustomers.map(c => c.name);

        // ── Top-customers 3-day bar chart ──
        const last3Days = new Map<string, any>();
        for (let i = 2; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const row: any = { date: dateStr };
            for (const n of topNames) row[n] = 0;
            last3Days.set(dateStr, row);
        }

        const cutoff3 = new Date();
        cutoff3.setDate(cutoff3.getDate() - 2);
        cutoff3.setHours(0, 0, 0, 0);

        for (const log of salesLogs) {
            const d = parseDetails(log.entityDetails);
            if (!d) continue;
            const date = log.createdAt ? new Date(log.createdAt) : new Date();
            if (date < cutoff3) continue;
            const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const custName = d.customerName;
            if (!custName || !topNames.includes(custName) || !last3Days.has(dateStr)) continue;
            const unitPrice = resolveUnitPrice(d, priceLookup);
            const qty = Number(d.quantity) || 1;
            last3Days.get(dateStr)![custName] += unitPrice * qty;
        }

        res.status(200).json({
            marketing: {
                totalRevenue: totalMarketingRevenue,
                salesConverted: salesLogs.length,
                topProducts,
            },
            customers: {
                totalCustomers,
                averageSpend,
                topCustomers,
                topCustomersGraph: Array.from(last3Days.values()),
            },
        });
    } catch (error) {
        console.error("Error fetching dashboard insights:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ── GET /api/analytics/sales-breakdown ────────────────────────────────────────
export const getSalesBreakdown = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }

        const [salesLogs, priceLookup] = await Promise.all([
            db.select().from(activityLogs)
                .where(and(eq(activityLogs.userId, userId), eq(activityLogs.actionType, "RECORD_SALE"))),
            buildPriceLookup(userId),
        ]);

        // ── 7-day cutoff (inclusive) ──
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 6);
        cutoff.setHours(0, 0, 0, 0);

        // ── Per-product aggregation: LAST 7 DAYS ONLY ──
        const productMap = new Map<string, {
            unitPrice: number; totalUnits: number; totalRevenue: number;
        }>();

        for (const log of salesLogs) {
            const logDate = log.createdAt ? new Date(log.createdAt) : new Date();
            if (logDate < cutoff) continue;                   // ← 7-day filter

            const d = parseDetails(log.entityDetails);
            if (!d) continue;

            const name = String(d.subProductName || d.mainProductName || "Unknown").trim();
            const unitPrice = resolveUnitPrice(d, priceLookup);
            const qty = Number(d.quantity) || 1;
            const revenue = unitPrice * qty;

            const existing = productMap.get(name) ?? { unitPrice: 0, totalUnits: 0, totalRevenue: 0 };
            productMap.set(name, {
                unitPrice: unitPrice > 0 ? unitPrice : existing.unitPrice,
                totalUnits: existing.totalUnits + qty,
                totalRevenue: existing.totalRevenue + revenue,
            });
        }

        const grandRevenue = Array.from(productMap.values()).reduce((s, p) => s + p.totalRevenue, 0) || 1;

        const products = Array.from(productMap.entries())
            .map(([name, stats]) => {
                const avgPrice = stats.totalUnits > 0 ? (stats.totalRevenue / stats.totalUnits) : stats.unitPrice;
                return {
                    name,
                    unitPrice: avgPrice,
                    totalUnits: stats.totalUnits,
                    totalRevenue: stats.totalRevenue,
                    revenueShare: Math.round((stats.totalRevenue / grandRevenue) * 100),
                };
            })
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 8);

        // ── Build 7-day scaffold ──
        const productNames = products.map(p => p.name);
        const revenueMap = new Map<string, Record<string, any>>();
        const unitsMap = new Map<string, Record<string, any>>();

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

            const revEntry: Record<string, any> = { date: dateStr };
            const unitEntry: Record<string, any> = { date: dateStr };
            for (const n of productNames) { revEntry[n] = 0; unitEntry[n] = 0; }

            revenueMap.set(dateStr, revEntry);
            unitsMap.set(dateStr, unitEntry);
        }

        // ── Populate both time-series ──
        for (const log of salesLogs) {
            const logDate = log.createdAt ? new Date(log.createdAt) : new Date();
            if (logDate < cutoff) continue;

            const d = parseDetails(log.entityDetails);
            if (!d) continue;

            const dateStr = logDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const name = String(d.subProductName || d.mainProductName || "Unknown").trim();
            if (!productNames.includes(name)) continue;

            const unitPrice = resolveUnitPrice(d, priceLookup);
            const qty = Number(d.quantity) || 1;

            if (revenueMap.has(dateStr)) revenueMap.get(dateStr)![name] += unitPrice * qty;
            if (unitsMap.has(dateStr)) unitsMap.get(dateStr)![name] += qty;
        }

        res.status(200).json({
            products,
            timeSeries: Array.from(revenueMap.values()),   // revenue / day / product
            unitTimeSeries: Array.from(unitsMap.values()),     // units  / day / product
        });
    } catch (error) {
        console.error("Error fetching sales breakdown:", error);
        res.status(500).json({ message: "Server error" });
    }
};



// ── GET /api/pms/analytics/summary ──────────────────────────────────────────
export const getPMSSummary = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }

        // 1. Fetch Workspaces where user is a member
        const myWorkspaces = await db
            .select({ id: workspaces.id, name: workspaces.name })
            .from(workspaces)
            .innerJoin(workspaceMembers, eq(workspaceMembers.workspaceId, workspaces.id))
            .where(eq(workspaceMembers.userId, userId));

        if (myWorkspaces.length === 0) {
            res.status(200).json({
                workspaces: { total: 0, list: [] },
                projects: { total: 0, statusDistribution: [], healthDistribution: [] },
                team: { total: 0, roleDistribution: [] },
                activity: []
            });
            return;
        }

        const workspaceIds = myWorkspaces.map(ws => ws.id);

        // 2. Fetch Projects across these workspaces
        const allProjects = await db
            .select()
            .from(projects)
            .where(inArray(projects.workspaceId, workspaceIds));

        // 3. Fetch Global Team Members with Workspace Mapping
        const teamMembers = await db
            .select({
                role: workspaceMembers.role,
                userId: workspaceMembers.userId,
                workspaceId: workspaceMembers.workspaceId
            })
            .from(workspaceMembers)
            .where(inArray(workspaceMembers.workspaceId, workspaceIds));

        // 4. Fetch Global Pulse Events with Workspace Mapping
        const recentPulse = await db
            .select({
                id: projectPulse.id,
                type: projectPulse.type,
                title: projectPulse.title,
                message: projectPulse.message,
                time: projectPulse.time,
                workspaceId: projects.workspaceId
            })
            .from(projectPulse)
            .innerJoin(projects, eq(projectPulse.projectId, projects.id))
            .where(inArray(projects.workspaceId, workspaceIds))
            .orderBy(desc(projectPulse.time))
            .limit(10);

        // ── Aggregation ──

        // Projects Status
        const statusMap = new Map<string, number>();
        allProjects.forEach(p => {
            const status = p.status || 'Active';
            statusMap.set(status, (statusMap.get(status) || 0) + 1);
        });

        // Team Roles
        const roleMap = new Map<string, number>();
        const uniqueMembers = new Set<number>();
        teamMembers.forEach(m => {
            uniqueMembers.add(m.userId);
            roleMap.set(m.role, (roleMap.get(m.role) || 0) + 1);
        });

        res.status(200).json({
            workspaces: {
                total: myWorkspaces.length,
                list: myWorkspaces
            },
            projects: {
                total: allProjects.length,
                statusDistribution: Array.from(statusMap.entries()).map(([name, value]) => ({ name, value })),
                list: allProjects.map(p => ({
                    id: p.id,
                    name: p.name,
                    status: p.status,
                    workspaceId: p.workspaceId,
                    deadline: p.deadline
                }))
            },
            team: {
                total: uniqueMembers.size,
                roleDistribution: Array.from(roleMap.entries()).map(([name, value]) => ({ name, value })),
                list: teamMembers // Include raw list for frontend filtering
            },
            activity: recentPulse
        });

    } catch (error) {
        console.error("Error fetching PMS summary:", error);
        res.status(500).json({ message: "Server error" });
    }
};
