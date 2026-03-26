import { Request, Response } from "express";
import { db } from "../config/db";
import { projectReminders } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import crypto from "crypto";

export const getProjectReminders = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // projectId
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const rows = await db.select().from(projectReminders)
            .where(and(eq(projectReminders.projectId, id as string), eq(projectReminders.userId, userId)))
            .orderBy(desc(projectReminders.createdAt));
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching reminders:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getAllUserReminders = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const rows = await db.select().from(projectReminders)
            .where(eq(projectReminders.userId, userId))
            .orderBy(desc(projectReminders.createdAt));
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching global reminders:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const createReminder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // projectId
        const { title, message, dueDate } = req.body;
        const userId = req.user?.userId;

        if (!title || !message || !userId) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        const reminderId = crypto.randomUUID();
        const newReminder = {
            id: reminderId,
            projectId: id as string,
            userId,
            title,
            message,
            dueDate: dueDate ? new Date(dueDate) : null,
            isRead: false,
            createdAt: new Date()
        };

        await db.insert(projectReminders).values(newReminder);



        res.status(201).json(newReminder);
    } catch (error) {
        console.error("Error creating reminder:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const markReminderAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const { reminderId } = req.params;
        await db.update(projectReminders)
            .set({ isRead: true })
            .where(eq(projectReminders.id, reminderId as string));
        res.status(200).json({ message: "Reminder marked as read" });
    } catch (error) {
        console.error("Error updating reminder:", error);
        res.status(500).json({ message: "Server error" });
    }
};
