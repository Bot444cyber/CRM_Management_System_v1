import { Request, Response } from "express";
import { db } from "../config/db";
import { projectMembers, users, projectInvitations, projectJoinRequests, projects, workspaceMembers, workspaces } from "../db/schema";
import { eq, and, or, sql } from "drizzle-orm";
import crypto from "crypto";

const VALID_ROLES = ["admin", "manager", "team_leader", "developer", "designer", "customer", "user"];

/**
 * Helper to verify if the requester has workspace-level management rights (Owner/Manager)
 * or is an Admin/Manager in the project.
 */
export const hasManagerialAccess = async (projectId: string, userId: number): Promise<boolean> => {
    try {
        // 1. Check if user is the Workspace Owner or Workspace Manager for this project's workspace
        const project = await db.select({ workspaceId: projects.workspaceId }).from(projects).where(eq(projects.id, projectId)).limit(1);
        if (!project.length) return false;

        const workspaceRole = await db.select().from(workspaceMembers)
            .where(and(
                eq(workspaceMembers.workspaceId, project[0].workspaceId),
                eq(workspaceMembers.userId, userId),
                or(eq(workspaceMembers.role, 'owner'), eq(workspaceMembers.role, 'admin'))
            ))
            .limit(1);

        if (workspaceRole.length > 0) return true;

        // 2. Check if user is a Manager in the project itself
        const projectRole = await db.select().from(projectMembers)
            .where(and(
                eq(projectMembers.projectId, projectId),
                eq(projectMembers.userId, userId),
                or(eq(projectMembers.role, 'admin'), eq(projectMembers.role, 'manager'))
            ))
            .limit(1);

        return projectRole.length > 0;
    } catch (e) {
        console.error("Access verification error:", e);
        return false;
    }
};

