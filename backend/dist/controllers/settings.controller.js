"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGreenAPI = exports.getGreenAPI = exports.wipeData = void 0;
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const wipeData = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { confirmation } = req.body;
        if (confirmation !== "DELETE MY DATA") {
            res.status(400).json({ message: "Invalid confirmation phrase" });
            return;
        }
        // Disable FK checks to safely delete across related tables
        await db_1.db.execute((0, drizzle_orm_1.sql) `SET FOREIGN_KEY_CHECKS=0`);
        try {
            // 1. Delete Activity Logs
            await db_1.db.delete(schema_1.activityLogs).where((0, drizzle_orm_1.eq)(schema_1.activityLogs.userId, userId));
            // 2. Delete Analytics
            await db_1.db.delete(schema_1.analytics).where((0, drizzle_orm_1.eq)(schema_1.analytics.userId, userId));
            // 3. Delete Customers
            await db_1.db.delete(schema_1.customers).where((0, drizzle_orm_1.eq)(schema_1.customers.userId, userId));
            // 4. Delete Inventories
            await db_1.db.delete(schema_1.inventories).where((0, drizzle_orm_1.eq)(schema_1.inventories.userId, userId));
        }
        finally {
            // Always re-enable FK checks even if something failed
            await db_1.db.execute((0, drizzle_orm_1.sql) `SET FOREIGN_KEY_CHECKS=1`);
        }
        res.status(200).json({ message: "Workspace data wiped successfully" });
    }
    catch (error) {
        console.error("============= ERROR IN WIPE DATA =============");
        console.error("User ID:", req.user?.userId);
        console.error("Error Message:", error instanceof Error ? error.message : "Unknown Error");
        console.error("Full Trace:", error);
        console.error("==============================================");
        res.status(500).json({ message: "Server error", detail: error instanceof Error ? error.message : "Unknown" });
    }
};
exports.wipeData = wipeData;
const getGreenAPI = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const userRecord = await db_1.db.select({
            greenApiInstanceId: schema_1.users.greenApiInstanceId,
            greenApiToken: schema_1.users.greenApiToken
        }).from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId)).limit(1);
        if (userRecord.length === 0) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(userRecord[0]);
    }
    catch (error) {
        console.error("Error fetching GreenAPI settings:", error);
        res.status(500).json({ message: "Server error", detail: error instanceof Error ? error.message : "Unknown" });
    }
};
exports.getGreenAPI = getGreenAPI;
const updateGreenAPI = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { greenApiInstanceId, greenApiToken } = req.body;
        await db_1.db.update(schema_1.users)
            .set({
            greenApiInstanceId: greenApiInstanceId || null,
            greenApiToken: greenApiToken || null
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
        res.status(200).json({ message: "GreenAPI configuration saved successfully" });
    }
    catch (error) {
        console.error("Error updating GreenAPI settings:", error);
        res.status(500).json({ message: "Server error", detail: error instanceof Error ? error.message : "Unknown" });
    }
};
exports.updateGreenAPI = updateGreenAPI;
