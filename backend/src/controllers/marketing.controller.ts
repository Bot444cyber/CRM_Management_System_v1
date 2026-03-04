import { Request, Response } from "express";
import { db } from "../config/db";
import { customers, activityLogs, inventories } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import crypto from "crypto";
import { parsePagination, paginatedResponse } from "../utils/paginationHelper";
import type { PurchasedProduct, MainProduct, SubProduct } from "../db/schema";

// ── helpers ──────────────────────────────────────────────────────────────────

function paramStr(val: string | string[]): string {
    return Array.isArray(val) ? val[0] : val;
}

function requireUser(req: Request, res: Response): number | null {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return null;
    }
    return userId;
}

// GET /api/marketing/customer-lookup?email=  — find customer by email (scoped to user)
export const lookupCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = requireUser(req, res);
        if (!userId) return;

        const email = (req.query.email as string ?? "").trim().toLowerCase();
        if (!email) {
            res.status(400).json({ message: "email query param is required" });
            return;
        }

        const rows = await db
            .select()
            .from(customers)
            .where(and(eq(customers.userId, userId), eq(customers.email, email)))
            .limit(1);

        res.status(200).json({ customer: rows[0] ?? null });
    } catch (error) {
        console.error("Error looking up customer:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// POST /api/marketing/sell  — record a sale
// Body: { inventoryId, mainProductName, subProductName, price?,
//         customerId? | newCustomer: { name, email, location?, avatar? } }
export const recordSale = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = requireUser(req, res);
        if (!userId) return;

        const { inventoryId, mainProductName, subProductName, price, quantity = 1, customerId, newCustomer } = req.body;

        if (!inventoryId || !mainProductName || !subProductName) {
            res.status(400).json({ message: "inventoryId, mainProductName and subProductName are required" });
            return;
        }

        if (!customerId && !newCustomer) {
            res.status(400).json({ message: "Either customerId or newCustomer details are required" });
            return;
        }

        // ── Check inventory stock ─────────────────────────────────────────────
        const invRows = await db
            .select()
            .from(inventories)
            .where(and(eq(inventories.id, String(inventoryId)), eq(inventories.userId, userId)))
            .limit(1);

        if (!invRows.length) {
            res.status(404).json({ message: "Inventory not found" });
            return;
        }

        const inventory = invRows[0];

        let rawMainProducts = inventory.mainProducts;
        let parsedMainProducts: any = rawMainProducts;

        while (typeof parsedMainProducts === 'string') {
            try { parsedMainProducts = JSON.parse(parsedMainProducts); } catch (e) { parsedMainProducts = []; break; }
        }
        if (!Array.isArray(parsedMainProducts)) {
            parsedMainProducts = [];
        }

        let stockAvailable = false;
        let updatedMainProducts = JSON.parse(JSON.stringify(parsedMainProducts)) as MainProduct[];

        if (updatedMainProducts.length === 0 && inventory.mainProduct) {
            let parsedLegacySub = inventory.subProducts as any;
            while (typeof parsedLegacySub === 'string') {
                try { parsedLegacySub = JSON.parse(parsedLegacySub); } catch (e) { parsedLegacySub = []; break; }
            }
            if (!Array.isArray(parsedLegacySub)) {
                parsedLegacySub = [];
            }
            updatedMainProducts = [{
                name: String(inventory.mainProduct),
                imageUrl: inventory.mainProductImageUrl ? String(inventory.mainProductImageUrl) : undefined,
                subProducts: parsedLegacySub
            }];
        }

        const targetMainRaw = String(mainProductName || "").trim().toLowerCase();
        const targetSubRaw = String(subProductName || "").trim().toLowerCase();

        for (let i = 0; i < updatedMainProducts.length; i++) {
            const currentMainName = String(updatedMainProducts[i].name || "").trim().toLowerCase();
            if (currentMainName === targetMainRaw) {
                const subProducts = updatedMainProducts[i].subProducts;
                if (subProducts) {
                    for (let j = 0; j < subProducts.length; j++) {
                        const currentSubName = String(subProducts[j].name || "").trim().toLowerCase();
                        if (currentSubName === targetSubRaw) {
                            const currentStock = Number(subProducts[j].stock);
                            const requestedQuantity = Number(quantity);
                            if (!isNaN(currentStock) && currentStock >= requestedQuantity && requestedQuantity > 0) {
                                stockAvailable = true;
                                subProducts[j].stock = currentStock - requestedQuantity;
                            }
                            break;
                        }
                    }
                }
                break;
            }
        }

        if (!stockAvailable) {
            res.status(400).json({ message: "Product is out of stock" });
            return;
        }



        let resolvedCustomerId: string;

        // ── Case 1: new customer → create first ──────────────────────────────
        if (newCustomer) {
            if (!newCustomer.name || !newCustomer.email) {
                res.status(400).json({ message: "New customer requires name and email" });
                return;
            }

            // Check if they already exist under this user (same email)
            const existing = await db
                .select()
                .from(customers)
                .where(and(eq(customers.userId, userId), eq(customers.email, String(newCustomer.email).trim().toLowerCase())))
                .limit(1);

            if (existing.length) {
                resolvedCustomerId = existing[0].id;
            } else {
                resolvedCustomerId = crypto.randomUUID();
                await db.insert(customers).values({
                    id: resolvedCustomerId,
                    userId,
                    name: String(newCustomer.name).trim(),
                    email: String(newCustomer.email).trim().toLowerCase(),
                    location: newCustomer.location ? String(newCustomer.location).trim() : null,
                    avatar: newCustomer.avatar ? String(newCustomer.avatar).trim() : null,
                    orders: 0,
                    spent: "$ 0",
                    rating: null,
                    purchasedProducts: [],
                });

                await db.insert(activityLogs).values({
                    userId,
                    actionType: "CREATE_CUSTOMER",
                    entityId: resolvedCustomerId,
                    entityDetails: { name: newCustomer.name, email: newCustomer.email, source: "marketing" },
                });
            }
        } else {
            resolvedCustomerId = String(customerId);
        }

        // ── Fetch current customer to update purchasedProducts + orders ───────
        const customerRows = await db
            .select()
            .from(customers)
            .where(and(eq(customers.id, resolvedCustomerId), eq(customers.userId, userId)))
            .limit(1);

        if (!customerRows.length) {
            res.status(404).json({ message: "Customer not found or unauthorized" });
            return;
        }

        const customer = customerRows[0];
        const previousProducts: PurchasedProduct[] = (customer.purchasedProducts as PurchasedProduct[]) ?? [];

        const newPurchase: PurchasedProduct = {
            inventoryId: String(inventoryId),
            subProductName: String(subProductName),
        };

        const currentSpent = parseFloat(String(customer.spent).replace(/[^0-9.-]+/g, '')) || 0;
        const purchasePrice = parseFloat(String(price || "0").replace(/[^0-9.-]+/g, '')) || 0;
        const totalPurchaseCost = purchasePrice * Number(quantity);
        const newSpentAmount = currentSpent + totalPurchaseCost;

        await db
            .update(customers)
            .set({
                purchasedProducts: [...previousProducts, newPurchase],
                orders: (customer.orders ?? 0) + 1,
                spent: `$ ${newSpentAmount.toFixed(2)}`,
            })
            .where(and(eq(customers.id, resolvedCustomerId), eq(customers.userId, userId)));

        // ── Update inventory stock ────────────────────────────────────────────
        await db
            .update(inventories)
            .set({ mainProducts: JSON.stringify(updatedMainProducts) as any })
            .where(and(eq(inventories.id, String(inventoryId)), eq(inventories.userId, userId)));

        // ── Log the sale ──────────────────────────────────────────────────────
        await db.insert(activityLogs).values({
            userId,
            actionType: "RECORD_SALE",
            entityId: resolvedCustomerId,
            entityDetails: {
                customerId: resolvedCustomerId,
                customerName: customer.name,
                customerEmail: customer.email,
                inventoryId,
                mainProductName,
                subProductName,
                quantity: Number(quantity),
                price: price ?? null,
                soldAt: new Date().toISOString(),
            },
        });

        res.status(201).json({
            message: "Sale recorded successfully",
            customerId: resolvedCustomerId,
            customerName: customer.name,
        });
    } catch (error) {
        console.error("Error recording sale:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// GET /api/marketing/sales  — sales history, optional ?date=YYYY-MM-DD filter
export const getSales = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = requireUser(req, res);
        if (!userId) return;

        const dateFilter = (req.query.date as string | undefined)?.trim() ?? null;

        if (dateFilter) {
            // ── Single-day drill-down (no pagination) ──
            const rows = await db
                .select()
                .from(activityLogs)
                .where(and(
                    eq(activityLogs.userId, userId),
                    eq(activityLogs.actionType, "RECORD_SALE"),
                    sql`DATE(${activityLogs.createdAt}) = ${dateFilter}`,
                ))
                .orderBy(sql`${activityLogs.createdAt} DESC`);

            const parsed = rows.map(row => {
                let details = row.entityDetails;
                if (typeof details === "string") { try { details = JSON.parse(details); } catch { } }
                return { ...row, entityDetails: details };
            });

            res.status(200).json({ data: parsed, total: parsed.length, date: dateFilter });
            return;
        }

        // ── Standard paginated list ──
        const { page, limit, offset } = parsePagination(req.query);

        const [rows, countResult] = await Promise.all([
            db
                .select()
                .from(activityLogs)
                .where(and(eq(activityLogs.userId, userId), eq(activityLogs.actionType, "RECORD_SALE")))
                .orderBy(sql`${activityLogs.createdAt} DESC`)
                .limit(limit)
                .offset(offset),
            db
                .select({ count: sql<number>`count(*)` })
                .from(activityLogs)
                .where(and(eq(activityLogs.userId, userId), eq(activityLogs.actionType, "RECORD_SALE"))),
        ]);

        const parsedRows = rows.map(row => {
            let details = row.entityDetails;
            if (typeof details === 'string') { try { details = JSON.parse(details); } catch (e) { } }
            return { ...row, entityDetails: details };
        });

        const total = Number(countResult[0]?.count ?? 0);
        res.status(200).json(paginatedResponse(parsedRows, total, page, limit));
    } catch (error) {
        console.error("Error fetching sales:", error);
        res.status(500).json({ message: "Server error" });
    }
};