export const getProjectMembers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const rows = await db
            .select({
                memberId: projectMembers.id,
                userId: projectMembers.userId,
                projectRole: projectMembers.role,
                joinedAt: projectMembers.joinedAt,
                email: users.email,
                systemRole: users.role,
            })
            .from(projectMembers)
            .innerJoin(users, eq(projectMembers.userId, users.id))
            .where(eq(projectMembers.projectId, id as string));

        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching project members:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const addProjectMember = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // projectId
        const { userId, role } = req.body;

        const requesterId = req.user?.userId;
        if (!requesterId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (!(await hasManagerialAccess(id as string, requesterId))) {
            res.status(403).json({ message: "Forbidden: Management rights required" });
            return;
        }

        if (!VALID_ROLES.includes(role)) {
            res.status(400).json({ message: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` });
            return;
        }

        const existing = await db.select().from(projectMembers)
            .where(and(eq(projectMembers.projectId, id as string), eq(projectMembers.userId, Number(userId))))
            .limit(1);

        if (existing.length > 0) {
            await db.update(projectMembers).set({ role }).where(eq(projectMembers.id, existing[0].id));
            res.status(200).json({ message: "Member role updated" });
            return;
        }

        const memberId = crypto.randomUUID();
        await db.insert(projectMembers).values({
            id: memberId,
            projectId: id as string,
            userId: Number(userId),
            role,
        });

        res.status(201).json({ message: "Member added to project", id: memberId });
    } catch (error) {
        console.error("Error adding project member:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const removeProjectMember = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // projectId
        const { memberId } = req.params;
        const userId = req.user?.userId;

        if (!userId || !(await hasManagerialAccess(id as string, userId))) {
            res.status(403).json({ message: "Forbidden: Management rights required" });
            return;
        }

        await db.delete(projectMembers).where(eq(projectMembers.id, memberId as string));
        res.status(200).json({ message: "Member removed from project" });
    } catch (error) {
        console.error("Error removing project member:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ── Invitation Logic ──────────────────────────────────────────────────────────

export const getProjectInvitation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // projectId
        const userId = req.user?.userId;

        if (!userId || !(await hasManagerialAccess(id as string, userId))) {
            res.status(403).json({ message: "Forbidden: Management rights required" });
            return;
        }

        const invite = await db.select().from(projectInvitations).where(eq(projectInvitations.projectId, id as string)).limit(1);

        if (invite.length === 0) {
            // Generate initial invitation if not exists
            const inviteId = crypto.randomUUID();
            const code = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 chars
            const linkToken = crypto.randomBytes(16).toString('hex');

            await db.insert(projectInvitations).values({
                id: inviteId,
                projectId: id as string,
                code,
                linkToken,
                methods: JSON.stringify(["code", "link", "approval"]) as any,
                isActive: true
            });

            const newInvite = await db.select().from(projectInvitations).where(eq(projectInvitations.id, inviteId)).limit(1);
            res.status(200).json(newInvite[0]);
        } else {
            res.status(200).json(invite[0]);
        }
    } catch (error) {
        console.error("Error fetching project invitation:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const resetInviteStrings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // projectId
        const userId = req.user?.userId;

        if (!userId || !(await hasManagerialAccess(id as string, userId))) {
            res.status(403).json({ message: "Forbidden: Management rights required" });
            return;
        }

        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        const linkToken = crypto.randomBytes(16).toString('hex');

        await db.update(projectInvitations)
            .set({ code, linkToken })
            .where(eq(projectInvitations.projectId, id as string));

        res.status(200).json({ message: "Invite code and link reset successfully", code, linkToken });
    } catch (error) {
        console.error("Error resetting project invitation:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const joinByCode = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code } = req.body;
        const userId = req.user?.userId;

        if (!code || !userId) {
            res.status(400).json({ message: "Code and User ID are required" });
            return;
        }

        const invite = await db.select().from(projectInvitations).where(eq(projectInvitations.code, code)).limit(1);
        if (invite.length === 0 || !invite[0].isActive) {
            res.status(404).json({ message: "Invalid or inactive invite code" });
            return;
        }

        // Check if already a member
        const existing = await db.select().from(projectMembers)
            .where(and(eq(projectMembers.projectId, invite[0].projectId), eq(projectMembers.userId, userId)))
            .limit(1);

        if (existing.length > 0) {
            res.status(400).json({ message: "You are already a member of this project" });
            return;
        }

        // Add member
        const memberId = crypto.randomUUID();
        await db.insert(projectMembers).values({
            id: memberId,
            projectId: invite[0].projectId,
            userId: userId,
            role: "developer" // Default role
        });


        res.status(200).json({ message: "Joined project successfully", projectId: invite[0].projectId });
    } catch (error) {
        console.error("Error joining project by code:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const joinByLink = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;
        const userId = req.user?.userId;

        if (!token || !userId) {
            res.status(400).json({ message: "Token and User ID are required" });
            return;
        }

        const invite = await db.select().from(projectInvitations).where(eq(projectInvitations.linkToken, token as string)).limit(1);
        if (invite.length === 0 || !invite[0].isActive) {
            res.status(404).json({ message: "Invalid or inactive invite link" });
            return;
        }

        // Check if already a member
        const existing = await db.select().from(projectMembers)
            .where(and(eq(projectMembers.projectId, invite[0].projectId), eq(projectMembers.userId, userId)))
            .limit(1);

        if (existing.length > 0) {
            res.status(400).json({ message: "You are already a member of this project" });
            return;
        }

        // Add member
        const memberIdLink = crypto.randomUUID();
        await db.insert(projectMembers).values({
            id: memberIdLink,
            projectId: invite[0].projectId,
            userId: userId,
            role: "developer"
        });


        res.status(200).json({ message: "Joined project successfully", projectId: invite[0].projectId });
    } catch (error) {
        console.error("Error joining project by link:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ── Join Requests (Approval System) ──────────────────────────────────────────

export const requestToJoin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { projectId, message } = req.body;
        const userId = req.user?.userId;

        if (!projectId || !userId) {
            res.status(400).json({ message: "Project ID and User ID are required" });
            return;
        }

        // Check if already a member
        const existing = await db.select().from(projectMembers)
            .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
            .limit(1);

        if (existing.length > 0) {
            res.status(400).json({ message: "You are already a member of this project" });
            return;
        }

        // Check if existing request
        const existingReq = await db.select().from(projectJoinRequests)
            .where(and(eq(projectJoinRequests.projectId, projectId), eq(projectJoinRequests.userId, userId), eq(projectJoinRequests.status, "Pending")))
            .limit(1);

        if (existingReq.length > 0) {
            res.status(400).json({ message: "You already have a pending request for this project" });
            return;
        }

        const requestId = crypto.randomUUID();
        await db.insert(projectJoinRequests).values({
            id: requestId,
            projectId: projectId as string,
            userId,
            message: message || null,
            status: "Pending"
        });

        res.status(201).json({ message: "Join request submitted", id: requestId });
    } catch (error) {
        console.error("Error requesting to join project:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getJoinRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // projectId
        const userId = req.user?.userId;

        if (!userId || !(await hasManagerialAccess(id as string, userId))) {
            res.status(403).json({ message: "Forbidden: Management rights required" });
            return;
        }

        const requests = await db
            .select({
                requestId: projectJoinRequests.id,
                userId: projectJoinRequests.userId,
                status: projectJoinRequests.status,
                message: projectJoinRequests.message,
                createdAt: projectJoinRequests.createdAt,
                email: users.email,
            })
            .from(projectJoinRequests)
            .innerJoin(users, eq(projectJoinRequests.userId, users.id))
            .where(eq(projectJoinRequests.projectId, id as string));

        res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching join requests:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const processJoinRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, requestId } = req.params; // projectId, requestId
        const { status } = req.body; // Approved, Rejected
        const userId = req.user?.userId;

        if (!userId || !(await hasManagerialAccess(id as string, userId))) {
            res.status(403).json({ message: "Forbidden: Management rights required" });
            return;
        }

        if (!["Approved", "Rejected"].includes(status)) {
            res.status(400).json({ message: "Invalid status" });
            return;
        }

        const request = await db.select().from(projectJoinRequests).where(eq(projectJoinRequests.id, requestId as string)).limit(1);
        if (request.length === 0) {
            res.status(404).json({ message: "Request not found" });
            return;
        }

        await db.update(projectJoinRequests)
            .set({ status, processedAt: new Date() })
            .where(eq(projectJoinRequests.id, requestId as string));

        if (status === "Approved") {
            // Check if already a member (safety)
            const existing = await db.select().from(projectMembers)
                .where(and(eq(projectMembers.projectId, id as string), eq(projectMembers.userId, request[0].userId)))
                .limit(1);

            if (existing.length === 0) {
                const memberId = crypto.randomUUID();
                await db.insert(projectMembers).values({
                    id: memberId,
                    projectId: id as string,
                    userId: request[0].userId,
                    role: "developer"
                });
            }
        }

        res.status(200).json({ message: `Request ${status}` });
    } catch (error) {
        console.error("Error processing join request:", error);
        res.status(500).json({ message: "Server error" });
    }
};
export const getGlobalTeam = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // 1. Identify all workspaces where the user is an 'owner' or 'manager'
        const myWorkspaces = await db
            .select({ id: workspaces.id })
            .from(workspaces)
            .innerJoin(workspaceMembers, eq(workspaceMembers.workspaceId, workspaces.id))
            .where(
                and(
                    eq(workspaceMembers.userId, userId),
                    or(eq(workspaceMembers.role, 'owner'), eq(workspaceMembers.role, 'admin'))
                )
            );

        if (myWorkspaces.length === 0) {
            res.status(200).json([]);
            return;
        }

        const workspaceIds = myWorkspaces.map(ws => ws.id);

        // 2. Fetch all members of these workspaces
        const members = await db
            .select({
                id: workspaceMembers.id,
                userId: users.id,
                email: users.email,
                name: users.email, // Use email as name if name is not available
                role: workspaceMembers.role,
                joinedAt: workspaceMembers.joinedAt,
                workspaceName: workspaces.name,
                workspaceId: workspaces.id,
                passKey: workspaces.passKey
            })
            .from(workspaceMembers)
            .innerJoin(users, eq(workspaceMembers.userId, users.id))
            .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
            .where(sql`${workspaceMembers.workspaceId} IN (${sql.join(workspaceIds.map(id => sql`${id}`), sql`, `)})`);

        // 3. Group by user to avoid duplicates if someone is in multiple workspaces, 
        // but for now, showing them per workspace might be clearer or we can unique them.
        // The user said "owner did not see which user join my workspace", so per-workspace is probably fine.

        res.status(200).json(members);
    } catch (error) {
        console.error("Error fetching global team:", error);
        res.status(500).json({ message: "Server error" });
    }
};
