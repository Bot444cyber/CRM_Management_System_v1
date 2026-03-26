"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPulseEvent = exports.getProjectPulse = void 0;
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
const getProjectPulse = async (req, res) => {
    try {
        const { id } = req.params; // projectId
        const rows = await db_1.db.select().from(schema_1.projectPulse)
            .where((0, drizzle_orm_1.eq)(schema_1.projectPulse.projectId, id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.projectPulse.time));
        res.status(200).json(rows);
    }
    catch (error) {
        console.error("Error fetching project pulse:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getProjectPulse = getProjectPulse;
const createPulseEvent = async (req, res) => {
    try {
        const { id } = req.params; // projectId
        const { type, title, message } = req.body;
        if (!type || !title || !message) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        const pulseId = crypto_1.default.randomUUID();
        const newEvent = {
            id: pulseId,
            projectId: id,
            type,
            title,
            message,
            time: new Date()
        };
        await db_1.db.insert(schema_1.projectPulse).values(newEvent);
        res.status(201).json(newEvent);
    }
    catch (error) {
        console.error("Error creating pulse event:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.createPulseEvent = createPulseEvent;
