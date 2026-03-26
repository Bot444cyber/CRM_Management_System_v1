import { Request, Response } from "express";
import { db } from "../config/db";
import { projectMilestones, activityLogs } from "../db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { hasManagerialAccess } from "./team.controller";

export const getProjectMilestones = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const rows = await db.select().from(projectMilestones).where(eq(projectMilestones.projectId, id as string));
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching milestones:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const createProjectMilestone = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description, dueDate } = req.body;
        const requesterId = req.user?.userId;

        if (!requesterId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (!(await hasManagerialAccess(id as string, requesterId))) {
            res.status(403).json({ message: "Forbidden: Management rights required" });
            return;
        }

        if (!name) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        const milestoneId = crypto.randomUUID();
        await db.insert(projectMilestones).values({
            id: milestoneId,
            projectId: id as string,
            name,
            description: description || null,
            dueDate: dueDate ? new Date(dueDate) : null,
        });

        res.status(201).json({ message: "Milestone created", id: milestoneId });
    } catch (error) {
        console.error("Error creating milestone:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateProjectMilestone = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, milestoneId } = req.params;
        const { status, progress } = req.body;

        await db.update(projectMilestones).set({
            ...(status ? { status } : {}),
            ...(progress !== undefined ? { progress } : {})
        }).where(eq(projectMilestones.id, milestoneId as string));

        // Pulse Event on Status Update
        if (status) {


            if (status === "Completed") {
                const userId = req.user?.userId;
                if (userId) {
                    await db.insert(activityLogs).values({
                        userId,
                        actionType: 'MILESTONE_COMPLETED',
                        entityId: milestoneId as string,
                        entityDetails: { projectId: id, status, progress }
                    });
                }
            }
        }

        res.status(200).json({ message: "Milestone updated" });
    } catch (error) {
        console.error("Error updating milestone:", error);
        res.status(500).json({ message: "Server error" });
    }
};
