import { Request, Response } from "express";
import { db } from "../config/db";
import { projectPulse } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

export const getProjectPulse = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // projectId
        const rows = await db.select().from(projectPulse)
            .where(eq(projectPulse.projectId, id as string))
            .orderBy(desc(projectPulse.time));
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching project pulse:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const createPulseEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // projectId
        const { type, title, message } = req.body;

        if (!type || !title || !message) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        const pulseId = crypto.randomUUID();
        const newEvent = {
            id: pulseId,
            projectId: id as string,
            type,
            title,
            message,
            time: new Date()
        };

        await db.insert(projectPulse).values(newEvent);



        res.status(201).json(newEvent);
    } catch (error) {
        console.error("Error creating pulse event:", error);
        res.status(500).json({ message: "Server error" });
    }
};
