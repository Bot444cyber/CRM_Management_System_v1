import express from "express";
import { getWorkspaces, createWorkspace, joinWorkspace, getWorkspace, updateWorkspace, deleteWorkspace, getProjects, createProject, getProject, getProjectDashboardData, updateProject, deleteProject, getWorkspaceMembers, updateWorkspaceMember, removeWorkspaceMember, inviteToWorkspace } from "../controllers/project.controller";

import { reserveInventory, getResourceRequests, createResourceRequest, processResourceRequest } from "../controllers/resource.controller";
import { getProjectMilestones, createProjectMilestone, updateProjectMilestone, deleteProjectMilestone } from "../controllers/milestone.controller";
import { getProjectMembers, addProjectMember, removeProjectMember, getProjectInvitation, resetInviteStrings, joinByCode, joinByLink, requestToJoin, getJoinRequests, processJoinRequest, getGlobalTeam } from "../controllers/team.controller";
import { searchUsers } from "../controllers/user.controller";
import { getProjectPulse, createPulseEvent } from "../controllers/pulse.controller";
import { getProjectReminders, createReminder, markReminderAsRead, getAllUserReminders } from "../controllers/reminder.controller";
import { getPMSSummary } from "../controllers/analytics.controller";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware";

const router = express.Router();

// All PMS routes require authentication
router.use(authenticate);

// ── Workspaces ───────────────────────────────────────────────────────────────
router.get("/workspaces", getWorkspaces);
router.post("/workspaces", createWorkspace);  // Any authenticated user can create their own workspace
router.post("/workspaces/join", joinWorkspace); // Join via pass-key
router.get("/workspaces/:id/details", getWorkspace);   // Get workspace details
router.post("/workspaces/:id/invite", inviteToWorkspace); // Send email invitations
router.patch("/workspaces/:id", updateWorkspace); // Update workspace settings
router.delete("/workspaces/:id", deleteWorkspace); // Delete workspace
router.get("/reminders", getAllUserReminders); // Global reminders
router.get("/workspaces/:id/members", getWorkspaceMembers); // View workspace members
router.patch("/workspaces/:id/members/:memberId", updateWorkspaceMember); // Update workspace member role
router.delete("/workspaces/:id/members/:memberId", removeWorkspaceMember); // Remove workspace member
router.get("/team/global", getGlobalTeam);     // Fetch all unique members across owned/managed workspaces
router.get("/users/search", searchUsers);      // Search users for member addition
router.get("/analytics/summary", getPMSSummary); // Aggregated PMS intelligence summary


// ── Projects ─────────────────────────────────────────────────────────────────
router.get("/workspaces/:workspaceId", getProjects);           // All roles: view
router.post("/", authorizeRoles("admin", "manager", "user"), createProject);    // Any owner can create
router.get("/:id", getProject);                                // All roles: view
router.get("/:id/dashboard", getProjectDashboardData);         // Consolidated dashboard data
router.put("/:id", authorizeRoles("admin", "manager", "user"), updateProject);  // Owner+ update
router.patch("/:id", authorizeRoles("admin", "manager", "user"), updateProject); // Kanban/Partial update
router.delete("/:id", authorizeRoles("admin", "manager", "user"), deleteProject); // Owner+ delete

// ── Inventory Reservation ────────────────────────────────────────────────────
router.post("/:id/inventory", authorizeRoles("admin", "manager", "user"), reserveInventory);

// ── Resource Requests ────────────────────────────────────────────────────────
router.get("/:id/resource-requests", getResourceRequests);                          // All roles view
router.post("/:id/resource-requests", authorizeRoles("admin", "manager", "team_leader", "developer", "designer"), createResourceRequest);
router.put("/:id/resource-requests/:requestId/approve", authorizeRoles("admin", "manager"), processResourceRequest); // Manager+ approve

// ── Milestones ───────────────────────────────────────────────────────────────
router.get("/:id/milestones", getProjectMilestones);                               // All roles view
router.post("/:id/milestones", authorizeRoles("admin", "manager", "team_leader", "user"), createProjectMilestone);  // TL+ create
router.put("/:id/milestones/:milestoneId", authorizeRoles("admin", "manager", "team_leader", "developer", "designer", "user"), updateProjectMilestone); // TL+ update
router.delete("/:id/milestones/:milestoneId", authorizeRoles("admin", "manager"), deleteProjectMilestone); // Manager only delete

// ── Team Management ──────────────────────────────────────────────────────────
router.get("/:id/members", getProjectMembers);                                      // All roles can view team
router.post("/:id/members", authorizeRoles("admin", "manager", "user"), addProjectMember);  // Manager only add
router.delete("/:id/members/:memberId", authorizeRoles("admin", "manager", "user"), removeProjectMember); // Manager only remove

// ── Team Invitation & Joining ────────────────────────────────────────────────
router.get("/:id/invitation", authorizeRoles("admin", "manager", "user"), getProjectInvitation);
router.put("/:id/invitation/reset", authorizeRoles("admin", "manager", "user"), resetInviteStrings);
router.post("/join/code", joinByCode);
router.post("/join/link/:token", joinByLink);
router.post("/join/request", requestToJoin);
router.get("/:id/join-requests", authorizeRoles("admin", "manager", "user"), getJoinRequests);
router.put("/:id/join-requests/:requestId", authorizeRoles("admin", "manager", "user"), processJoinRequest);

// ── Pulse (Activity Feed) ───────────────────────────────────────────────────
router.get("/:id/pulse", getProjectPulse);
router.post("/:id/pulse", authorizeRoles("admin", "manager", "team_leader"), createPulseEvent);

// ── Reminders ───────────────────────────────────────────────────────
router.get("/:id/reminders", getProjectReminders);
router.post("/:id/reminders", createReminder);
router.put("/reminders/:reminderId/read", markReminderAsRead);

export default router;
