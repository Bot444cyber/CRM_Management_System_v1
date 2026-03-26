import express from "express";
import { getWorkspaces, createWorkspace, getProjects, createProject, getProject, reserveInventory, getProjectMilestones, createProjectMilestone, updateProjectMilestone, getResourceRequests, createResourceRequest, processResourceRequest, getProjectPulse } from "../controllers/projects.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

// All project routes require authentication
router.use(authenticate);

// Workspaces
router.get("/workspaces", getWorkspaces);
router.post("/workspaces", createWorkspace);

// Projects
router.get("/workspaces/:workspaceId", getProjects);
router.post("/", createProject);
router.get("/:id", getProject);
router.get("/pulse/:id", getProjectPulse);

// Project Inventory
router.post("/:id/inventory", reserveInventory);

// Project Milestones
router.get("/:id/milestones", getProjectMilestones);
router.post("/:id/milestones", createProjectMilestone);
router.put("/:id/milestones/:milestoneId", updateProjectMilestone);

// Project Resource Requests
router.get("/:id/resource-requests", getResourceRequests);
router.post("/:id/resource-requests", createResourceRequest);
router.put("/:id/resource-requests/:requestId/approve", processResourceRequest);

export default router;
