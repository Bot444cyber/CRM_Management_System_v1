import { Request, Response } from "express";
import { db } from "../config/db";
import { projectInventory, resourceRequests, activityLogs } from "../db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export const reserveInventory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // projectId
        const { inventoryId, subProductName, requiredQuantity } = req.body;

        if (!inventoryId || !subProductName || !requiredQuantity) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        const invId = crypto.randomUUID();
        await db.insert(projectInventory).values({
            id: invId,
            projectId: id as string,
            inventoryId: inventoryId as string,
            subProductName: subProductName as string,
            requiredQuantity: Number(requiredQuantity)
        });

        res.status(201).json({ message: "Inventory reserved successfully", id: invId });
    } catch (error) {
        console.error("Error reserving inventory:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getResourceRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const rows = await db.select().from(resourceRequests).where(eq(resourceRequests.projectId, id as string));
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching resource requests:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const createResourceRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { inventoryId, subProductName, requestedQuantity } = req.body;
        const userId = req.user?.userId;

        if (!inventoryId || !subProductName || !requestedQuantity || !userId) {
            res.status(400).json({ message: "Missing required fields or unauthorized" });
            return;
        }

        const reqId = crypto.randomUUID();
        await db.insert(resourceRequests).values({
            id: reqId,
            projectId: id as string,
            inventoryId: inventoryId as string,
            subProductName: subProductName as string,
            requestedQuantity: Number(requestedQuantity),
            requestedByUserId: userId
        });

        // Pulse: Resource requested
        await db.insert(activityLogs).values({
            userId,
            actionType: 'RESOURCE_REQUESTED',
            entityId: reqId,
            entityDetails: { projectId: id, inventoryId, subProductName, requestedQuantity, priority: "Action Needed" }
        });


        res.status(201).json({ message: "Resource request submitted", id: reqId });
    } catch (error) {
        console.error("Error submitting resource request:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const processResourceRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, requestId } = req.params;
        const { status } = req.body; // 'Approved' or 'Denied'
        const userId = req.user?.userId;

        if (!status || !userId) {
            res.status(400).json({ message: "Missing required fields or unauthorized" });
            return;
        }

        const reqRows = await db.select().from(resourceRequests).where(eq(resourceRequests.id, requestId as string)).limit(1);
        if (!reqRows.length) {
            res.status(404).json({ message: "Request not found" });
            return;
        }

        const rRequest = reqRows[0];

        await db.update(resourceRequests).set({
            status,
            processedAt: new Date()
        }).where(eq(resourceRequests.id, requestId as string));

        if (status === "Approved") {
            const existingLinks = await db.select().from(projectInventory)
                .where(and(eq(projectInventory.projectId, id as string), eq(projectInventory.inventoryId, rRequest.inventoryId), eq(projectInventory.subProductName, rRequest.subProductName)))
                .limit(1);

            if (existingLinks.length > 0) {
                await db.update(projectInventory)
                    .set({ requiredQuantity: existingLinks[0].requiredQuantity + rRequest.requestedQuantity })
                    .where(eq(projectInventory.id, existingLinks[0].id));
            } else {
                await db.insert(projectInventory).values({
                    id: crypto.randomUUID(),
                    projectId: id as string,
                    inventoryId: rRequest.inventoryId,
                    subProductName: rRequest.subProductName,
                    requiredQuantity: rRequest.requestedQuantity
                });
            }
        }

        // Pulse log for manager action
        await db.insert(activityLogs).values({
            userId,
            actionType: `RESOURCE_REQUEST_${status.toUpperCase()}`,
            entityId: requestId as string,
            entityDetails: { projectId: id, status, subProductName: rRequest.subProductName }
        });


        res.status(200).json({ message: `Request ${status}` });
    } catch (error) {
        console.error("Error processing resource request:", error);
        res.status(500).json({ message: "Server error" });
    }
};
