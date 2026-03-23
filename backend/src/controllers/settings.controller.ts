import { Request, Response } from "express";
import { db } from "../config/db";
import { inventories, customers, analytics, activityLogs, users } from "../db/schema";
import { eq, sql } from "drizzle-orm";

export const wipeData = async (req: Request, res: Response): Promise<void> => {
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
        await db.execute(sql`SET FOREIGN_KEY_CHECKS=0`);

        try {
            // 1. Delete Activity Logs
            await db.delete(activityLogs).where(eq(activityLogs.userId, userId));

            // 2. Delete Analytics
            await db.delete(analytics).where(eq(analytics.userId, userId));

            // 3. Delete Customers
            await db.delete(customers).where(eq(customers.userId, userId));

            // 4. Delete Inventories
            await db.delete(inventories).where(eq(inventories.userId, userId));
        } finally {
            // Always re-enable FK checks even if something failed
            await db.execute(sql`SET FOREIGN_KEY_CHECKS=1`);
        }

        res.status(200).json({ message: "Workspace data wiped successfully" });
    } catch (error) {
        console.error("============= ERROR IN WIPE DATA =============");
        console.error("User ID:", req.user?.userId);
        console.error("Error Message:", error instanceof Error ? error.message : "Unknown Error");
        console.error("Full Trace:", error);
        console.error("==============================================");
        res.status(500).json({ message: "Server error", detail: error instanceof Error ? error.message : "Unknown" });
    }
};

export const getGreenAPI = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const userRecord = await db.select({
            greenApiInstanceId: users.greenApiInstanceId,
            greenApiToken: users.greenApiToken
        }).from(users).where(eq(users.id, userId)).limit(1);

        if (userRecord.length === 0) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json(userRecord[0]);
    } catch (error) {
        console.error("Error fetching GreenAPI settings:", error);
        res.status(500).json({ message: "Server error", detail: error instanceof Error ? error.message : "Unknown" });
    }
};

export const updateGreenAPI = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { greenApiInstanceId, greenApiToken } = req.body;

        await db.update(users)
            .set({
                greenApiInstanceId: greenApiInstanceId || null,
                greenApiToken: greenApiToken || null
            })
            .where(eq(users.id, userId));

        res.status(200).json({ message: "GreenAPI configuration saved successfully" });
    } catch (error) {
        console.error("Error updating GreenAPI settings:", error);
        res.status(500).json({ message: "Server error", detail: error instanceof Error ? error.message : "Unknown" });
    }
};
