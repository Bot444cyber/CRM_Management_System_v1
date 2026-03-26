"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markReminderAsRead = exports.createReminder = exports.getAllUserReminders = exports.getProjectReminders = void 0;
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
const getProjectReminders = async (req, res) => {
    try {
        const { id } = req.params; // projectId
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const rows = await db_1.db.select().from(schema_1.projectReminders)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.projectReminders.projectId, id), (0, drizzle_orm_1.eq)(schema_1.projectReminders.userId, userId)))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.projectReminders.createdAt));
        res.status(200).json(rows);
    }
    catch (error) {
        console.error("Error fetching reminders:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getProjectReminders = getProjectReminders;
const getAllUserReminders = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const rows = await db_1.db.select().from(schema_1.projectReminders)
            .where((0, drizzle_orm_1.eq)(schema_1.projectReminders.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.projectReminders.createdAt));
        res.status(200).json(rows);
    }
    catch (error) {
        console.error("Error fetching global reminders:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getAllUserReminders = getAllUserReminders;
const createReminder = async (req, res) => {
    try {
        const { id } = req.params; // projectId
        const { title, message, dueDate } = req.body;
        const userId = req.user?.userId;
        if (!title || !message || !userId) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        const reminderId = crypto_1.default.randomUUID();
        const newReminder = {
            id: reminderId,
            projectId: id,
            userId,
            title,
            message,
            dueDate: dueDate ? new Date(dueDate) : null,
            isRead: false,
            createdAt: new Date()
        };
        await db_1.db.insert(schema_1.projectReminders).values(newReminder);
        res.status(201).json(newReminder);
    }
    catch (error) {
        console.error("Error creating reminder:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.createReminder = createReminder;
const markReminderAsRead = async (req, res) => {
    try {
        const { reminderId } = req.params;
        await db_1.db.update(schema_1.projectReminders)
            .set({ isRead: true })
            .where((0, drizzle_orm_1.eq)(schema_1.projectReminders.id, reminderId));
        res.status(200).json({ message: "Reminder marked as read" });
    }
    catch (error) {
        console.error("Error updating reminder:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.markReminderAsRead = markReminderAsRead;
