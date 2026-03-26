"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const projects_controller_1 = require("../controllers/projects.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// All project routes require authentication
router.use(auth_middleware_1.authenticate);
// Workspaces
router.get("/workspaces", projects_controller_1.getWorkspaces);
router.post("/workspaces", projects_controller_1.createWorkspace);
// Projects
router.get("/workspaces/:workspaceId", projects_controller_1.getProjects);
router.post("/", projects_controller_1.createProject);
router.get("/:id", projects_controller_1.getProject);
router.get("/pulse/:id", projects_controller_1.getProjectPulse);
// Project Inventory
router.post("/:id/inventory", projects_controller_1.reserveInventory);
// Project Milestones
router.get("/:id/milestones", projects_controller_1.getProjectMilestones);
router.post("/:id/milestones", projects_controller_1.createProjectMilestone);
router.put("/:id/milestones/:milestoneId", projects_controller_1.updateProjectMilestone);
// Project Resource Requests
router.get("/:id/resource-requests", projects_controller_1.getResourceRequests);
router.post("/:id/resource-requests", projects_controller_1.createResourceRequest);
router.put("/:id/resource-requests/:requestId/approve", projects_controller_1.processResourceRequest);
exports.default = router;
