"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectMilestone = exports.createProjectMilestone = exports.getProjectMilestones = void 0;
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
const team_controller_1 = require("./team.controller");
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
        const requesterId = req.user?.userId;
        if (!requesterId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        if (!(await (0, team_controller_1.hasManagerialAccess)(id, requesterId))) {
            res.status(403).json({ message: "Forbidden: Management rights required" });
            return;
        }
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
        if (status) {
            if (status === "Completed") {
                const userId = req.user?.userId;
                if (userId) {
                    await db_1.db.insert(schema_1.activityLogs).values({
                        userId,
                        actionType: 'MILESTONE_COMPLETED',
                        entityId: milestoneId,
                        entityDetails: { projectId: id, status, progress }
                    });
                }
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
