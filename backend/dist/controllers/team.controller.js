"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobalTeam = exports.processJoinRequest = exports.getJoinRequests = exports.requestToJoin = exports.joinByLink = exports.joinByCode = exports.resetInviteStrings = exports.getProjectInvitation = exports.removeProjectMember = exports.addProjectMember = exports.getProjectMembers = exports.hasManagerialAccess = void 0;
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
const VALID_ROLES = ["admin", "manager", "team_leader", "developer", "designer", "customer", "user"];
/**
 * Helper to verify if the requester has workspace-level management rights (Owner/Manager)
 * or is an Admin/Manager in the project.
 */
const hasManagerialAccess = async (projectId, userId) => {
    try {
        // 1. Check if user is the Workspace Owner or Workspace Manager for this project's workspace
        const project = await db_1.db.select({ workspaceId: schema_1.projects.workspaceId }).from(schema_1.projects).where((0, drizzle_orm_1.eq)(schema_1.projects.id, projectId)).limit(1);
        if (!project.length)
            return false;
        const workspaceRole = await db_1.db.select().from(schema_1.workspaceMembers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workspaceMembers.workspaceId, project[0].workspaceId), (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.userId, userId), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.workspaceMembers.role, 'owner'), (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.role, 'admin'))))
            .limit(1);
        if (workspaceRole.length > 0)
            return true;
        // 2. Check if user is a Manager in the project itself
        const projectRole = await db_1.db.select().from(schema_1.projectMembers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.projectMembers.projectId, projectId), (0, drizzle_orm_1.eq)(schema_1.projectMembers.userId, userId), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.projectMembers.role, 'admin'), (0, drizzle_orm_1.eq)(schema_1.projectMembers.role, 'manager'))))
            .limit(1);
        return projectRole.length > 0;
    }
    catch (e) {
        console.error("Access verification error:", e);
        return false;
    }
};
exports.hasManagerialAccess = hasManagerialAccess;
const getProjectMembers = async (req, res) => {
    try {
        const { id } = req.params;
        const rows = await db_1.db
            .select({
            memberId: schema_1.projectMembers.id,
            userId: schema_1.projectMembers.userId,
            projectRole: schema_1.projectMembers.role,
            joinedAt: schema_1.projectMembers.joinedAt,
            email: schema_1.users.email,
            systemRole: schema_1.users.role,
        })
            .from(schema_1.projectMembers)
            .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.projectMembers.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.eq)(schema_1.projectMembers.projectId, id));
        res.status(200).json(rows);
    }
    catch (error) {
        console.error("Error fetching project members:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getProjectMembers = getProjectMembers;
const addProjectMember = async (req, res) => {
    try {
        const { id } = req.params; // projectId
        const { userId, role } = req.body;
        const requesterId = req.user?.userId;
        if (!requesterId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        if (!(await (0, exports.hasManagerialAccess)(id, requesterId))) {
            res.status(403).json({ message: "Forbidden: Management rights required" });
            return;
        }
        if (!VALID_ROLES.includes(role)) {
            res.status(400).json({ message: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` });
            return;
        }
        const existing = await db_1.db.select().from(schema_1.projectMembers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.projectMembers.projectId, id), (0, drizzle_orm_1.eq)(schema_1.projectMembers.userId, Number(userId))))
            .limit(1);
        if (existing.length > 0) {
            await db_1.db.update(schema_1.projectMembers).set({ role }).where((0, drizzle_orm_1.eq)(schema_1.projectMembers.id, existing[0].id));
            res.status(200).json({ message: "Member role updated" });
            return;
        }
        const memberId = crypto_1.default.randomUUID();
        await db_1.db.insert(schema_1.projectMembers).values({
            id: memberId,
            projectId: id,
            userId: Number(userId),
            role,
        });
        res.status(201).json({ message: "Member added to project", id: memberId });
    }
    catch (error) {
        console.error("Error adding project member:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.addProjectMember = addProjectMember;
const removeProjectMember = async (req, res) => {
    try {
        const { id } = req.params; // projectId
        const { memberId } = req.params;
        const userId = req.user?.userId;
        if (!userId || !(await (0, exports.hasManagerialAccess)(id, userId))) {
            res.status(403).json({ message: "Forbidden: Management rights required" });
            return;
        }
        await db_1.db.delete(schema_1.projectMembers).where((0, drizzle_orm_1.eq)(schema_1.projectMembers.id, memberId));
        res.status(200).json({ message: "Member removed from project" });
    }
    catch (error) {
        console.error("Error removing project member:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.removeProjectMember = removeProjectMember;
// ── Invitation Logic ──────────────────────────────────────────────────────────
const getProjectInvitation = async (req, res) => {
    try {
        const { id } = req.params; // projectId
        const userId = req.user?.userId;
        if (!userId || !(await (0, exports.hasManagerialAccess)(id, userId))) {
            res.status(403).json({ message: "Forbidden: Management rights required" });
            return;
        }
        const invite = await db_1.db.select().from(schema_1.projectInvitations).where((0, drizzle_orm_1.eq)(schema_1.projectInvitations.projectId, id)).limit(1);
        if (invite.length === 0) {
            // Generate initial invitation if not exists
            const inviteId = crypto_1.default.randomUUID();
            const code = crypto_1.default.randomBytes(4).toString('hex').toUpperCase(); // 8 chars
            const linkToken = crypto_1.default.randomBytes(16).toString('hex');
            await db_1.db.insert(schema_1.projectInvitations).values({
                id: inviteId,
                projectId: id,
                code,
                linkToken,
                methods: JSON.stringify(["code", "link", "approval"]),
                isActive: true
            });
            const newInvite = await db_1.db.select().from(schema_1.projectInvitations).where((0, drizzle_orm_1.eq)(schema_1.projectInvitations.id, inviteId)).limit(1);
            res.status(200).json(newInvite[0]);
        }
        else {
            res.status(200).json(invite[0]);
        }
    }
    catch (error) {
        console.error("Error fetching project invitation:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getProjectInvitation = getProjectInvitation;
const resetInviteStrings = async (req, res) => {
    try {
        const { id } = req.params; // projectId
        const userId = req.user?.userId;
        if (!userId || !(await (0, exports.hasManagerialAccess)(id, userId))) {
            res.status(403).json({ message: "Forbidden: Management rights required" });
            return;
        }
        const code = crypto_1.default.randomBytes(4).toString('hex').toUpperCase();
        const linkToken = crypto_1.default.randomBytes(16).toString('hex');
        await db_1.db.update(schema_1.projectInvitations)
            .set({ code, linkToken })
            .where((0, drizzle_orm_1.eq)(schema_1.projectInvitations.projectId, id));
        res.status(200).json({ message: "Invite code and link reset successfully", code, linkToken });
    }
    catch (error) {
        console.error("Error resetting project invitation:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.resetInviteStrings = resetInviteStrings;
const joinByCode = async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user?.userId;
        if (!code || !userId) {
            res.status(400).json({ message: "Code and User ID are required" });
            return;
        }
        const invite = await db_1.db.select().from(schema_1.projectInvitations).where((0, drizzle_orm_1.eq)(schema_1.projectInvitations.code, code)).limit(1);
        if (invite.length === 0 || !invite[0].isActive) {
            res.status(404).json({ message: "Invalid or inactive invite code" });
            return;
        }
        // Check if already a member
        const existing = await db_1.db.select().from(schema_1.projectMembers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.projectMembers.projectId, invite[0].projectId), (0, drizzle_orm_1.eq)(schema_1.projectMembers.userId, userId)))
            .limit(1);
        if (existing.length > 0) {
            res.status(400).json({ message: "You are already a member of this project" });
            return;
        }
        // Add member
        const memberId = crypto_1.default.randomUUID();
        await db_1.db.insert(schema_1.projectMembers).values({
            id: memberId,
            projectId: invite[0].projectId,
            userId: userId,
            role: "developer" // Default role
        });
        res.status(200).json({ message: "Joined project successfully", projectId: invite[0].projectId });
    }
    catch (error) {
        console.error("Error joining project by code:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.joinByCode = joinByCode;
const joinByLink = async (req, res) => {
    try {
        const { token } = req.params;
        const userId = req.user?.userId;
        if (!token || !userId) {
            res.status(400).json({ message: "Token and User ID are required" });
            return;
        }
        const invite = await db_1.db.select().from(schema_1.projectInvitations).where((0, drizzle_orm_1.eq)(schema_1.projectInvitations.linkToken, token)).limit(1);
        if (invite.length === 0 || !invite[0].isActive) {
            res.status(404).json({ message: "Invalid or inactive invite link" });
            return;
        }
        // Check if already a member
        const existing = await db_1.db.select().from(schema_1.projectMembers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.projectMembers.projectId, invite[0].projectId), (0, drizzle_orm_1.eq)(schema_1.projectMembers.userId, userId)))
            .limit(1);
        if (existing.length > 0) {
            res.status(400).json({ message: "You are already a member of this project" });
            return;
        }
        // Add member
        const memberIdLink = crypto_1.default.randomUUID();
        await db_1.db.insert(schema_1.projectMembers).values({
            id: memberIdLink,
            projectId: invite[0].projectId,
            userId: userId,
            role: "developer"
        });
        res.status(200).json({ message: "Joined project successfully", projectId: invite[0].projectId });
    }
    catch (error) {
        console.error("Error joining project by link:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.joinByLink = joinByLink;
// ── Join Requests (Approval System) ──────────────────────────────────────────
const requestToJoin = async (req, res) => {
    try {
        const { projectId, message } = req.body;
        const userId = req.user?.userId;
        if (!projectId || !userId) {
            res.status(400).json({ message: "Project ID and User ID are required" });
            return;
        }
        // Check if already a member
        const existing = await db_1.db.select().from(schema_1.projectMembers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.projectMembers.projectId, projectId), (0, drizzle_orm_1.eq)(schema_1.projectMembers.userId, userId)))
            .limit(1);
        if (existing.length > 0) {
            res.status(400).json({ message: "You are already a member of this project" });
            return;
        }
        // Check if existing request
        const existingReq = await db_1.db.select().from(schema_1.projectJoinRequests)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.projectJoinRequests.projectId, projectId), (0, drizzle_orm_1.eq)(schema_1.projectJoinRequests.userId, userId), (0, drizzle_orm_1.eq)(schema_1.projectJoinRequests.status, "Pending")))
            .limit(1);
        if (existingReq.length > 0) {
            res.status(400).json({ message: "You already have a pending request for this project" });
            return;
        }
        const requestId = crypto_1.default.randomUUID();
        await db_1.db.insert(schema_1.projectJoinRequests).values({
            id: requestId,
            projectId: projectId,
            userId,
            message: message || null,
            status: "Pending"
        });
        res.status(201).json({ message: "Join request submitted", id: requestId });
    }
    catch (error) {
        console.error("Error requesting to join project:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.requestToJoin = requestToJoin;
const getJoinRequests = async (req, res) => {
    try {
        const { id } = req.params; // projectId
        const userId = req.user?.userId;
        if (!userId || !(await (0, exports.hasManagerialAccess)(id, userId))) {
            res.status(403).json({ message: "Forbidden: Management rights required" });
            return;
        }
        const requests = await db_1.db
            .select({
            requestId: schema_1.projectJoinRequests.id,
            userId: schema_1.projectJoinRequests.userId,
            status: schema_1.projectJoinRequests.status,
            message: schema_1.projectJoinRequests.message,
            createdAt: schema_1.projectJoinRequests.createdAt,
            email: schema_1.users.email,
        })
            .from(schema_1.projectJoinRequests)
            .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.projectJoinRequests.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.eq)(schema_1.projectJoinRequests.projectId, id));
        res.status(200).json(requests);
    }
    catch (error) {
        console.error("Error fetching join requests:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getJoinRequests = getJoinRequests;
const processJoinRequest = async (req, res) => {
    try {
        const { id, requestId } = req.params; // projectId, requestId
        const { status } = req.body; // Approved, Rejected
        const userId = req.user?.userId;
        if (!userId || !(await (0, exports.hasManagerialAccess)(id, userId))) {
            res.status(403).json({ message: "Forbidden: Management rights required" });
            return;
        }
        if (!["Approved", "Rejected"].includes(status)) {
            res.status(400).json({ message: "Invalid status" });
            return;
        }
        const request = await db_1.db.select().from(schema_1.projectJoinRequests).where((0, drizzle_orm_1.eq)(schema_1.projectJoinRequests.id, requestId)).limit(1);
        if (request.length === 0) {
            res.status(404).json({ message: "Request not found" });
            return;
        }
        await db_1.db.update(schema_1.projectJoinRequests)
            .set({ status, processedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.projectJoinRequests.id, requestId));
        if (status === "Approved") {
            // Check if already a member (safety)
            const existing = await db_1.db.select().from(schema_1.projectMembers)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.projectMembers.projectId, id), (0, drizzle_orm_1.eq)(schema_1.projectMembers.userId, request[0].userId)))
                .limit(1);
            if (existing.length === 0) {
                const memberId = crypto_1.default.randomUUID();
                await db_1.db.insert(schema_1.projectMembers).values({
                    id: memberId,
                    projectId: id,
                    userId: request[0].userId,
                    role: "developer"
                });
            }
        }
        res.status(200).json({ message: `Request ${status}` });
    }
    catch (error) {
        console.error("Error processing join request:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.processJoinRequest = processJoinRequest;
const getGlobalTeam = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        // 1. Identify all workspaces where the user is an 'owner' or 'manager'
        const myWorkspaces = await db_1.db
            .select({ id: schema_1.workspaces.id })
            .from(schema_1.workspaces)
            .innerJoin(schema_1.workspaceMembers, (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.workspaceId, schema_1.workspaces.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workspaceMembers.userId, userId), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.workspaceMembers.role, 'owner'), (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.role, 'admin'))));
        if (myWorkspaces.length === 0) {
            res.status(200).json([]);
            return;
        }
        const workspaceIds = myWorkspaces.map(ws => ws.id);
        // 2. Fetch all members of these workspaces
        const members = await db_1.db
            .select({
            id: schema_1.workspaceMembers.id,
            userId: schema_1.users.id,
            email: schema_1.users.email,
            name: schema_1.users.email, // Use email as name if name is not available
            role: schema_1.workspaceMembers.role,
            joinedAt: schema_1.workspaceMembers.joinedAt,
            workspaceName: schema_1.workspaces.name,
            workspaceId: schema_1.workspaces.id,
            passKey: schema_1.workspaces.passKey
        })
            .from(schema_1.workspaceMembers)
            .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.userId, schema_1.users.id))
            .innerJoin(schema_1.workspaces, (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.workspaceId, schema_1.workspaces.id))
            .where((0, drizzle_orm_1.sql) `${schema_1.workspaceMembers.workspaceId} IN (${drizzle_orm_1.sql.join(workspaceIds.map(id => (0, drizzle_orm_1.sql) `${id}`), (0, drizzle_orm_1.sql) `, `)})`);
        // 3. Group by user to avoid duplicates if someone is in multiple workspaces, 
        // but for now, showing them per workspace might be clearer or we can unique them.
        // The user said "owner did not see which user join my workspace", so per-workspace is probably fine.
        res.status(200).json(members);
    }
    catch (error) {
        console.error("Error fetching global team:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getGlobalTeam = getGlobalTeam;
