"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSalesBreakdown = exports.getDashboardInsights = exports.getAnalytics = void 0;
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
// ── Shared helpers ────────────────────────────────────────────────────────────
/** Always return a plain object – MySQL JSON columns sometimes come back as a string */
function parseDetails(raw) {
    if (!raw)
        return null;
    if (typeof raw === "string") {
        try {
            return JSON.parse(raw);
        }
        catch {
            return null;
        }
    }
    return raw;
}
/** Strip currency symbols / spaces and return a float */
function parsePrice(val) {
    if (val == null)
        return 0;
    const num = parseFloat(String(val).replace(/[^0-9.-]+/g, ""));
    return isNaN(num) ? 0 : num;
}
/** Build an in-memory product-price lookup: inventoryId → subProductName → price */
async function buildPriceLookup(userId) {
    const allInv = await db_1.db
        .select()
        .from(schema_1.inventories)
        .where((0, drizzle_orm_1.eq)(schema_1.inventories.userId, userId));
    const lookup = new Map(); // key = `${invId}|${subName.toLower()}`
    for (const inv of allInv) {
        let mps = inv.mainProducts;
        while (typeof mps === "string") {
            try {
                mps = JSON.parse(mps);
            }
            catch {
                mps = [];
                break;
            }
        }
        if (!Array.isArray(mps))
            mps = [];
        for (const mp of mps) {
            for (const sp of mp.subProducts ?? []) {
                const price = parsePrice(sp.price);
                if (price > 0) {
                    const key = `${inv.id}|${String(sp.name).trim().toLowerCase()}`;
                    lookup.set(key, price);
                }
            }
        }
        // Legacy sub_products column
        let legacySubs = inv.subProducts;
        while (typeof legacySubs === "string") {
            try {
                legacySubs = JSON.parse(legacySubs);
            }
            catch {
                legacySubs = [];
                break;
            }
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
function resolveUnitPrice(details, priceLookup) {
    // 1. Use the logged price if present
    const logged = parsePrice(details.price);
    if (logged > 0)
        return logged;
    // 2. Fall back to current inventory price
    const invId = String(details.inventoryId ?? "");
    const subName = String(details.subProductName ?? "").trim().toLowerCase();
    const key = `${invId}|${subName}`;
    return priceLookup.get(key) ?? 0;
}
// ── GET /api/analytics ────────────────────────────────────────────────────────
const getAnalytics = async (req, res) => {
    try {
        const { inventoryId } = req.query;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const allData = await db_1.db.select().from(schema_1.analytics).where((0, drizzle_orm_1.eq)(schema_1.analytics.userId, userId));
        allData.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateA - dateB;
        });
        const inventoryLatest = new Map();
        const groupedByDay = new Map();
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
                if (!inventoryId || inventoryId === "all" || inventoryId === invId)
                    dayTotal += val;
            }
            if (groupedByDay.has(dateStr))
                groupedByDay.set(dateStr, dayTotal);
        }
        res.status(200).json(Array.from(groupedByDay.entries()).map(([name, value]) => ({ name, value })));
    }
    catch (error) {
        console.error("Error fetching analytics:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getAnalytics = getAnalytics;
// ── GET /api/analytics/insights ───────────────────────────────────────────────
const getDashboardInsights = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        // Fetch everything in parallel
        const [salesLogs, allCustomers, priceLookup] = await Promise.all([
            db_1.db.select().from(schema_1.activityLogs)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.activityLogs.userId, userId), (0, drizzle_orm_1.eq)(schema_1.activityLogs.actionType, "RECORD_SALE"))),
            db_1.db.select().from(schema_1.customers).where((0, drizzle_orm_1.eq)(schema_1.customers.userId, userId)),
            buildPriceLookup(userId),
        ]);
        // ── Marketing KPIs ──
        let totalMarketingRevenue = 0;
        const productSales = new Map();
        for (const log of salesLogs) {
            const d = parseDetails(log.entityDetails);
            if (!d)
                continue;
            const unitPrice = resolveUnitPrice(d, priceLookup);
            const qty = Number(d.quantity) || 1;
            totalMarketingRevenue += unitPrice * qty;
            const prodName = d.subProductName || d.mainProductName;
            if (prodName)
                productSales.set(prodName, (productSales.get(prodName) ?? 0) + qty);
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
        const last3Days = new Map();
        for (let i = 2; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const row = { date: dateStr };
            for (const n of topNames)
                row[n] = 0;
            last3Days.set(dateStr, row);
        }
        const cutoff3 = new Date();
        cutoff3.setDate(cutoff3.getDate() - 2);
        cutoff3.setHours(0, 0, 0, 0);
        for (const log of salesLogs) {
            const d = parseDetails(log.entityDetails);
            if (!d)
                continue;
            const date = log.createdAt ? new Date(log.createdAt) : new Date();
            if (date < cutoff3)
                continue;
            const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const custName = d.customerName;
            if (!custName || !topNames.includes(custName) || !last3Days.has(dateStr))
                continue;
            const unitPrice = resolveUnitPrice(d, priceLookup);
            const qty = Number(d.quantity) || 1;
            last3Days.get(dateStr)[custName] += unitPrice * qty;
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
    }
    catch (error) {
        console.error("Error fetching dashboard insights:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getDashboardInsights = getDashboardInsights;
// ── GET /api/analytics/sales-breakdown ────────────────────────────────────────
const getSalesBreakdown = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const [salesLogs, priceLookup] = await Promise.all([
            db_1.db.select().from(schema_1.activityLogs)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.activityLogs.userId, userId), (0, drizzle_orm_1.eq)(schema_1.activityLogs.actionType, "RECORD_SALE"))),
            buildPriceLookup(userId),
        ]);
        // ── 7-day cutoff (inclusive) ──
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 6);
        cutoff.setHours(0, 0, 0, 0);
        // ── Per-product aggregation: LAST 7 DAYS ONLY ──
        const productMap = new Map();
        for (const log of salesLogs) {
            const logDate = log.createdAt ? new Date(log.createdAt) : new Date();
            if (logDate < cutoff)
                continue; // ← 7-day filter
            const d = parseDetails(log.entityDetails);
            if (!d)
                continue;
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
        const revenueMap = new Map();
        const unitsMap = new Map();
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const revEntry = { date: dateStr };
            const unitEntry = { date: dateStr };
            for (const n of productNames) {
                revEntry[n] = 0;
                unitEntry[n] = 0;
            }
            revenueMap.set(dateStr, revEntry);
            unitsMap.set(dateStr, unitEntry);
        }
        // ── Populate both time-series ──
        for (const log of salesLogs) {
            const logDate = log.createdAt ? new Date(log.createdAt) : new Date();
            if (logDate < cutoff)
                continue;
            const d = parseDetails(log.entityDetails);
            if (!d)
                continue;
            const dateStr = logDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const name = String(d.subProductName || d.mainProductName || "Unknown").trim();
            if (!productNames.includes(name))
                continue;
            const unitPrice = resolveUnitPrice(d, priceLookup);
            const qty = Number(d.quantity) || 1;
            if (revenueMap.has(dateStr))
                revenueMap.get(dateStr)[name] += unitPrice * qty;
            if (unitsMap.has(dateStr))
                unitsMap.get(dateStr)[name] += qty;
        }
        res.status(200).json({
            products,
            timeSeries: Array.from(revenueMap.values()), // revenue / day / product
            unitTimeSeries: Array.from(unitsMap.values()), // units  / day / product
        });
    }
    catch (error) {
        console.error("Error fetching sales breakdown:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getSalesBreakdown = getSalesBreakdown;
