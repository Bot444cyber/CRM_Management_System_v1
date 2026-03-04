import { Request, Response } from "express";
import { db } from "../config/db";
import { notifications } from "../db/schema";
import { desc, sql } from "drizzle-orm";
import { parsePagination, paginatedResponse } from "../utils/paginationHelper";

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page, limit, offset } = parsePagination(req.query);

        const [rows, countResult] = await Promise.all([
            db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(limit).offset(offset),
            db.select({ count: sql<number>`count(*)` }).from(notifications),
        ]);

        const total = Number(countResult[0]?.count ?? 0);
        res.status(200).json(paginatedResponse(rows, total, page, limit));
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Server error" });
    }
};
