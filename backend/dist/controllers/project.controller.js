"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeWorkspaceMember = exports.updateWorkspaceMember = exports.getWorkspaceMembers = exports.deleteProject = exports.updateProject = exports.getProject = exports.getProjects = exports.createProject = exports.deleteWorkspace = exports.updateWorkspace = exports.getWorkspace = exports.joinWorkspace = exports.createWorkspace = exports.getWorkspaces = void 0;
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
        // Fetch workspaces where user is owner or member
        const rows = await db_1.db
            .select({
            id: schema_1.workspaces.id,
            name: schema_1.workspaces.name,
            description: schema_1.workspaces.description,
            passKey: schema_1.workspaces.passKey,
            role: schema_1.workspaceMembers.role,
            createdAt: schema_1.workspaces.createdAt
        })
            .from(schema_1.workspaces)
            .innerJoin(schema_1.workspaceMembers, (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.workspaceId, schema_1.workspaces.id))
            .where((0, drizzle_orm_1.eq)(schema_1.workspaceMembers.userId, userId));
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
        const { name, description } = req.body;
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
        // Generate a human-readable 6-digit passKey
        const passKey = Math.floor(100000 + Math.random() * 900000).toString();
        await db_1.db.insert(schema_1.workspaces).values({
            id,
            userId,
            name,
            description: description || null,
            passKey
        });
        // Add creator as owner
        await db_1.db.insert(schema_1.workspaceMembers).values({
            id: crypto_1.default.randomUUID(),
            workspaceId: id,
            userId,
            role: 'owner'
        });
        res.status(201).json({ message: "Workspace created successfully", id, passKey });
    }
    catch (error) {
        console.error("Error creating workspace:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.createWorkspace = createWorkspace;
const joinWorkspace = async (req, res) => {
    try {
        const { passKey } = req.body;
        const userId = req.user?.userId;
        if (!passKey || !userId) {
            res.status(400).json({ message: "Pass-key required" });
            return;
        }
        // Find workspace by passKey
        const ws = await db_1.db.select().from(schema_1.workspaces).where((0, drizzle_orm_1.eq)(schema_1.workspaces.passKey, passKey)).limit(1);
        if (!ws.length) {
            res.status(404).json({ message: "Invalid pass-key" });
            return;
        }
        const workspaceId = ws[0].id;
        // Check if already a member
        const existing = await db_1.db.select().from(schema_1.workspaceMembers).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workspaceMembers.workspaceId, workspaceId), (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.userId, userId))).limit(1);
        if (existing.length > 0) {
            res.status(400).json({ message: "Already a member of this workspace" });
            return;
        }
        // Join as member
        await db_1.db.insert(schema_1.workspaceMembers).values({
            id: crypto_1.default.randomUUID(),
            workspaceId,
            userId,
            role: 'member'
        });
        res.status(200).json({ message: "Joined workspace successfully", workspaceId });
    }
    catch (error) {
        console.error("Error joining workspace:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.joinWorkspace = joinWorkspace;
const getWorkspace = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const wsRows = await db_1.db.select({
            id: schema_1.workspaces.id,
            name: schema_1.workspaces.name,
            description: schema_1.workspaces.description,
            passKey: schema_1.workspaces.passKey,
            createdAt: schema_1.workspaces.createdAt,
            role: schema_1.workspaceMembers.role
        })
            .from(schema_1.workspaces)
            .innerJoin(schema_1.workspaceMembers, (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.workspaceId, schema_1.workspaces.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workspaces.id, id), (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.userId, userId)))
            .limit(1);
        if (!wsRows.length) {
            res.status(404).json({ message: "Workspace not found or access denied" });
            return;
        }
        res.status(200).json(wsRows[0]);
    }
    catch (error) {
        console.error("Error fetching workspace details:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getWorkspace = getWorkspace;
const updateWorkspace = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        // Only owner can update
        const membership = await db_1.db.select().from(schema_1.workspaceMembers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workspaceMembers.workspaceId, id), (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.userId, userId), (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.role, 'owner')))
            .limit(1);
        if (!membership.length) {
            res.status(403).json({ message: "Only workspace owners can update settings" });
            return;
        }
        await db_1.db.update(schema_1.workspaces)
            .set({
            name: name || undefined,
            description: description !== undefined ? description : undefined
        })
            .where((0, drizzle_orm_1.eq)(schema_1.workspaces.id, id));
        res.status(200).json({ message: "Workspace updated successfully" });
    }
    catch (error) {
        console.error("Error updating workspace:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateWorkspace = updateWorkspace;
const deleteWorkspace = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        // Verify owner
        const membership = await db_1.db.select().from(schema_1.workspaceMembers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workspaceMembers.workspaceId, id), (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.userId, userId), (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.role, 'owner')))
            .limit(1);
        if (!membership.length) {
            res.status(403).json({ message: "Only workspace owners can delete workspaces" });
            return;
        }
        // Cleanup everything in the workspace
        // 1. Get all projects
        const workspaceProjects = await db_1.db.select({ id: schema_1.projects.id }).from(schema_1.projects).where((0, drizzle_orm_1.eq)(schema_1.projects.workspaceId, id));
        const projectIds = workspaceProjects.map(p => p.id);
        if (projectIds.length > 0) {
            // Delete project-related data
            for (const pid of projectIds) {
                await db_1.db.delete(schema_1.projectMembers).where((0, drizzle_orm_1.eq)(schema_1.projectMembers.projectId, pid));
                await db_1.db.delete(schema_1.projectMilestones).where((0, drizzle_orm_1.eq)(schema_1.projectMilestones.projectId, pid));
                await db_1.db.delete(schema_1.projectPulse).where((0, drizzle_orm_1.eq)(schema_1.projectPulse.projectId, pid));
                await db_1.db.delete(schema_1.projectInventory).where((0, drizzle_orm_1.eq)(schema_1.projectInventory.projectId, pid));
                await db_1.db.delete(schema_1.resourceRequests).where((0, drizzle_orm_1.eq)(schema_1.resourceRequests.projectId, pid));
                await db_1.db.delete(schema_1.projectReminders).where((0, drizzle_orm_1.eq)(schema_1.projectReminders.projectId, pid));
            }
            await db_1.db.delete(schema_1.projects).where((0, drizzle_orm_1.eq)(schema_1.projects.workspaceId, id));
        }
        // 2. Delete members
        await db_1.db.delete(schema_1.workspaceMembers).where((0, drizzle_orm_1.eq)(schema_1.workspaceMembers.workspaceId, id));
        // 3. Delete workspace
        await db_1.db.delete(schema_1.workspaces).where((0, drizzle_orm_1.eq)(schema_1.workspaces.id, id));
        res.status(200).json({ message: "Workspace and all associated data deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting workspace:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.deleteWorkspace = deleteWorkspace;
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
        // Verify workspace membership (Owner or Manager can create project)
        const membership = await db_1.db.select().from(schema_1.workspaceMembers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workspaceMembers.workspaceId, workspaceId), (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.userId, userId), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.workspaceMembers.role, 'owner'), (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.role, 'admin'), (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.role, 'manager'))))
            .limit(1);
        if (!membership.length) {
            res.status(403).json({ message: "Unauthorized: Workspace management required" });
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
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        // Check if user is workspace member
        const membership = await db_1.db.select().from(schema_1.workspaceMembers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workspaceMembers.workspaceId, workspaceId), (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.userId, userId)))
            .limit(1);
        if (!membership.length) {
            res.status(403).json({ message: "Unauthorized: Occupancy denied" });
            return;
        }
        let projectRows;
        if (membership[0].role === 'owner' || membership[0].role === 'admin') {
            // Only workspace owner and admin can see all projects in the workspace
            projectRows = await db_1.db.select().from(schema_1.projects).where((0, drizzle_orm_1.eq)(schema_1.projects.workspaceId, workspaceId));
        }
        else {
            // Others only see projects where they are assigned as members
            const { projectMembers } = await Promise.resolve().then(() => __importStar(require("../db/schema")));
            projectRows = await db_1.db
                .select({
                id: schema_1.projects.id,
                workspaceId: schema_1.projects.workspaceId,
                name: schema_1.projects.name,
                description: schema_1.projects.description,
                status: schema_1.projects.status,
                deadline: schema_1.projects.deadline,
                createdAt: schema_1.projects.createdAt
            })
                .from(schema_1.projects)
                .innerJoin(projectMembers, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(projectMembers.projectId, schema_1.projects.id), (0, drizzle_orm_1.eq)(projectMembers.userId, userId)))
                .where((0, drizzle_orm_1.eq)(schema_1.projects.workspaceId, workspaceId));
        }
        // CEO View - Calculate health
        const result = [];
        for (const prj of projectRows) {
            const linkedItems = await db_1.db.select().from(schema_1.projectInventory).where((0, drizzle_orm_1.eq)(schema_1.projectInventory.projectId, prj.id));
            let health = "Green"; // Default
            let atRiskCount = 0;
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
                health = "Red";
            }
            else if (prj.deadline) {
                const daysUntilDeadline = (prj.deadline.getTime() - Date.now()) / (1000 * 3600 * 24);
                if (daysUntilDeadline < 7 && daysUntilDeadline >= 0) {
                    health = "Yellow";
                }
                else if (daysUntilDeadline < 0 && prj.status !== "Completed") {
                    health = "Red";
                }
            }
            // Fetch project members
            const members = await db_1.db
                .select({ email: schema_1.users.email })
                .from(schema_1.projectMembers)
                .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.projectMembers.userId, schema_1.users.id))
                .where((0, drizzle_orm_1.eq)(schema_1.projectMembers.projectId, prj.id));
            result.push({
                ...prj,
                health,
                atRiskCount,
                projectMembers: members.slice(0, 2).map(m => m.email),
                totalMemberCount: members.length
            });
        }
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getProjects = getProjects;
const getProject = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const projectRows = await db_1.db.select().from(schema_1.projects).where((0, drizzle_orm_1.eq)(schema_1.projects.id, id)).limit(1);
        if (!projectRows.length) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        // Verify access: (Workspace Owner/Admin) OR (Project Member)
        const prj = projectRows[0];
        const workspaceMembership = await db_1.db.select().from(schema_1.workspaceMembers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workspaceMembers.workspaceId, prj.workspaceId), (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.userId, userId)))
            .limit(1);
        const isWorkspacePrivileged = workspaceMembership.length > 0 &&
            (workspaceMembership[0].role === 'owner' || workspaceMembership[0].role === 'admin');
        const { projectMembers } = await Promise.resolve().then(() => __importStar(require("../db/schema")));
        const projectMembership = await db_1.db.select().from(projectMembers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(projectMembers.projectId, id), (0, drizzle_orm_1.eq)(projectMembers.userId, userId)))
            .limit(1);
        if (!isWorkspacePrivileged && !projectMembership.length) {
            res.status(403).json({ message: "Unauthorized: Access to this project is restricted." });
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
        const ws = (await db_1.db.select().from(schema_1.workspaces).where((0, drizzle_orm_1.eq)(schema_1.workspaces.id, prj.workspaceId)).limit(1))[0];
        res.status(200).json({
            ...prj,
            workspace: ws,
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
const updateProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const { name, description, deadline, status } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const projectRows = await db_1.db.select().from(schema_1.projects).where((0, drizzle_orm_1.eq)(schema_1.projects.id, projectId)).limit(1);
        if (!projectRows.length) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        const prj = projectRows[0];
        // Only workspace owner/manager or project admin can update
        const workspaceMembership = await db_1.db.select().from(schema_1.workspaceMembers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workspaceMembers.workspaceId, prj.workspaceId), (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.userId, userId), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.workspaceMembers.role, 'owner'), (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.role, 'admin'), (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.role, 'manager'))))
            .limit(1);
        if (!workspaceMembership.length) {
            // Check project role (simplified: only manager/admin)
            const { projectMembers } = await Promise.resolve().then(() => __importStar(require("../db/schema")));
            const membership = await db_1.db.select().from(projectMembers).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(projectMembers.projectId, projectId), (0, drizzle_orm_1.eq)(projectMembers.userId, userId))).limit(1);
            if (!membership.length || (membership[0].role !== 'admin' && membership[0].role !== 'manager')) {
                res.status(403).json({ message: "Insufficient permissions" });
                return;
            }
        }
        await db_1.db.update(schema_1.projects)
            .set({
            name: name || prj.name,
            description: description !== undefined ? description : prj.description,
            deadline: deadline ? new Date(deadline) : prj.deadline,
            status: status || prj.status,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.projects.id, projectId));
        res.status(200).json({ message: "Project updated successfully" });
    }
    catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const projectRows = await db_1.db.select().from(schema_1.projects).where((0, drizzle_orm_1.eq)(schema_1.projects.id, projectId)).limit(1);
        if (!projectRows.length) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        const prj = projectRows[0];
        // Only workspace owner can delete project
        const ws = await db_1.db.select().from(schema_1.workspaces).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workspaces.id, prj.workspaceId), (0, drizzle_orm_1.eq)(schema_1.workspaces.userId, userId))).limit(1);
        if (ws.length === 0) {
            res.status(403).json({ message: "Only workspace owners can delete projects" });
            return;
        }
        // Cleanup: projectMembers, milestones, pulse, projectInventory, resourceRequests are removed via CASCADE in DB if set up, 
        // but let's be safe and delete them if CASCADE is not assumed.
        const { projectMembers, projectMilestones, projectPulse, projectInventory, resourceRequests, projectReminders } = await Promise.resolve().then(() => __importStar(require("../db/schema")));
        await db_1.db.delete(projectMembers).where((0, drizzle_orm_1.eq)(projectMembers.projectId, projectId));
        await db_1.db.delete(projectMilestones).where((0, drizzle_orm_1.eq)(projectMilestones.projectId, projectId));
        await db_1.db.delete(projectPulse).where((0, drizzle_orm_1.eq)(projectPulse.projectId, projectId));
        await db_1.db.delete(projectInventory).where((0, drizzle_orm_1.eq)(projectInventory.projectId, projectId));
        await db_1.db.delete(resourceRequests).where((0, drizzle_orm_1.eq)(resourceRequests.projectId, projectId));
        await db_1.db.delete(projectReminders).where((0, drizzle_orm_1.eq)(projectReminders.projectId, projectId));
        await db_1.db.delete(schema_1.projects).where((0, drizzle_orm_1.eq)(schema_1.projects.id, projectId));
        res.status(200).json({ message: "Project deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.deleteProject = deleteProject;
const getWorkspaceMembers = async (req, res) => {
    try {
        const { id } = req.params; // workspaceId
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        // Verify user is member of this workspace
        const membership = await db_1.db.select().from(schema_1.workspaceMembers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workspaceMembers.workspaceId, id), (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.userId, userId)))
            .limit(1);
        if (!membership.length) {
            res.status(403).json({ message: "Unauthorized: Workspace access denied" });
            return;
        }
        const { users } = await Promise.resolve().then(() => __importStar(require("../db/schema")));
        const members = await db_1.db
            .select({
            id: schema_1.workspaceMembers.id,
            userId: schema_1.workspaceMembers.userId,
            role: schema_1.workspaceMembers.role,
            joinedAt: schema_1.workspaceMembers.joinedAt,
            userName: users.email, // Use email as identifier for now
            userRole: users.role
        })
            .from(schema_1.workspaceMembers)
            .innerJoin(users, (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.userId, users.id))
            .where((0, drizzle_orm_1.eq)(schema_1.workspaceMembers.workspaceId, id));
        res.status(200).json(members);
    }
    catch (error) {
        console.error("Error fetching workspace members:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getWorkspaceMembers = getWorkspaceMembers;
const updateWorkspaceMember = async (req, res) => {
    try {
        const { id, memberId } = req.params; // workspaceId, memberId (workspace_members.id)
        const { role } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const VALID_WORKSPACE_ROLES = ["admin", "manager", "team_leader", "developer", "designer", "customer", "user", "member"];
        if (!VALID_WORKSPACE_ROLES.includes(role)) {
            res.status(400).json({ message: "Invalid role. Provided: " + role });
            return;
        }
        // Verify caller is owner of the workspace
        const callerMembership = await db_1.db.select().from(schema_1.workspaceMembers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workspaceMembers.workspaceId, id), (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.userId, userId), (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.role, 'owner')))
            .limit(1);
        if (!callerMembership.length) {
            res.status(403).json({ message: "Only workspace owners can change roles" });
            return;
        }
        await db_1.db.update(schema_1.workspaceMembers)
            .set({ role })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workspaceMembers.workspaceId, id), (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.id, memberId)));
        res.status(200).json({ message: "Member role updated successfully" });
    }
    catch (error) {
        console.error("Error updating workspace member:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateWorkspaceMember = updateWorkspaceMember;
const removeWorkspaceMember = async (req, res) => {
    try {
        const { id, memberId } = req.params; // workspaceId, memberId
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        // Verify caller is owner of the workspace
        const callerMembership = await db_1.db.select().from(schema_1.workspaceMembers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workspaceMembers.workspaceId, id), (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.userId, userId), (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.role, 'owner')))
            .limit(1);
        if (!callerMembership.length) {
            res.status(403).json({ message: "Only workspace owners can remove members" });
            return;
        }
        // Get the userId of the member to be removed (to also remove them from projects)
        const member = await db_1.db.select().from(schema_1.workspaceMembers).where((0, drizzle_orm_1.eq)(schema_1.workspaceMembers.id, memberId)).limit(1);
        if (!member.length) {
            res.status(404).json({ message: "Member not found" });
            return;
        }
        const memberUserId = member[0].userId;
        // Start transaction (or just run sequential deletes)
        // 1. Remove from workspace_members
        await db_1.db.delete(schema_1.workspaceMembers).where((0, drizzle_orm_1.eq)(schema_1.workspaceMembers.id, memberId));
        // 2. Remove from all projects in this workspace
        const workspaceProjects = await db_1.db.select({ id: schema_1.projects.id }).from(schema_1.projects).where((0, drizzle_orm_1.eq)(schema_1.projects.workspaceId, id));
        const projectIds = workspaceProjects.map(p => p.id);
        if (projectIds.length > 0) {
            const { projectMembers } = await Promise.resolve().then(() => __importStar(require("../db/schema")));
            await db_1.db.delete(projectMembers).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(projectMembers.userId, memberUserId), (0, drizzle_orm_1.sql) `${projectMembers.projectId} IN (${drizzle_orm_1.sql.join(projectIds.map(pid => (0, drizzle_orm_1.sql) `${pid}`), (0, drizzle_orm_1.sql) `, `)})`));
        }
        res.status(200).json({ message: "Member removed from workspace and all its projects" });
    }
    catch (error) {
        console.error("Error removing workspace member:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.removeWorkspaceMember = removeWorkspaceMember;
