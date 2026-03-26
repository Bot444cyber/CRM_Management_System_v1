import { Request, Response } from "express";
import { db } from "../config/db";
import { users } from "../db/schema";
import { like, or } from "drizzle-orm";

export const searchUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== "string") {
            res.status(200).json([]);
            return;
        }

        const query = `%${q}%`;
        const results = await db
            .select({
                id: users.id,
                email: users.email,
                role: users.role,
            })
            .from(users)
            .where(
                or(
                    like(users.email, query),
                )
            )
            .limit(10);

        res.status(200).json(results);
    } catch (error) {
        console.error("Error searching users:", error);
        res.status(500).json({ message: "Server error" });
    }
};
