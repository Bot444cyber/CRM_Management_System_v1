"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const project_controller_1 = require("../controllers/project.controller");
const resource_controller_1 = require("../controllers/resource.controller");
const milestone_controller_1 = require("../controllers/milestone.controller");
const team_controller_1 = require("../controllers/team.controller");
const user_controller_1 = require("../controllers/user.controller");
const pulse_controller_1 = require("../controllers/pulse.controller");
const reminder_controller_1 = require("../controllers/reminder.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// All PMS routes require authentication
router.use(auth_middleware_1.authenticate);
// ── Workspaces ───────────────────────────────────────────────────────────────
router.get("/workspaces", project_controller_1.getWorkspaces);
router.post("/workspaces", project_controller_1.createWorkspace); // Any authenticated user can create their own workspace
router.post("/workspaces/join", project_controller_1.joinWorkspace); // Join via pass-key
router.get("/reminders", reminder_controller_1.getAllUserReminders); // Global reminders
router.get("/workspaces/:id/members", project_controller_1.getWorkspaceMembers); // View workspace members
router.patch("/workspaces/:id/members/:memberId", project_controller_1.updateWorkspaceMember); // Update workspace member role
router.delete("/workspaces/:id/members/:memberId", project_controller_1.removeWorkspaceMember); // Remove workspace member
router.get("/team/global", team_controller_1.getGlobalTeam); // Fetch all unique members across owned/managed workspaces
router.get("/users/search", user_controller_1.searchUsers); // Search users for member addition
// ── Projects ─────────────────────────────────────────────────────────────────
router.get("/workspaces/:workspaceId", project_controller_1.getProjects); // All roles: view
router.post("/", (0, auth_middleware_1.authorizeRoles)("admin", "manager", "user"), project_controller_1.createProject); // Any owner can create
router.get("/:id", project_controller_1.getProject); // All roles: view
router.put("/:id", (0, auth_middleware_1.authorizeRoles)("admin", "manager", "user"), project_controller_1.updateProject); // Owner+ update
router.patch("/:id", (0, auth_middleware_1.authorizeRoles)("admin", "manager", "user"), project_controller_1.updateProject); // Kanban/Partial update
router.delete("/:id", (0, auth_middleware_1.authorizeRoles)("admin", "manager", "user"), project_controller_1.deleteProject); // Owner+ delete
// ── Inventory Reservation ────────────────────────────────────────────────────
router.post("/:id/inventory", (0, auth_middleware_1.authorizeRoles)("admin", "manager", "user"), resource_controller_1.reserveInventory);
// ── Resource Requests ────────────────────────────────────────────────────────
router.get("/:id/resource-requests", resource_controller_1.getResourceRequests); // All roles view
router.post("/:id/resource-requests", (0, auth_middleware_1.authorizeRoles)("admin", "manager", "team_leader", "developer", "designer"), resource_controller_1.createResourceRequest);
router.put("/:id/resource-requests/:requestId/approve", (0, auth_middleware_1.authorizeRoles)("admin", "manager"), resource_controller_1.processResourceRequest); // Manager+ approve
// ── Milestones ───────────────────────────────────────────────────────────────
router.get("/:id/milestones", milestone_controller_1.getProjectMilestones); // All roles view
router.post("/:id/milestones", (0, auth_middleware_1.authorizeRoles)("admin", "manager", "team_leader", "user"), milestone_controller_1.createProjectMilestone); // TL+ create
router.put("/:id/milestones/:milestoneId", (0, auth_middleware_1.authorizeRoles)("admin", "manager", "team_leader", "developer", "designer", "user"), milestone_controller_1.updateProjectMilestone); // TL+ update
// ── Team Management ──────────────────────────────────────────────────────────
router.get("/:id/members", team_controller_1.getProjectMembers); // All roles can view team
router.post("/:id/members", (0, auth_middleware_1.authorizeRoles)("admin", "manager", "user"), team_controller_1.addProjectMember); // Manager only add
router.delete("/:id/members/:memberId", (0, auth_middleware_1.authorizeRoles)("admin", "manager", "user"), team_controller_1.removeProjectMember); // Manager only remove
// ── Team Invitation & Joining ────────────────────────────────────────────────
router.get("/:id/invitation", (0, auth_middleware_1.authorizeRoles)("admin", "manager", "user"), team_controller_1.getProjectInvitation);
router.put("/:id/invitation/reset", (0, auth_middleware_1.authorizeRoles)("admin", "manager", "user"), team_controller_1.resetInviteStrings);
router.post("/join/code", team_controller_1.joinByCode);
router.post("/join/link/:token", team_controller_1.joinByLink);
router.post("/join/request", team_controller_1.requestToJoin);
router.get("/:id/join-requests", (0, auth_middleware_1.authorizeRoles)("admin", "manager", "user"), team_controller_1.getJoinRequests);
router.put("/:id/join-requests/:requestId", (0, auth_middleware_1.authorizeRoles)("admin", "manager", "user"), team_controller_1.processJoinRequest);
// ── Pulse (Activity Feed) ───────────────────────────────────────────────────
router.get("/:id/pulse", pulse_controller_1.getProjectPulse);
router.post("/:id/pulse", (0, auth_middleware_1.authorizeRoles)("admin", "manager", "team_leader"), pulse_controller_1.createPulseEvent);
// ── Reminders ───────────────────────────────────────────────────────
router.get("/:id/reminders", reminder_controller_1.getProjectReminders);
router.post("/:id/reminders", reminder_controller_1.createReminder);
router.put("/reminders/:reminderId/read", reminder_controller_1.markReminderAsRead);
exports.default = router;
