import { Request, Response } from "express";
import { db } from "../config/db";
import { workspaces, projects, projectInventory, inventories, projectMilestones, resourceRequests, activityLogs, projectPulse, projectMembers } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import crypto from "crypto";

export const getWorkspaces = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const rows = await db.select().from(workspaces).where(eq(workspaces.userId, userId));
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching workspaces:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const createWorkspace = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const id = crypto.randomUUID();
        await db.insert(workspaces).values({ id, userId, name });

        res.status(201).json({ message: "Workspace created successfully", id });
    } catch (error) {
        console.error("Error creating workspace:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
    try {
        const { workspaceId, name, description, deadline } = req.body;
        if (!workspaceId || !name) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // Verify workspace ownership
        const ws = await db.select().from(workspaces).where(and(eq(workspaces.id, String(workspaceId)), eq(workspaces.userId, Number(userId)))).limit(1);
        if (ws.length === 0) {
            res.status(403).json({ message: "Forbidden: You do not own this workspace" });
            return;
        }

        const id = crypto.randomUUID();
        await db.insert(projects).values({
            id,
            workspaceId,
            name,
            description: description || null,
            deadline: deadline ? new Date(deadline) : null,
        });

        res.status(201).json({ message: "Project created successfully", id });
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getProjects = async (req: Request, res: Response): Promise<void> => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user?.userId;

        if (!workspaceId || !userId) {
            res.status(400).json({ message: "Missing required parameters" });
            return;
        }

        // Verify workspace access (owner)
        const ws = await db.select().from(workspaces).where(and(eq(workspaces.id, String(workspaceId)), eq(workspaces.userId, Number(userId)))).limit(1);
        if (ws.length === 0) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }

        const projectRows = await db.select().from(projects).where(eq(projects.workspaceId, workspaceId as string));

        // CEO View - Calculate health
        const result = [];
        for (const prj of projectRows) {
            // Find linked inventory requirements
            const linkedItems = await db.select().from(projectInventory).where(eq(projectInventory.projectId, prj.id));

            let health = "Green"; // Default
            let atRiskCount = 0;

            // Check resource availability
            for (const item of linkedItems) {
                const invResults = await db.select().from(inventories).where(eq(inventories.id, item.inventoryId)).limit(1);
                if (!invResults.length) {
                    atRiskCount++;
                    continue;
                }
                const inv = invResults[0];
                let mainProducts: any = inv.mainProducts;
                if (typeof mainProducts === 'string') {
                    try { mainProducts = JSON.parse(mainProducts); } catch (e) { mainProducts = []; }
                }
                if (!Array.isArray(mainProducts)) mainProducts = [];

                // Find the specific sub product
                let stock = 0;
                let found = false;
                for (const mp of mainProducts) {
                    const sp = mp.subProducts?.find((s: any) => s.name === item.subProductName);
                    if (sp) {
                        stock += (sp.stock || 0);
                        found = true;
                    }
                }

                if (!found || item.requiredQuantity > stock) {
                    atRiskCount++;
                }
            }

            if (atRiskCount > 0) {
                health = "Red"; // At Risk
            } else if (prj.deadline) {
                const daysUntilDeadline = (prj.deadline.getTime() - Date.now()) / (1000 * 3600 * 24);
                if (daysUntilDeadline < 7 && daysUntilDeadline >= 0) {
                    health = "Yellow";
                } else if (daysUntilDeadline < 0 && prj.status !== "Completed") {
                    health = "Red"; // Overdue
                }
            }

            result.push({ ...prj, health, atRiskCount });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getProjectPulse = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const logs = await db.select().from(projectPulse)
            .where(eq(projectPulse.projectId, id as string))
            .orderBy(sql`${projectPulse.time} DESC`)
            .limit(50);

        res.status(200).json(logs);
    } catch (error) {
        console.error("Error fetching pulse:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getProject = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const results = await db.select().from(projects).where(eq(projects.id, String(id))).limit(1);
        if (!results.length) {
            res.status(404).json({ message: "Project not found" });
            return;
        }

        const prj = results[0];

        // Check if user is owner of the workspace
        const ws = await db.select().from(workspaces).where(and(eq(workspaces.id, String(prj.workspaceId)), eq(workspaces.userId, Number(userId)))).limit(1);

        // OR check if user is a member of the project
        const member = await db.select().from(projectMembers).where(and(eq(projectMembers.projectId, String(id)), eq(projectMembers.userId, Number(userId)))).limit(1);

        if (ws.length === 0 && member.length === 0) {
            res.status(403).json({ message: "Forbidden: No access to this project" });
            return;
        }

        // Fetch Resource Cost
        const linkedItems = await db.select().from(projectInventory).where(eq(projectInventory.projectId, id as string));
        let totalCost = 0;
        const resourceDetails = [];

        for (const item of linkedItems) {
            const invResults = await db.select().from(inventories).where(eq(inventories.id, item.inventoryId)).limit(1);
            if (!invResults.length) continue;

            const inv = invResults[0];
            let mainProducts: any = inv.mainProducts;
            if (typeof mainProducts === 'string') {
                try { mainProducts = JSON.parse(mainProducts); } catch (e) { mainProducts = []; }
            }
            if (!Array.isArray(mainProducts)) mainProducts = [];

            let price = 0;
            let stock = 0;
            for (const mp of mainProducts) {
                const sp = mp.subProducts?.find((s: any) => s.name === item.subProductName);
                if (sp) {
                    price = parseFloat(sp.price || "0");
                    stock += (sp.stock || 0);
                }
            }

            const itemCost = price * item.requiredQuantity;
            totalCost += itemCost;

            resourceDetails.push({
                ...item,
                pricePerUnit: price,
                currentStock: stock,
                atRisk: item.requiredQuantity > stock
            });
        }

        res.status(200).json({
            ...prj,
            resources: resourceDetails,
            totalResourceCost: totalCost
        });
    } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({ message: "Server error" });
    }
};

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
        if (status === "Completed") {
            const userId = req.user?.userId;
            if (userId) {
                await db.insert(projectPulse).values({
                    id: crypto.randomUUID(),
                    projectId: id as string,
                    type: 'SUCCESS',
                    title: 'Milestone Resolved',
                    message: `A strategic vector has been fully cleared: ${id}`
                });
                await db.insert(activityLogs).values({
                    userId,
                    actionType: 'MILESTONE_COMPLETED',
                    entityId: milestoneId as string,
                    entityDetails: { projectId: id, status, progress }
                });
            }
        }

        res.status(200).json({ message: "Milestone updated" });
    } catch (error) {
        console.error("Error updating milestone:", error);
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
        await db.insert(projectPulse).values({
            id: crypto.randomUUID(),
            projectId: id as string,
            type: 'INFO',
            title: 'Resource Allocation Request',
            message: `Agent is requesting ${requestedQuantity} units of ${subProductName}`
        });

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
            // Adjust the actual project inventory (reserve the quantity)
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
        await db.insert(projectPulse).values({
            id: crypto.randomUUID(),
            projectId: id as string,
            type: status === 'Approved' ? 'SUCCESS' : 'CRITICAL',
            title: `Resource Request ${status}`,
            message: `Manager decision finalized for ${rRequest.subProductName}`
        });

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
