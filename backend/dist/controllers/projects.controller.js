"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processResourceRequest = exports.createResourceRequest = exports.getResourceRequests = exports.updateProjectMilestone = exports.createProjectMilestone = exports.getProjectMilestones = exports.reserveInventory = exports.getProject = exports.getProjectPulse = exports.getProjects = exports.createProject = exports.createWorkspace = exports.getWorkspaces = void 0;
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
const getWorkspaces = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const rows = await db_1.db.select().from(schema_1.workspaces).where((0, drizzle_orm_1.eq)(schema_1.workspaces.userId, userId));
        res.status(200).json(rows);
    }
    catch (error) {
        console.error("Error fetching workspaces:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getWorkspaces = getWorkspaces;
const createWorkspace = async (req, res) => {
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
        const id = crypto_1.default.randomUUID();
        await db_1.db.insert(schema_1.workspaces).values({ id, userId, name });
        res.status(201).json({ message: "Workspace created successfully", id });
    }
    catch (error) {
        console.error("Error creating workspace:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.createWorkspace = createWorkspace;
const createProject = async (req, res) => {
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
        const ws = await db_1.db.select().from(schema_1.workspaces).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workspaces.id, String(workspaceId)), (0, drizzle_orm_1.eq)(schema_1.workspaces.userId, Number(userId)))).limit(1);
        if (ws.length === 0) {
            res.status(403).json({ message: "Forbidden: You do not own this workspace" });
            return;
        }
        const id = crypto_1.default.randomUUID();
        await db_1.db.insert(schema_1.projects).values({
            id,
            workspaceId,
            name,
            description: description || null,
            deadline: deadline ? new Date(deadline) : null,
        });
        res.status(201).json({ message: "Project created successfully", id });
    }
    catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.createProject = createProject;
const getProjects = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user?.userId;
        if (!workspaceId || !userId) {
            res.status(400).json({ message: "Missing required parameters" });
            return;
        }
        // Verify workspace access (owner)
        const ws = await db_1.db.select().from(schema_1.workspaces).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workspaces.id, String(workspaceId)), (0, drizzle_orm_1.eq)(schema_1.workspaces.userId, Number(userId)))).limit(1);
        if (ws.length === 0) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }
        const projectRows = await db_1.db.select().from(schema_1.projects).where((0, drizzle_orm_1.eq)(schema_1.projects.workspaceId, workspaceId));
        // CEO View - Calculate health
        const result = [];
        for (const prj of projectRows) {
            // Find linked inventory requirements
            const linkedItems = await db_1.db.select().from(schema_1.projectInventory).where((0, drizzle_orm_1.eq)(schema_1.projectInventory.projectId, prj.id));
            let health = "Green"; // Default
            let atRiskCount = 0;
            // Check resource availability
            for (const item of linkedItems) {
                const invResults = await db_1.db.select().from(schema_1.inventories).where((0, drizzle_orm_1.eq)(schema_1.inventories.id, item.inventoryId)).limit(1);
                if (!invResults.length) {
                    atRiskCount++;
                    continue;
                }
                const inv = invResults[0];
                let mainProducts = inv.mainProducts;
                if (typeof mainProducts === 'string') {
                    try {
                        mainProducts = JSON.parse(mainProducts);
                    }
                    catch (e) {
                        mainProducts = [];
                    }
                }
                if (!Array.isArray(mainProducts))
                    mainProducts = [];
                // Find the specific sub product
                let stock = 0;
                let found = false;
                for (const mp of mainProducts) {
                    const sp = mp.subProducts?.find((s) => s.name === item.subProductName);
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
            }
            else if (prj.deadline) {
                const daysUntilDeadline = (prj.deadline.getTime() - Date.now()) / (1000 * 3600 * 24);
                if (daysUntilDeadline < 7 && daysUntilDeadline >= 0) {
                    health = "Yellow";
                }
                else if (daysUntilDeadline < 0 && prj.status !== "Completed") {
                    health = "Red"; // Overdue
                }
            }
            result.push({ ...prj, health, atRiskCount });
        }
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getProjects = getProjects;
const getProjectPulse = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const logs = await db_1.db.select().from(schema_1.projectPulse)
            .where((0, drizzle_orm_1.eq)(schema_1.projectPulse.projectId, id))
            .orderBy((0, drizzle_orm_1.sql) `${schema_1.projectPulse.time} DESC`)
            .limit(50);
        res.status(200).json(logs);
    }
    catch (error) {
        console.error("Error fetching pulse:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getProjectPulse = getProjectPulse;
const getProject = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const results = await db_1.db.select().from(schema_1.projects).where((0, drizzle_orm_1.eq)(schema_1.projects.id, String(id))).limit(1);
        if (!results.length) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        const prj = results[0];
        // Check if user is owner of the workspace
        const ws = await db_1.db.select().from(schema_1.workspaces).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workspaces.id, String(prj.workspaceId)), (0, drizzle_orm_1.eq)(schema_1.workspaces.userId, Number(userId)))).limit(1);
        // OR check if user is a member of the project
        const member = await db_1.db.select().from(schema_1.projectMembers).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.projectMembers.projectId, String(id)), (0, drizzle_orm_1.eq)(schema_1.projectMembers.userId, Number(userId)))).limit(1);
        if (ws.length === 0 && member.length === 0) {
            res.status(403).json({ message: "Forbidden: No access to this project" });
            return;
        }
        // Fetch Resource Cost
        const linkedItems = await db_1.db.select().from(schema_1.projectInventory).where((0, drizzle_orm_1.eq)(schema_1.projectInventory.projectId, id));
        let totalCost = 0;
        const resourceDetails = [];
        for (const item of linkedItems) {
            const invResults = await db_1.db.select().from(schema_1.inventories).where((0, drizzle_orm_1.eq)(schema_1.inventories.id, item.inventoryId)).limit(1);
            if (!invResults.length)
                continue;
            const inv = invResults[0];
            let mainProducts = inv.mainProducts;
            if (typeof mainProducts === 'string') {
                try {
                    mainProducts = JSON.parse(mainProducts);
                }
                catch (e) {
                    mainProducts = [];
                }
            }
            if (!Array.isArray(mainProducts))
                mainProducts = [];
            let price = 0;
            let stock = 0;
            for (const mp of mainProducts) {
                const sp = mp.subProducts?.find((s) => s.name === item.subProductName);
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
    }
    catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getProject = getProject;
const reserveInventory = async (req, res) => {
    try {
        const { id } = req.params; // projectId
        const { inventoryId, subProductName, requiredQuantity } = req.body;
        if (!inventoryId || !subProductName || !requiredQuantity) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        const invId = crypto_1.default.randomUUID();
        await db_1.db.insert(schema_1.projectInventory).values({
            id: invId,
            projectId: id,
            inventoryId: inventoryId,
            subProductName: subProductName,
            requiredQuantity: Number(requiredQuantity)
        });
        res.status(201).json({ message: "Inventory reserved successfully", id: invId });
    }
    catch (error) {
        console.error("Error reserving inventory:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.reserveInventory = reserveInventory;
const getProjectMilestones = async (req, res) => {
    try {
        const { id } = req.params;
        const rows = await db_1.db.select().from(schema_1.projectMilestones).where((0, drizzle_orm_1.eq)(schema_1.projectMilestones.projectId, id));
        res.status(200).json(rows);
    }
    catch (error) {
        console.error("Error fetching milestones:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getProjectMilestones = getProjectMilestones;
const createProjectMilestone = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, dueDate } = req.body;
        if (!name) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        const milestoneId = crypto_1.default.randomUUID();
        await db_1.db.insert(schema_1.projectMilestones).values({
            id: milestoneId,
            projectId: id,
            name,
            description: description || null,
            dueDate: dueDate ? new Date(dueDate) : null,
        });
        res.status(201).json({ message: "Milestone created", id: milestoneId });
    }
    catch (error) {
        console.error("Error creating milestone:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.createProjectMilestone = createProjectMilestone;
const updateProjectMilestone = async (req, res) => {
    try {
        const { id, milestoneId } = req.params;
        const { status, progress } = req.body;
        await db_1.db.update(schema_1.projectMilestones).set({
            ...(status ? { status } : {}),
            ...(progress !== undefined ? { progress } : {})
        }).where((0, drizzle_orm_1.eq)(schema_1.projectMilestones.id, milestoneId));
        // Pulse Event on Status Update
        if (status === "Completed") {
            const userId = req.user?.userId;
            if (userId) {
                await db_1.db.insert(schema_1.projectPulse).values({
                    id: crypto_1.default.randomUUID(),
                    projectId: id,
                    type: 'SUCCESS',
                    title: 'Milestone Resolved',
                    message: `A strategic vector has been fully cleared: ${id}`
                });
                await db_1.db.insert(schema_1.activityLogs).values({
                    userId,
                    actionType: 'MILESTONE_COMPLETED',
                    entityId: milestoneId,
                    entityDetails: { projectId: id, status, progress }
                });
            }
        }
        res.status(200).json({ message: "Milestone updated" });
    }
    catch (error) {
        console.error("Error updating milestone:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateProjectMilestone = updateProjectMilestone;
const getResourceRequests = async (req, res) => {
    try {
        const { id } = req.params;
        const rows = await db_1.db.select().from(schema_1.resourceRequests).where((0, drizzle_orm_1.eq)(schema_1.resourceRequests.projectId, id));
        res.status(200).json(rows);
    }
    catch (error) {
        console.error("Error fetching resource requests:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getResourceRequests = getResourceRequests;
const createResourceRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { inventoryId, subProductName, requestedQuantity } = req.body;
        const userId = req.user?.userId;
        if (!inventoryId || !subProductName || !requestedQuantity || !userId) {
            res.status(400).json({ message: "Missing required fields or unauthorized" });
            return;
        }
        const reqId = crypto_1.default.randomUUID();
        await db_1.db.insert(schema_1.resourceRequests).values({
            id: reqId,
            projectId: id,
            inventoryId: inventoryId,
            subProductName: subProductName,
            requestedQuantity: Number(requestedQuantity),
            requestedByUserId: userId
        });
        // Pulse: Resource requested
        await db_1.db.insert(schema_1.projectPulse).values({
            id: crypto_1.default.randomUUID(),
            projectId: id,
            type: 'INFO',
            title: 'Resource Allocation Request',
            message: `Agent is requesting ${requestedQuantity} units of ${subProductName}`
        });
        await db_1.db.insert(schema_1.activityLogs).values({
            userId,
            actionType: 'RESOURCE_REQUESTED',
            entityId: reqId,
            entityDetails: { projectId: id, inventoryId, subProductName, requestedQuantity, priority: "Action Needed" }
        });
        res.status(201).json({ message: "Resource request submitted", id: reqId });
    }
    catch (error) {
        console.error("Error submitting resource request:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.createResourceRequest = createResourceRequest;
const processResourceRequest = async (req, res) => {
    try {
        const { id, requestId } = req.params;
        const { status } = req.body; // 'Approved' or 'Denied'
        const userId = req.user?.userId;
        if (!status || !userId) {
            res.status(400).json({ message: "Missing required fields or unauthorized" });
            return;
        }
        const reqRows = await db_1.db.select().from(schema_1.resourceRequests).where((0, drizzle_orm_1.eq)(schema_1.resourceRequests.id, requestId)).limit(1);
        if (!reqRows.length) {
            res.status(404).json({ message: "Request not found" });
            return;
        }
        const rRequest = reqRows[0];
        await db_1.db.update(schema_1.resourceRequests).set({
            status,
            processedAt: new Date()
        }).where((0, drizzle_orm_1.eq)(schema_1.resourceRequests.id, requestId));
        if (status === "Approved") {
            // Adjust the actual project inventory (reserve the quantity)
            const existingLinks = await db_1.db.select().from(schema_1.projectInventory)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.projectInventory.projectId, id), (0, drizzle_orm_1.eq)(schema_1.projectInventory.inventoryId, rRequest.inventoryId), (0, drizzle_orm_1.eq)(schema_1.projectInventory.subProductName, rRequest.subProductName)))
                .limit(1);
            if (existingLinks.length > 0) {
                await db_1.db.update(schema_1.projectInventory)
                    .set({ requiredQuantity: existingLinks[0].requiredQuantity + rRequest.requestedQuantity })
                    .where((0, drizzle_orm_1.eq)(schema_1.projectInventory.id, existingLinks[0].id));
            }
            else {
                await db_1.db.insert(schema_1.projectInventory).values({
                    id: crypto_1.default.randomUUID(),
                    projectId: id,
                    inventoryId: rRequest.inventoryId,
                    subProductName: rRequest.subProductName,
                    requiredQuantity: rRequest.requestedQuantity
                });
            }
        }
        // Pulse log for manager action
        await db_1.db.insert(schema_1.projectPulse).values({
            id: crypto_1.default.randomUUID(),
            projectId: id,
            type: status === 'Approved' ? 'SUCCESS' : 'CRITICAL',
            title: `Resource Request ${status}`,
            message: `Manager decision finalized for ${rRequest.subProductName}`
        });
        await db_1.db.insert(schema_1.activityLogs).values({
            userId,
            actionType: `RESOURCE_REQUEST_${status.toUpperCase()}`,
            entityId: requestId,
            entityDetails: { projectId: id, status, subProductName: rRequest.subProductName }
        });
        res.status(200).json({ message: `Request ${status}` });
    }
    catch (error) {
        console.error("Error processing resource request:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.processResourceRequest = processResourceRequest;
