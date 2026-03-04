import { Request, Response } from "express";
import { db } from "../config/db";
import { inventories, analytics, activityLogs } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import crypto from "crypto";
import { parsePagination, paginatedResponse } from "../utils/paginationHelper";

export const getInventories = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { page, limit, offset } = parsePagination(req.query);

        const [rows, countResult] = await Promise.all([
            db.select().from(inventories).where(eq(inventories.userId, userId)).limit(limit).offset(offset),
            db.select({ count: sql<number>`count(*)` }).from(inventories).where(eq(inventories.userId, userId)),
        ]);

        const total = Number(countResult[0]?.count ?? 0);

        // Ensure JSON columns are parsed before sending to frontend
        const parsedRows = rows.map(r => {
            let parsedMain: any = r.mainProducts;
            while (typeof parsedMain === 'string') {
                try { parsedMain = JSON.parse(parsedMain); } catch (e) { parsedMain = []; break; }
            }
            if (!Array.isArray(parsedMain)) parsedMain = [];

            let parsedSub: any = r.subProducts;
            while (typeof parsedSub === 'string') {
                try { parsedSub = JSON.parse(parsedSub); } catch (e) { parsedSub = []; break; }
            }
            if (!Array.isArray(parsedSub)) parsedSub = [];
            return {
                ...r,
                mainProducts: parsedMain || [],
                subProducts: parsedSub || []
            };
        });

        res.status(200).json(paginatedResponse(parsedRows, total, page, limit));
    } catch (error) {
        console.error("Error fetching inventories:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const createInventory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, name, imageUrl, mainProducts } = req.body;

        if (!id || !name) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // Limit to 5
        const existing = await db.select().from(inventories).where(eq(inventories.userId, userId));
        if (existing.length >= 5) {
            res.status(403).json({ message: "Maximum of 5 inventories reached" });
            return;
        }

        await db.insert(inventories).values({
            id,
            userId,
            name,
            imageUrl: imageUrl || null,
            mainProducts: JSON.stringify(mainProducts || []) as any,
            // Legacy columns with safe defaults
            mainProduct: "",
            subProducts: JSON.stringify([]) as any,
        });

        // Log initial products to analytics
        const totalProducts = (mainProducts || []).reduce((acc: number, mp: any) => acc + (mp.subProducts?.length || 0), 0);
        await db.insert(analytics).values({
            id: crypto.randomUUID(),
            userId,
            name: id,
            value: totalProducts,
        });

        // Insert silent activity log
        await db.insert(activityLogs).values({
            userId,
            actionType: 'CREATE_INVENTORY',
            entityId: id as string,
            entityDetails: { name },
        });

        res.status(201).json({ message: "Inventory created successfully" });
    } catch (error) {
        console.error("Error creating inventory:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateInventory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { mainProducts, imageUrl } = req.body;

        if (!id) {
            res.status(400).json({ message: "Missing inventory ID" });
            return;
        }

        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const existing = await db.select().from(inventories).where(and(eq(inventories.id, id as string), eq(inventories.userId, userId))).limit(1);
        if (!existing.length) {
            res.status(404).json({ message: "Inventory not found or unauthorized" });
            return;
        }

        await db.update(inventories)
            .set({
                ...(mainProducts !== undefined ? { mainProducts: JSON.stringify(mainProducts) as any } : {}),
                ...(imageUrl !== undefined ? { imageUrl: imageUrl || null } : {}),
            })
            .where(and(eq(inventories.id, id as string), eq(inventories.userId, userId)));

        // Log new products total to analytics if products were changed
        if (mainProducts !== undefined) {
            const totalProducts = mainProducts.reduce((acc: number, mp: any) => acc + (mp.subProducts?.length || 0), 0);
            await db.insert(analytics).values({
                id: crypto.randomUUID(),
                userId,
                name: id as string,
                value: totalProducts,
            });

            // Log product adjustments silently
            await db.insert(activityLogs).values({
                userId,
                actionType: 'UPDATE_INVENTORY_PRODUCTS',
                entityId: id as string,
                entityDetails: { productsCount: mainProducts.length },
            });
        }

        // ── NEW TRACE CASCADING LOGIC ──
        if (mainProducts !== undefined) {
            // Figure out exactly what sub-products were removed
            let parsedExistingMain: any = existing[0].mainProducts;
            while (typeof parsedExistingMain === 'string') {
                try { parsedExistingMain = JSON.parse(parsedExistingMain); } catch (e) { parsedExistingMain = []; break; }
            }
            if (!Array.isArray(parsedExistingMain)) parsedExistingMain = [];

            const existingMainProducts = parsedExistingMain;
            const existingSubProducts = existingMainProducts.flatMap((mp: any) => mp.subProducts?.map((s: any) => s.name) || []);
            const incomingSubProducts = mainProducts.flatMap((mp: any) => mp.subProducts?.map((s: any) => s.name) || []);

            const deletedSubProductNames = existingSubProducts.filter((name: string) => !incomingSubProducts.includes(name));

            if (deletedSubProductNames.length > 0) {
                // Fetch all customers for this user
                const { customers } = await import("../db/schema");
                const userCustomers = await db.select().from(customers).where(eq(customers.userId, userId));

                for (const customer of userCustomers) {
                    const purchased = customer.purchasedProducts || [];
                    // Filter out any purchase that belongs to this inventory AND matches the newly deleted product names
                    const updatedPurchased = purchased.filter(p => !(p.inventoryId === id && deletedSubProductNames.includes(p.subProductName)));

                    if (updatedPurchased.length !== purchased.length) {
                        await db.update(customers).set({ purchasedProducts: updatedPurchased }).where(eq(customers.id, customer.id));
                    }
                }
            }
        }

        res.status(200).json({ message: "Inventory updated successfully" });
    } catch (error) {
        console.error("Error updating inventory:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteInventory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const existing = await db.select().from(inventories).where(and(eq(inventories.id, id as string), eq(inventories.userId, userId))).limit(1);
        if (!existing.length) {
            res.status(404).json({ message: "Inventory not found or unauthorized" });
            return;
        }

        await db.delete(inventories).where(and(eq(inventories.id, id as string), eq(inventories.userId, userId)));
        // Also clean up analytics related to this inventory
        await db.delete(analytics).where(eq(analytics.name, id as string));

        // Background log cleanup
        await db.insert(activityLogs).values({
            userId,
            actionType: 'DELETE_INVENTORY',
            entityId: id as string,
            entityDetails: { name: existing[0].name },
        });

        // ── NEW CASCADING LOGIC ──
        // Clean orphaned customer purchases linked to this deleted inventory grid
        const { customers } = await import("../db/schema");
        const userCustomers = await db.select().from(customers).where(eq(customers.userId, userId));

        for (const customer of userCustomers) {
            let purchased: any = customer.purchasedProducts;
            while (typeof purchased === 'string') {
                try { purchased = JSON.parse(purchased); } catch (e) { purchased = []; break; }
            }
            if (!Array.isArray(purchased)) {
                purchased = [];
            }

            const updatedPurchased = purchased.filter((p: any) => p.inventoryId !== id);

            if (updatedPurchased.length !== purchased.length) {
                await db.update(customers).set({ purchasedProducts: updatedPurchased }).where(eq(customers.id, customer.id));
            }
        }

        res.status(200).json({ message: "Inventory deleted successfully" });
    } catch (error) {
        console.error("Error deleting inventory:", error);
        res.status(500).json({ message: "Server error" });
    }
};
