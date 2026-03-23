"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomerById = exports.getCustomers = void 0;
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
const paginationHelper_1 = require("../utils/paginationHelper");
// ── helpers ──────────────────────────────────────────────────────────────────
/** Extracts userId from JWT; sends 401 and returns null if missing. */
function requireUser(req, res) {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return null;
    }
    return userId;
}
/** Safely coerces req.params value to string. */
function paramStr(val) {
    return Array.isArray(val) ? val[0] : val;
}
// GET /api/customers  — paginated list (scoped to current user)
const getCustomers = async (req, res) => {
    try {
        const userId = requireUser(req, res);
        if (!userId)
            return;
        const { page, limit, offset } = (0, paginationHelper_1.parsePagination)(req.query);
        const search = req.query.search ? String(req.query.search) : "";
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.customers.userId, userId)];
        if (search) {
            conditions.push((0, drizzle_orm_1.sql) `(${schema_1.customers.name} LIKE ${"%" + search + "%"} OR ${schema_1.customers.email} LIKE ${"%" + search + "%"} OR ${schema_1.customers.location} LIKE ${"%" + search + "%"})`);
        }
        const [rows, countResult] = await Promise.all([
            db_1.db.select()
                .from(schema_1.customers)
                .where((0, drizzle_orm_1.and)(...conditions))
                .limit(limit)
                .offset(offset),
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema_1.customers)
                .where((0, drizzle_orm_1.and)(...conditions)),
        ]);
        const total = Number(countResult[0]?.count ?? 0);
        res.status(200).json((0, paginationHelper_1.paginatedResponse)(rows, total, page, limit));
    }
    catch (error) {
        console.error("Error fetching customers:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getCustomers = getCustomers;
// GET /api/customers/:id  — single customer (must belong to current user)
const getCustomerById = async (req, res) => {
    try {
        const userId = requireUser(req, res);
        if (!userId)
            return;
        const id = paramStr(req.params.id);
        const rows = await db_1.db
            .select()
            .from(schema_1.customers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.customers.id, id), (0, drizzle_orm_1.eq)(schema_1.customers.userId, userId)))
            .limit(1);
        if (!rows.length) {
            res.status(404).json({ message: "Customer not found" });
            return;
        }
        res.status(200).json(rows[0]);
    }
    catch (error) {
        console.error("Error fetching customer:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getCustomerById = getCustomerById;
// POST /api/customers  — create (userId stamped automatically from JWT token)
const createCustomer = async (req, res) => {
    try {
        const userId = requireUser(req, res);
        if (!userId)
            return;
        const { name, email, location, orders, spent, rating, avatar, purchasedProducts } = req.body;
        if (!name || !email) {
            res.status(400).json({ message: "Name and email are required" });
            return;
        }
        const id = crypto_1.default.randomUUID();
        await db_1.db.insert(schema_1.customers).values({
            id,
            userId, // ← from JWT, not from client
            name: String(name).trim(),
            email: String(email).trim().toLowerCase(),
            location: location ? String(location).trim() : null,
            orders: orders !== undefined ? Number(orders) : 0,
            spent: spent ? String(spent) : "$ 0",
            rating: rating !== undefined && rating !== null ? String(rating) : null,
            avatar: avatar ? String(avatar).trim() : null,
            purchasedProducts: purchasedProducts ?? [],
        });
        await db_1.db.insert(schema_1.activityLogs).values({
            userId,
            actionType: "CREATE_CUSTOMER",
            entityId: id,
            entityDetails: { name, email },
        });
        res.status(201).json({ message: "Customer created successfully", id });
    }
    catch (error) {
        console.error("Error creating customer:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.createCustomer = createCustomer;
// PUT /api/customers/:id  — update (only owner can update)
const updateCustomer = async (req, res) => {
    try {
        const userId = requireUser(req, res);
        if (!userId)
            return;
        const id = paramStr(req.params.id);
        const { name, email, location, orders, spent, rating, avatar, purchasedProducts } = req.body;
        const existing = await db_1.db
            .select()
            .from(schema_1.customers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.customers.id, id), (0, drizzle_orm_1.eq)(schema_1.customers.userId, userId)))
            .limit(1);
        if (!existing.length) {
            res.status(404).json({ message: "Customer not found or unauthorized" });
            return;
        }
        // Build a typed partial update — Drizzle requires the shape to match the table
        const updateData = {};
        if (name !== undefined)
            updateData.name = String(name).trim();
        if (email !== undefined)
            updateData.email = String(email).trim().toLowerCase();
        if (location !== undefined)
            updateData.location = location ? String(location).trim() : null;
        if (orders !== undefined)
            updateData.orders = Number(orders);
        if (spent !== undefined)
            updateData.spent = String(spent);
        if (rating !== undefined)
            updateData.rating = rating !== null ? String(rating) : null;
        if (avatar !== undefined)
            updateData.avatar = avatar ? String(avatar).trim() : null;
        if (purchasedProducts !== undefined)
            updateData.purchasedProducts = purchasedProducts;
        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ message: "No fields to update" });
            return;
        }
        await db_1.db
            .update(schema_1.customers)
            .set(updateData)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.customers.id, id), (0, drizzle_orm_1.eq)(schema_1.customers.userId, userId)));
        await db_1.db.insert(schema_1.activityLogs).values({
            userId,
            actionType: "UPDATE_CUSTOMER",
            entityId: id,
            entityDetails: updateData,
        });
        res.status(200).json({ message: "Customer updated successfully" });
    }
    catch (error) {
        console.error("Error updating customer:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateCustomer = updateCustomer;
// DELETE /api/customers/:id  — delete (only owner can delete)
const deleteCustomer = async (req, res) => {
    try {
        const userId = requireUser(req, res);
        if (!userId)
            return;
        const id = paramStr(req.params.id);
        const existing = await db_1.db
            .select()
            .from(schema_1.customers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.customers.id, id), (0, drizzle_orm_1.eq)(schema_1.customers.userId, userId)))
            .limit(1);
        if (!existing.length) {
            res.status(404).json({ message: "Customer not found or unauthorized" });
            return;
        }
        await db_1.db
            .delete(schema_1.customers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.customers.id, id), (0, drizzle_orm_1.eq)(schema_1.customers.userId, userId)));
        await db_1.db.insert(schema_1.activityLogs).values({
            userId,
            actionType: "DELETE_CUSTOMER",
            entityId: id,
            entityDetails: { name: existing[0].name, email: existing[0].email },
        });
        res.status(200).json({ message: "Customer deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting customer:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.deleteCustomer = deleteCustomer;
