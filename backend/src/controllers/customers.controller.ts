import { Request, Response } from "express";
import { db } from "../config/db";
import { customers, activityLogs } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import crypto from "crypto";
import { parsePagination, paginatedResponse } from "../utils/paginationHelper";

// ── helpers ──────────────────────────────────────────────────────────────────

/** Extracts userId from JWT; sends 401 and returns null if missing. */
function requireUser(req: Request, res: Response): number | null {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return null;
    }
    return userId;
}

/** Safely coerces req.params value to string. */
function paramStr(val: string | string[]): string {
    return Array.isArray(val) ? val[0] : val;
}

// GET /api/customers  — paginated list (scoped to current user)
export const getCustomers = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = requireUser(req, res);
        if (!userId) return;

        const { page, limit, offset } = parsePagination(req.query);
        const search = req.query.search ? String(req.query.search) : "";

        const conditions = [eq(customers.userId, userId)];

        if (search) {
            conditions.push(
                sql`(${customers.name} LIKE ${"%" + search + "%"} OR ${customers.email} LIKE ${"%" + search + "%"} OR ${customers.location} LIKE ${"%" + search + "%"})`
            );
        }

        const [rows, countResult] = await Promise.all([
            db.select()
                .from(customers)
                .where(and(...conditions))
                .limit(limit)
                .offset(offset),
            db.select({ count: sql<number>`count(*)` })
                .from(customers)
                .where(and(...conditions)),
        ]);

        const total = Number(countResult[0]?.count ?? 0);
        res.status(200).json(paginatedResponse(rows, total, page, limit));
    } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// GET /api/customers/:id  — single customer (must belong to current user)
export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = requireUser(req, res);
        if (!userId) return;

        const id = paramStr(req.params.id);

        const rows = await db
            .select()
            .from(customers)
            .where(and(eq(customers.id, id), eq(customers.userId, userId)))
            .limit(1);

        if (!rows.length) {
            res.status(404).json({ message: "Customer not found" });
            return;
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Error fetching customer:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// POST /api/customers  — create (userId stamped automatically from JWT token)
export const createCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = requireUser(req, res);
        if (!userId) return;

        const { name, email, location, orders, spent, rating, avatar, purchasedProducts } = req.body;

        if (!name || !email) {
            res.status(400).json({ message: "Name and email are required" });
            return;
        }

        const id = crypto.randomUUID();

        await db.insert(customers).values({
            id,
            userId,                                            // ← from JWT, not from client
            name: String(name).trim(),
            email: String(email).trim().toLowerCase(),
            location: location ? String(location).trim() : null,
            orders: orders !== undefined ? Number(orders) : 0,
            spent: spent ? String(spent) : "$ 0",
            rating: rating !== undefined && rating !== null ? String(rating) : null,
            avatar: avatar ? String(avatar).trim() : null,
            purchasedProducts: purchasedProducts ?? [],
        });

        await db.insert(activityLogs).values({
            userId,
            actionType: "CREATE_CUSTOMER",
            entityId: id,
            entityDetails: { name, email },
        });

        res.status(201).json({ message: "Customer created successfully", id });
    } catch (error) {
        console.error("Error creating customer:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// PUT /api/customers/:id  — update (only owner can update)
export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = requireUser(req, res);
        if (!userId) return;

        const id = paramStr(req.params.id);
        const { name, email, location, orders, spent, rating, avatar, purchasedProducts } = req.body;

        const existing = await db
            .select()
            .from(customers)
            .where(and(eq(customers.id, id), eq(customers.userId, userId)))
            .limit(1);

        if (!existing.length) {
            res.status(404).json({ message: "Customer not found or unauthorized" });
            return;
        }

        // Build a typed partial update — Drizzle requires the shape to match the table
        const updateData: {
            name?: string;
            email?: string;
            location?: string | null;
            orders?: number;
            spent?: string;
            rating?: string | null;
            avatar?: string | null;
            purchasedProducts?: typeof existing[0]["purchasedProducts"];
        } = {};

        if (name !== undefined) updateData.name = String(name).trim();
        if (email !== undefined) updateData.email = String(email).trim().toLowerCase();
        if (location !== undefined) updateData.location = location ? String(location).trim() : null;
        if (orders !== undefined) updateData.orders = Number(orders);
        if (spent !== undefined) updateData.spent = String(spent);
        if (rating !== undefined) updateData.rating = rating !== null ? String(rating) : null;
        if (avatar !== undefined) updateData.avatar = avatar ? String(avatar).trim() : null;
        if (purchasedProducts !== undefined) updateData.purchasedProducts = purchasedProducts;

        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ message: "No fields to update" });
            return;
        }

        await db
            .update(customers)
            .set(updateData)
            .where(and(eq(customers.id, id), eq(customers.userId, userId)));

        await db.insert(activityLogs).values({
            userId,
            actionType: "UPDATE_CUSTOMER",
            entityId: id,
            entityDetails: updateData as Record<string, unknown>,
        });

        res.status(200).json({ message: "Customer updated successfully" });
    } catch (error) {
        console.error("Error updating customer:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// DELETE /api/customers/:id  — delete (only owner can delete)
export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = requireUser(req, res);
        if (!userId) return;

        const id = paramStr(req.params.id);

        const existing = await db
            .select()
            .from(customers)
            .where(and(eq(customers.id, id), eq(customers.userId, userId)))
            .limit(1);

        if (!existing.length) {
            res.status(404).json({ message: "Customer not found or unauthorized" });
            return;
        }

        await db
            .delete(customers)
            .where(and(eq(customers.id, id), eq(customers.userId, userId)));

        await db.insert(activityLogs).values({
            userId,
            actionType: "DELETE_CUSTOMER",
            entityId: id,
            entityDetails: { name: existing[0].name, email: existing[0].email },
        });

        res.status(200).json({ message: "Customer deleted successfully" });
    } catch (error) {
        console.error("Error deleting customer:", error);
        res.status(500).json({ message: "Server error" });
    }
};
