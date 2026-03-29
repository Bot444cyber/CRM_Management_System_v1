import { Request, Response } from "express";
import { db } from "../config/db";
import { workspaces, projects, projectInventory, inventories, workspaceMembers, projectMembers, projectMilestones, projectPulse, resourceRequests, projectReminders, users } from "../db/schema";
import { eq, and, or, sql, desc } from "drizzle-orm";
import crypto from "crypto";
import { sendWorkspaceInvitationEmail } from "../services/email.service";

export const getWorkspaces = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // Fetch workspaces where user is owner or member
        const rows = await db
            .select({
                id: workspaces.id,
                name: workspaces.name,
                description: workspaces.description,
                passKey: workspaces.passKey,
                role: workspaceMembers.role,
                createdAt: workspaces.createdAt
            })
            .from(workspaces)
            .innerJoin(workspaceMembers, eq(workspaceMembers.workspaceId, workspaces.id))
            .where(eq(workspaceMembers.userId, userId));

        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching workspaces:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const createWorkspace = async (req: Request, res: Response): Promise<void> => {
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

        const id = crypto.randomUUID();
        // Generate a human-readable 6-digit passKey
        const passKey = Math.floor(100000 + Math.random() * 900000).toString();

        await db.insert(workspaces).values({
            id,
            userId,
            name,
            description: description || null,
            passKey
        });

        // Add creator as owner
        await db.insert(workspaceMembers).values({
            id: crypto.randomUUID(),
            workspaceId: id,
            userId,
            role: 'owner'
        });

        res.status(201).json({ message: "Workspace created successfully", id, passKey });
    } catch (error) {
        console.error("Error creating workspace:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const joinWorkspace = async (req: Request, res: Response): Promise<void> => {
    try {
        const { passKey } = req.body;
        const userId = req.user?.userId;

        if (!passKey || !userId) {
            res.status(400).json({ message: "Pass-key required" });
            return;
        }

        // Find workspace by passKey
        const ws = await db.select().from(workspaces).where(eq(workspaces.passKey, passKey)).limit(1);
        if (!ws.length) {
            res.status(404).json({ message: "Invalid pass-key" });
            return;
        }

        const workspaceId = ws[0].id;

        // Check if already a member
        const existing = await db.select().from(workspaceMembers).where(
            and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId))
        ).limit(1);

        if (existing.length > 0) {
            res.status(400).json({ message: "Already a member of this workspace" });
            return;
        }

        // Join as member
        await db.insert(workspaceMembers).values({
            id: crypto.randomUUID(),
            workspaceId,
            userId,
            role: 'member'
        });

        res.status(200).json({ message: "Joined workspace successfully", workspaceId });
    } catch (error) {
        console.error("Error joining workspace:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const inviteToWorkspace = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // workspaceId
        const { emails } = req.body; // array of emails
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            res.status(400).json({ message: "Emails are required and must be an array" });
            return;
        }

        // 1. Verify caller has permission (Owner/Admin/Manager)
        const membership = await db.select().from(workspaceMembers)
            .where(and(eq(workspaceMembers.workspaceId, id as string), eq(workspaceMembers.userId, userId)))
            .limit(1);

        if (!membership.length || !['owner', 'admin', 'manager'].includes(membership[0].role)) {
            res.status(403).json({ message: "Insufficient permissions to invite members" });
            return;
        }

        // 2. Fetch workspace details
        const wsRows = await db.select().from(workspaces).where(eq(workspaces.id, id as string)).limit(1);
        if (!wsRows.length) {
            res.status(404).json({ message: "Workspace not found" });
            return;
        }
        const ws = wsRows[0];

        // 3. Get Inviter Name
        const inviterRows = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
        const inviterName = inviterRows[0]?.name || inviterRows[0]?.email?.split('@')[0] || "A Team Lead";

        // 4. Send Emails in Bulk
        const results = await Promise.all(emails.map(async (email) => {
            const success = await sendWorkspaceInvitationEmail(email, ws.name || "Workspace", ws.passKey || "", inviterName);
            return { email, success };
        }));

        res.status(200).json({
            message: "Invitations processed",
            results
        });
    } catch (error) {
        console.error("Error inviting to workspace:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getWorkspace = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const wsRows = await db.select({
            id: workspaces.id,
            name: workspaces.name,
            description: workspaces.description,
            passKey: workspaces.passKey,
            createdAt: workspaces.createdAt,
            role: workspaceMembers.role
        })
            .from(workspaces)
            .innerJoin(workspaceMembers, eq(workspaceMembers.workspaceId, workspaces.id))
            .where(and(eq(workspaces.id, id as string), eq(workspaceMembers.userId, userId)))
            .limit(1);

        if (!wsRows.length) {
            res.status(404).json({ message: "Workspace not found or access denied" });
            return;
        }

        res.status(200).json(wsRows[0]);
    } catch (error) {
        console.error("Error fetching workspace details:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateWorkspace = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // Only owner can update
        const membership = await db.select().from(workspaceMembers)
            .where(and(eq(workspaceMembers.workspaceId, id as string), eq(workspaceMembers.userId, userId), eq(workspaceMembers.role, 'owner')))
            .limit(1);

        if (!membership.length) {
            res.status(403).json({ message: "Only workspace owners can update settings" });
            return;
        }

        await db.update(workspaces)
            .set({
                name: name || undefined,
                description: description !== undefined ? description : undefined
            })
            .where(eq(workspaces.id, id as string));

        res.status(200).json({ message: "Workspace updated successfully" });
    } catch (error) {
        console.error("Error updating workspace:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteWorkspace = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // Verify owner
        const membership = await db.select().from(workspaceMembers)
            .where(and(eq(workspaceMembers.workspaceId, id as string), eq(workspaceMembers.userId, userId), eq(workspaceMembers.role, 'owner')))
            .limit(1);

        if (!membership.length) {
            res.status(403).json({ message: "Only workspace owners can delete workspaces" });
            return;
        }

        // Cleanup everything in the workspace
        // 1. Get all projects
        const workspaceProjects = await db.select({ id: projects.id }).from(projects).where(eq(projects.workspaceId, id as string));
        const projectIds = workspaceProjects.map(p => p.id);

        if (projectIds.length > 0) {
            // Delete project-related data
            for (const pid of projectIds) {
                await db.delete(projectMembers).where(eq(projectMembers.projectId, pid));
                await db.delete(projectMilestones).where(eq(projectMilestones.projectId, pid));
                await db.delete(projectPulse).where(eq(projectPulse.projectId, pid));
                await db.delete(projectInventory).where(eq(projectInventory.projectId, pid));
                await db.delete(resourceRequests).where(eq(resourceRequests.projectId, pid));
                await db.delete(projectReminders).where(eq(projectReminders.projectId, pid));
            }
            await db.delete(projects).where(eq(projects.workspaceId, id as string));
        }

        // 2. Delete members
        await db.delete(workspaceMembers).where(eq(workspaceMembers.workspaceId, id as string));

        // 3. Delete workspace
        await db.delete(workspaces).where(eq(workspaces.id, id as string));

        res.status(200).json({ message: "Workspace and all associated data deleted successfully" });
    } catch (error) {
        console.error("Error deleting workspace:", error);
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

        // Verify workspace membership (Owner or Manager can create project)
        const membership = await db.select().from(workspaceMembers)
            .where(and(
                eq(workspaceMembers.workspaceId, workspaceId),
                eq(workspaceMembers.userId, userId),
                or(eq(workspaceMembers.role, 'owner'), eq(workspaceMembers.role, 'admin'), eq(workspaceMembers.role, 'manager'))
            ))
            .limit(1);

        if (!membership.length) {
            res.status(403).json({ message: "Unauthorized: Workspace management required" });
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
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // Check if user is workspace member
        const membership = await db.select().from(workspaceMembers)
            .where(and(eq(workspaceMembers.workspaceId, workspaceId as string), eq(workspaceMembers.userId, userId)))
            .limit(1);

        if (!membership.length) {
            res.status(403).json({ message: "Unauthorized: Occupancy denied" });
            return;
        }

        let projectRows;
        if (membership[0].role === 'owner' || membership[0].role === 'admin') {
            // Only workspace owner and admin can see all projects in the workspace
            projectRows = await db.select().from(projects).where(eq(projects.workspaceId, workspaceId as string));
        } else {
            // Others only see projects where they are assigned as members
            const { projectMembers } = await import("../db/schema");
            projectRows = await db
                .select({
                    id: projects.id,
                    workspaceId: projects.workspaceId,
                    name: projects.name,
                    description: projects.description,
                    status: projects.status,
                    deadline: projects.deadline,
                    createdAt: projects.createdAt
                })
                .from(projects)
                .innerJoin(projectMembers, and(eq(projectMembers.projectId, projects.id), eq(projectMembers.userId, userId)))
                .where(eq(projects.workspaceId, workspaceId as string));
        }


        // CEO View - Calculate health
        const result = [];
        for (const prj of projectRows) {
            const linkedItems = await db.select().from(projectInventory).where(eq(projectInventory.projectId, prj.id));
            let health = "Green"; // Default
            let atRiskCount = 0;

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
                health = "Red";
            } else if (prj.deadline) {
                const daysUntilDeadline = (prj.deadline.getTime() - Date.now()) / (1000 * 3600 * 24);
                if (daysUntilDeadline < 7 && daysUntilDeadline >= 0) {
                    health = "Yellow";
                } else if (daysUntilDeadline < 0 && prj.status !== "Completed") {
                    health = "Red";
                }
            }

            // Fetch project members
            const members = await db
                .select({
                    email: users.email,
                    name: users.name
                })
                .from(projectMembers)
                .innerJoin(users, eq(projectMembers.userId, users.id))
                .where(eq(projectMembers.projectId, prj.id));

            result.push({
                ...prj,
                health,
                atRiskCount,
                projectMembers: members.slice(0, 3).map(m => ({
                    email: m.email,
                    name: m.name
                })),
                totalMemberCount: members.length
            });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching projects:", error);
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

        const projectRows = await db.select().from(projects).where(eq(projects.id, id as string)).limit(1);
        if (!projectRows.length) {
            res.status(404).json({ message: "Project not found" });
            return;
        }

        // Verify access: (Workspace Owner/Admin) OR (Project Member)
        const prj = projectRows[0];
        const workspaceMembership = await db.select().from(workspaceMembers)
            .where(and(eq(workspaceMembers.workspaceId, prj.workspaceId), eq(workspaceMembers.userId, userId)))
            .limit(1);

        const isWorkspacePrivileged = workspaceMembership.length > 0 &&
            (workspaceMembership[0].role === 'owner' || workspaceMembership[0].role === 'admin');

        const { projectMembers } = await import("../db/schema");
        const projectMembership = await db.select().from(projectMembers)
            .where(and(eq(projectMembers.projectId, id as string), eq(projectMembers.userId, userId)))
            .limit(1);

        if (!isWorkspacePrivileged && !projectMembership.length) {
            res.status(403).json({ message: "Unauthorized: Access to this project is restricted." });
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

        const ws = (await db.select().from(workspaces).where(eq(workspaces.id, prj.workspaceId)).limit(1))[0];

        res.status(200).json({
            ...prj,
            workspace: ws,
            resources: resourceDetails,
            totalResourceCost: totalCost
        });
    } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
    try {
        const projectId = req.params.id as string;
        const { name, description, deadline, status } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const projectRows = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
        if (!projectRows.length) {
            res.status(404).json({ message: "Project not found" });
            return;
        }

        const prj = projectRows[0];
        // Only workspace owner/manager or project admin can update
        const workspaceMembership = await db.select().from(workspaceMembers)
            .where(and(
                eq(workspaceMembers.workspaceId, prj.workspaceId),
                eq(workspaceMembers.userId, userId),
                or(eq(workspaceMembers.role, 'owner'), eq(workspaceMembers.role, 'admin'), eq(workspaceMembers.role, 'manager'))
            ))
            .limit(1);

        if (!workspaceMembership.length) {
            // Check project role (simplified: only manager/admin)
            const { projectMembers } = await import("../db/schema");
            const membership = await db.select().from(projectMembers).where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId))).limit(1);
            if (!membership.length || (membership[0].role !== 'admin' && membership[0].role !== 'manager')) {
                res.status(403).json({ message: "Insufficient permissions" });
                return;
            }
        }

        await db.update(projects)
            .set({
                name: name || prj.name,
                description: description !== undefined ? description : prj.description,
                deadline: deadline ? new Date(deadline) : prj.deadline,
                status: status || prj.status,
            })
            .where(eq(projects.id, projectId));



        res.status(200).json({ message: "Project updated successfully" });
    } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
    try {
        const projectId = req.params.id as string;
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const projectRows = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
        if (!projectRows.length) {
            res.status(404).json({ message: "Project not found" });
            return;
        }

        const prj = projectRows[0];
        // Only workspace owner can delete project
        const ws = await db.select().from(workspaces).where(and(eq(workspaces.id, prj.workspaceId), eq(workspaces.userId, userId))).limit(1);

        if (ws.length === 0) {
            res.status(403).json({ message: "Only workspace owners can delete projects" });
            return;
        }

        // Cleanup: projectMembers, milestones, pulse, projectInventory, resourceRequests are removed via CASCADE in DB if set up, 
        // but let's be safe and delete them if CASCADE is not assumed.
        const { projectMembers, projectMilestones, projectPulse, projectInventory, resourceRequests, projectReminders } = await import("../db/schema");

        await db.delete(projectMembers).where(eq(projectMembers.projectId, projectId));
        await db.delete(projectMilestones).where(eq(projectMilestones.projectId, projectId));
        await db.delete(projectPulse).where(eq(projectPulse.projectId, projectId));
        await db.delete(projectInventory).where(eq(projectInventory.projectId, projectId));
        await db.delete(resourceRequests).where(eq(resourceRequests.projectId, projectId));
        await db.delete(projectReminders).where(eq(projectReminders.projectId, projectId));
        await db.delete(projects).where(eq(projects.id, projectId));

        res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getWorkspaceMembers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // workspaceId
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // Verify user is member of this workspace
        const membership = await db.select().from(workspaceMembers)
            .where(and(eq(workspaceMembers.workspaceId, id as string), eq(workspaceMembers.userId, userId)))
            .limit(1);

        if (!membership.length) {
            res.status(403).json({ message: "Unauthorized: Workspace access denied" });
            return;
        }

        const { users } = await import("../db/schema");
        const members = await db
            .select({
                id: workspaceMembers.id,
                userId: workspaceMembers.userId,
                role: workspaceMembers.role,
                joinedAt: workspaceMembers.joinedAt,
                name: users.name,
                userName: sql`COALESCE(NULLIF(${users.name}, ''), SUBSTRING_INDEX(${users.email}, '@', 1))`,
                email: users.email,
                userRole: users.role
            })
            .from(workspaceMembers)
            .innerJoin(users, eq(workspaceMembers.userId, users.id))
            .where(eq(workspaceMembers.workspaceId, id as string));

        res.status(200).json(members);
    } catch (error) {
        console.error("Error fetching workspace members:", error);
        res.status(500).json({ message: "Server error" });
    }
};
export const updateWorkspaceMember = async (req: Request, res: Response): Promise<void> => {
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
        const callerMembership = await db.select().from(workspaceMembers)
            .where(and(eq(workspaceMembers.workspaceId, id as string), eq(workspaceMembers.userId, userId), eq(workspaceMembers.role, 'owner')))
            .limit(1);

        if (!callerMembership.length) {
            res.status(403).json({ message: "Only workspace owners can change roles" });
            return;
        }

        await db.update(workspaceMembers)
            .set({ role })
            .where(and(eq(workspaceMembers.workspaceId, id as string), eq(workspaceMembers.id, memberId as string)));

        res.status(200).json({ message: "Member role updated successfully" });
    } catch (error) {
        console.error("Error updating workspace member:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const removeWorkspaceMember = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, memberId } = req.params; // workspaceId, memberId
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // Verify caller is owner of the workspace
        const callerMembership = await db.select().from(workspaceMembers)
            .where(and(eq(workspaceMembers.workspaceId, id as string), eq(workspaceMembers.userId, userId), eq(workspaceMembers.role, 'owner')))
            .limit(1);

        if (!callerMembership.length) {
            res.status(403).json({ message: "Only workspace owners can remove members" });
            return;
        }

        // Get the userId of the member to be removed (to also remove them from projects)
        const member = await db.select().from(workspaceMembers).where(eq(workspaceMembers.id, memberId as string)).limit(1);
        if (!member.length) {
            res.status(404).json({ message: "Member not found" });
            return;
        }

        const memberUserId = member[0].userId;

        // Start transaction (or just run sequential deletes)
        // 1. Remove from workspace_members
        await db.delete(workspaceMembers).where(eq(workspaceMembers.id, memberId as string));

        // 2. Remove from all projects in this workspace
        const workspaceProjects = await db.select({ id: projects.id }).from(projects).where(eq(projects.workspaceId, id as string));
        const projectIds = workspaceProjects.map(p => p.id);

        if (projectIds.length > 0) {
            const { projectMembers } = await import("../db/schema");
            await db.delete(projectMembers).where(
                and(
                    eq(projectMembers.userId, memberUserId),
                    sql`${projectMembers.projectId} IN (${sql.join(projectIds.map(pid => sql`${pid}`), sql`, `)})`
                )
            );
        }

        res.status(200).json({ message: "Member removed from workspace and all its projects" });
    } catch (error) {
        console.error("Error removing workspace member:", error);
        res.status(500).json({ message: "Server error" });
    }
};
