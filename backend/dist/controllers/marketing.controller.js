"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSales = exports.recordSale = exports.lookupCustomer = void 0;
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
const paginationHelper_1 = require("../utils/paginationHelper");
// ── helpers ──────────────────────────────────────────────────────────────────
function paramStr(val) {
    return Array.isArray(val) ? val[0] : val;
}
function requireUser(req, res) {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return null;
    }
    return userId;
}
// GET /api/marketing/customer-lookup?email=  — find customer by email (scoped to user)
const lookupCustomer = async (req, res) => {
    try {
        const userId = requireUser(req, res);
        if (!userId)
            return;
        const email = (req.query.email ?? "").trim().toLowerCase();
        if (!email) {
            res.status(400).json({ message: "email query param is required" });
            return;
        }
        const rows = await db_1.db
            .select()
            .from(schema_1.customers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.customers.userId, userId), (0, drizzle_orm_1.eq)(schema_1.customers.email, email)))
            .limit(1);
        res.status(200).json({ customer: rows[0] ?? null });
    }
    catch (error) {
        console.error("Error looking up customer:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.lookupCustomer = lookupCustomer;
// POST /api/marketing/sell  — record a sale
// Body: { inventoryId, mainProductName, subProductName, price?,
//         customerId? | newCustomer: { name, email, location?, avatar? } }
const recordSale = async (req, res) => {
    try {
        const userId = requireUser(req, res);
        if (!userId)
            return;
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
        const invRows = await db_1.db
            .select()
            .from(schema_1.inventories)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.inventories.id, String(inventoryId)), (0, drizzle_orm_1.eq)(schema_1.inventories.userId, userId)))
            .limit(1);
        if (!invRows.length) {
            res.status(404).json({ message: "Inventory not found" });
            return;
        }
        const inventory = invRows[0];
        let rawMainProducts = inventory.mainProducts;
        let parsedMainProducts = rawMainProducts;
        while (typeof parsedMainProducts === 'string') {
            try {
                parsedMainProducts = JSON.parse(parsedMainProducts);
            }
            catch (e) {
                parsedMainProducts = [];
                break;
            }
        }
        if (!Array.isArray(parsedMainProducts)) {
            parsedMainProducts = [];
        }
        let stockAvailable = false;
        let updatedMainProducts = JSON.parse(JSON.stringify(parsedMainProducts));
        if (updatedMainProducts.length === 0 && inventory.mainProduct) {
            let parsedLegacySub = inventory.subProducts;
            while (typeof parsedLegacySub === 'string') {
                try {
                    parsedLegacySub = JSON.parse(parsedLegacySub);
                }
                catch (e) {
                    parsedLegacySub = [];
                    break;
                }
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
        let resolvedCustomerId;
        // ── Case 1: new customer → create first ──────────────────────────────
        if (newCustomer) {
            if (!newCustomer.name || !newCustomer.email) {
                res.status(400).json({ message: "New customer requires name and email" });
                return;
            }
            // Check if they already exist under this user (same email)
            const existing = await db_1.db
                .select()
                .from(schema_1.customers)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.customers.userId, userId), (0, drizzle_orm_1.eq)(schema_1.customers.email, String(newCustomer.email).trim().toLowerCase())))
                .limit(1);
            if (existing.length) {
                resolvedCustomerId = existing[0].id;
            }
            else {
                resolvedCustomerId = crypto_1.default.randomUUID();
                await db_1.db.insert(schema_1.customers).values({
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
                await db_1.db.insert(schema_1.activityLogs).values({
                    userId,
                    actionType: "CREATE_CUSTOMER",
                    entityId: resolvedCustomerId,
                    entityDetails: { name: newCustomer.name, email: newCustomer.email, source: "marketing" },
                });
            }
        }
        else {
            resolvedCustomerId = String(customerId);
        }
        // ── Fetch current customer to update purchasedProducts + orders ───────
        const customerRows = await db_1.db
            .select()
            .from(schema_1.customers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.customers.id, resolvedCustomerId), (0, drizzle_orm_1.eq)(schema_1.customers.userId, userId)))
            .limit(1);
        if (!customerRows.length) {
            res.status(404).json({ message: "Customer not found or unauthorized" });
            return;
        }
        const customer = customerRows[0];
        const previousProducts = customer.purchasedProducts ?? [];
        const newPurchase = {
            inventoryId: String(inventoryId),
            subProductName: String(subProductName),
        };
        const currentSpent = parseFloat(String(customer.spent).replace(/[^0-9.-]+/g, '')) || 0;
        const purchasePrice = parseFloat(String(price || "0").replace(/[^0-9.-]+/g, '')) || 0;
        const totalPurchaseCost = purchasePrice * Number(quantity);
        const newSpentAmount = currentSpent + totalPurchaseCost;
        await db_1.db
            .update(schema_1.customers)
            .set({
            purchasedProducts: [...previousProducts, newPurchase],
            orders: (customer.orders ?? 0) + 1,
            spent: `$ ${newSpentAmount.toFixed(2)}`,
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.customers.id, resolvedCustomerId), (0, drizzle_orm_1.eq)(schema_1.customers.userId, userId)));
        // ── Update inventory stock ────────────────────────────────────────────
        await db_1.db
            .update(schema_1.inventories)
            .set({ mainProducts: JSON.stringify(updatedMainProducts) })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.inventories.id, String(inventoryId)), (0, drizzle_orm_1.eq)(schema_1.inventories.userId, userId)));
        // ── Log the sale ──────────────────────────────────────────────────────
        await db_1.db.insert(schema_1.activityLogs).values({
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
    }
    catch (error) {
        console.error("Error recording sale:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.recordSale = recordSale;
// GET /api/marketing/sales  — sales history, optional ?date=YYYY-MM-DD filter
const getSales = async (req, res) => {
    try {
        const userId = requireUser(req, res);
        if (!userId)
            return;
        const dateFilter = req.query.date?.trim() ?? null;
        if (dateFilter) {
            // ── Single-day drill-down (no pagination) ──
            const rows = await db_1.db
                .select()
                .from(schema_1.activityLogs)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.activityLogs.userId, userId), (0, drizzle_orm_1.eq)(schema_1.activityLogs.actionType, "RECORD_SALE"), (0, drizzle_orm_1.sql) `DATE(${schema_1.activityLogs.createdAt}) = ${dateFilter}`))
                .orderBy((0, drizzle_orm_1.sql) `${schema_1.activityLogs.createdAt} DESC`);
            const parsed = rows.map(row => {
                let details = row.entityDetails;
                if (typeof details === "string") {
                    try {
                        details = JSON.parse(details);
                    }
                    catch { }
                }
                return { ...row, entityDetails: details };
            });
            res.status(200).json({ data: parsed, total: parsed.length, date: dateFilter });
            return;
        }
        // ── Standard paginated list ──
        const { page, limit, offset } = (0, paginationHelper_1.parsePagination)(req.query);
        const [rows, countResult] = await Promise.all([
            db_1.db
                .select()
                .from(schema_1.activityLogs)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.activityLogs.userId, userId), (0, drizzle_orm_1.eq)(schema_1.activityLogs.actionType, "RECORD_SALE")))
                .orderBy((0, drizzle_orm_1.sql) `${schema_1.activityLogs.createdAt} DESC`)
                .limit(limit)
                .offset(offset),
            db_1.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema_1.activityLogs)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.activityLogs.userId, userId), (0, drizzle_orm_1.eq)(schema_1.activityLogs.actionType, "RECORD_SALE"))),
        ]);
        const parsedRows = rows.map(row => {
            let details = row.entityDetails;
            if (typeof details === 'string') {
                try {
                    details = JSON.parse(details);
                }
                catch (e) { }
            }
            return { ...row, entityDetails: details };
        });
        const total = Number(countResult[0]?.count ?? 0);
        res.status(200).json((0, paginationHelper_1.paginatedResponse)(parsedRows, total, page, limit));
    }
    catch (error) {
        console.error("Error fetching sales:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getSales = getSales;
