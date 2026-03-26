"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInventoryProjects = exports.deleteInventory = exports.updateInventory = exports.createInventory = exports.getInventories = void 0;
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
const paginationHelper_1 = require("../utils/paginationHelper");
const getInventories = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { page, limit, offset } = (0, paginationHelper_1.parsePagination)(req.query);
        const [rows, countResult] = await Promise.all([
            db_1.db.select().from(schema_1.inventories).where((0, drizzle_orm_1.eq)(schema_1.inventories.userId, userId)).limit(limit).offset(offset),
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.inventories).where((0, drizzle_orm_1.eq)(schema_1.inventories.userId, userId)),
        ]);
        const total = Number(countResult[0]?.count ?? 0);
        // Ensure JSON columns are parsed before sending to frontend
        const parsedRows = rows.map(r => {
            let parsedMain = r.mainProducts;
            while (typeof parsedMain === 'string') {
                try {
                    parsedMain = JSON.parse(parsedMain);
                }
                catch (e) {
                    parsedMain = [];
                    break;
                }
            }
            if (!Array.isArray(parsedMain))
                parsedMain = [];
            let parsedSub = r.subProducts;
            while (typeof parsedSub === 'string') {
                try {
                    parsedSub = JSON.parse(parsedSub);
                }
                catch (e) {
                    parsedSub = [];
                    break;
                }
            }
            if (!Array.isArray(parsedSub))
                parsedSub = [];
            return {
                ...r,
                mainProducts: parsedMain || [],
                subProducts: parsedSub || []
            };
        });
        res.status(200).json((0, paginationHelper_1.paginatedResponse)(parsedRows, total, page, limit));
    }
    catch (error) {
        console.error("Error fetching inventories:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getInventories = getInventories;
const createInventory = async (req, res) => {
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
        const existing = await db_1.db.select().from(schema_1.inventories).where((0, drizzle_orm_1.eq)(schema_1.inventories.userId, userId));
        if (existing.length >= 5) {
            res.status(403).json({ message: "Maximum of 5 inventories reached" });
            return;
        }
        await db_1.db.insert(schema_1.inventories).values({
            id,
            userId,
            name,
            imageUrl: imageUrl || null,
            mainProducts: JSON.stringify(mainProducts || []),
            // Legacy columns with safe defaults
            mainProduct: "",
            subProducts: JSON.stringify([]),
        });
        // Log initial products to analytics
        const totalProducts = (mainProducts || []).reduce((acc, mp) => acc + (mp.subProducts?.length || 0), 0);
        await db_1.db.insert(schema_1.analytics).values({
            id: crypto_1.default.randomUUID(),
            userId,
            name: id,
            value: totalProducts,
        });
        // Insert silent activity log
        await db_1.db.insert(schema_1.activityLogs).values({
            userId,
            actionType: 'CREATE_INVENTORY',
            entityId: id,
            entityDetails: { name },
        });
        res.status(201).json({ message: "Inventory created successfully" });
    }
    catch (error) {
        console.error("Error creating inventory:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.createInventory = createInventory;
const updateInventory = async (req, res) => {
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
        const existing = await db_1.db.select().from(schema_1.inventories).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.inventories.id, id), (0, drizzle_orm_1.eq)(schema_1.inventories.userId, userId))).limit(1);
        if (!existing.length) {
            res.status(404).json({ message: "Inventory not found or unauthorized" });
            return;
        }
        await db_1.db.update(schema_1.inventories)
            .set({
            ...(mainProducts !== undefined ? { mainProducts: JSON.stringify(mainProducts) } : {}),
            ...(imageUrl !== undefined ? { imageUrl: imageUrl || null } : {}),
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.inventories.id, id), (0, drizzle_orm_1.eq)(schema_1.inventories.userId, userId)));
        // Log new products total to analytics if products were changed
        if (mainProducts !== undefined) {
            const totalProducts = mainProducts.reduce((acc, mp) => acc + (mp.subProducts?.length || 0), 0);
            await db_1.db.insert(schema_1.analytics).values({
                id: crypto_1.default.randomUUID(),
                userId,
                name: id,
                value: totalProducts,
            });
            // Log product adjustments silently
            await db_1.db.insert(schema_1.activityLogs).values({
                userId,
                actionType: 'UPDATE_INVENTORY_PRODUCTS',
                entityId: id,
                entityDetails: { productsCount: mainProducts.length },
            });
        }
        // ── NEW TRACE CASCADING LOGIC ──
        if (mainProducts !== undefined) {
            // Figure out exactly what sub-products were removed
            let parsedExistingMain = existing[0].mainProducts;
            while (typeof parsedExistingMain === 'string') {
                try {
                    parsedExistingMain = JSON.parse(parsedExistingMain);
                }
                catch (e) {
                    parsedExistingMain = [];
                    break;
                }
            }
            if (!Array.isArray(parsedExistingMain))
                parsedExistingMain = [];
            const existingMainProducts = parsedExistingMain;
            const existingSubProducts = existingMainProducts.flatMap((mp) => mp.subProducts?.map((s) => s.name) || []);
            const incomingSubProducts = mainProducts.flatMap((mp) => mp.subProducts?.map((s) => s.name) || []);
            const deletedSubProductNames = existingSubProducts.filter((name) => !incomingSubProducts.includes(name));
            if (deletedSubProductNames.length > 0) {
                // Fetch all customers for this user
                const { customers } = await Promise.resolve().then(() => __importStar(require("../db/schema")));
                const userCustomers = await db_1.db.select().from(customers).where((0, drizzle_orm_1.eq)(customers.userId, userId));
                for (const customer of userCustomers) {
                    const purchased = customer.purchasedProducts || [];
                    // Filter out any purchase that belongs to this inventory AND matches the newly deleted product names
                    const updatedPurchased = purchased.filter(p => !(p.inventoryId === id && deletedSubProductNames.includes(p.subProductName)));
                    if (updatedPurchased.length !== purchased.length) {
                        await db_1.db.update(customers).set({ purchasedProducts: updatedPurchased }).where((0, drizzle_orm_1.eq)(customers.id, customer.id));
                    }
                }
            }
        }
        res.status(200).json({ message: "Inventory updated successfully" });
    }
    catch (error) {
        console.error("Error updating inventory:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateInventory = updateInventory;
const deleteInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const existing = await db_1.db.select().from(schema_1.inventories).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.inventories.id, id), (0, drizzle_orm_1.eq)(schema_1.inventories.userId, userId))).limit(1);
        if (!existing.length) {
            res.status(404).json({ message: "Inventory not found or unauthorized" });
            return;
        }
        await db_1.db.delete(schema_1.inventories).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.inventories.id, id), (0, drizzle_orm_1.eq)(schema_1.inventories.userId, userId)));
        // Also clean up analytics related to this inventory
        await db_1.db.delete(schema_1.analytics).where((0, drizzle_orm_1.eq)(schema_1.analytics.name, id));
        // Background log cleanup
        await db_1.db.insert(schema_1.activityLogs).values({
            userId,
            actionType: 'DELETE_INVENTORY',
            entityId: id,
            entityDetails: { name: existing[0].name },
        });
        // ── NEW CASCADING LOGIC ──
        // Clean orphaned customer purchases linked to this deleted inventory grid
        const { customers } = await Promise.resolve().then(() => __importStar(require("../db/schema")));
        const userCustomers = await db_1.db.select().from(customers).where((0, drizzle_orm_1.eq)(customers.userId, userId));
        for (const customer of userCustomers) {
            let purchased = customer.purchasedProducts;
            while (typeof purchased === 'string') {
                try {
                    purchased = JSON.parse(purchased);
                }
                catch (e) {
                    purchased = [];
                    break;
                }
            }
            if (!Array.isArray(purchased)) {
                purchased = [];
            }
            const updatedPurchased = purchased.filter((p) => p.inventoryId !== id);
            if (updatedPurchased.length !== purchased.length) {
                await db_1.db.update(customers).set({ purchasedProducts: updatedPurchased }).where((0, drizzle_orm_1.eq)(customers.id, customer.id));
            }
        }
        res.status(200).json({ message: "Inventory deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting inventory:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.deleteInventory = deleteInventory;
const getInventoryProjects = async (req, res) => {
    try {
        const { id } = req.params;
        const { projectInventory, projects } = await Promise.resolve().then(() => __importStar(require("../db/schema")));
        // Find all reservations for this inventory ID
        const links = await db_1.db.select().from(projectInventory).where((0, drizzle_orm_1.eq)(projectInventory.inventoryId, id));
        if (!links.length) {
            res.status(200).json([]);
            return;
        }
        const result = [];
        for (const link of links) {
            // Fetch associated project
            const prj = await db_1.db.select().from(projects).where((0, drizzle_orm_1.eq)(projects.id, link.projectId)).limit(1);
            if (prj.length) {
                result.push({
                    ...prj[0],
                    usedAs: link.subProductName,
                    reservedQuantity: link.reservedQuantity,
                    requiredQuantity: link.requiredQuantity
                });
            }
        }
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error fetching inventory projects:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getInventoryProjects = getInventoryProjects;
