"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChannel = exports.sendMessage = exports.getMessages = exports.getChannels = void 0;
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
// Helper to check membership
const checkWorkspaceAccess = async (workspaceId, userId) => {
    try {
        const uId = Number(userId);
        if (isNaN(uId))
            return null;
        const member = await db_1.db
            .select({ id: schema_1.workspaceMembers.id, role: schema_1.workspaceMembers.role })
            .from(schema_1.workspaceMembers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.workspaceMembers.workspaceId, workspaceId), (0, drizzle_orm_1.eq)(schema_1.workspaceMembers.userId, uId)))
            .limit(1);
        return member.length > 0 ? member[0] : null;
    }
    catch (e) {
        console.error("CheckWorkspaceAccess error:", e);
        return null;
    }
};
const getChannels = async (req, res) => {
    try {
        const { workspaceId } = req.query;
        const userId = req.user?.userId;
        if (!workspaceId || !userId) {
            res.status(400).json({ message: "Missing Workspace ID or User Session" });
            return;
        }
        const access = await checkWorkspaceAccess(String(workspaceId), userId);
        if (!access) {
            console.warn(`Access denied for user ${userId} to workspace ${workspaceId}`);
            res.status(403).json({ message: "Forbidden: Access restricted to workspace members" });
            return;
        }
        const channels = await db_1.db
            .select({
            id: schema_1.chatChannels.id,
            workspaceId: schema_1.chatChannels.workspaceId,
            name: schema_1.chatChannels.name,
            type: schema_1.chatChannels.type,
            createdAt: schema_1.chatChannels.createdAt
        })
            .from(schema_1.chatChannels)
            .where((0, drizzle_orm_1.eq)(schema_1.chatChannels.workspaceId, String(workspaceId)));
        res.status(200).json(channels);
    }
    catch (error) {
        console.error("Error in getChannels:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getChannels = getChannels;
const getMessages = async (req, res) => {
    try {
        const { channelId, lastTimestamp } = req.query;
        const userId = req.user?.userId;
        if (!channelId || !userId) {
            res.status(400).json({ message: "Missing required parameters" });
            return;
        }
        // Verify channel and workspace access
        const channelResult = await db_1.db
            .select({ id: schema_1.chatChannels.id, workspaceId: schema_1.chatChannels.workspaceId })
            .from(schema_1.chatChannels)
            .where((0, drizzle_orm_1.eq)(schema_1.chatChannels.id, String(channelId)))
            .limit(1);
        if (channelResult.length === 0) {
            res.status(404).json({ message: "Channel not found" });
            return;
        }
        const access = await checkWorkspaceAccess(channelResult[0].workspaceId, userId);
        if (!access) {
            res.status(403).json({ message: "Forbidden: No access to this channel" });
            return;
        }
        let conditions = [(0, drizzle_orm_1.eq)(schema_1.chatMessages.channelId, String(channelId))];
        if (lastTimestamp && lastTimestamp !== "undefined" && lastTimestamp !== "null") {
            try {
                const date = new Date(String(lastTimestamp));
                if (!isNaN(date.getTime())) {
                    conditions.push((0, drizzle_orm_1.gt)(schema_1.chatMessages.createdAt, date));
                }
            }
            catch (e) {
                console.error("Invalid timestamp:", lastTimestamp);
            }
        }
        const messages = await db_1.db
            .select({
            id: schema_1.chatMessages.id,
            channelId: schema_1.chatMessages.channelId,
            senderId: schema_1.chatMessages.senderId,
            content: schema_1.chatMessages.content,
            createdAt: schema_1.chatMessages.createdAt
        })
            .from(schema_1.chatMessages)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.chatMessages.createdAt))
            .limit(50);
        res.status(200).json(messages.reverse());
    }
    catch (error) {
        console.error("Error in getMessages:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getMessages = getMessages;
const sendMessage = async (req, res) => {
    try {
        const { channelId, content } = req.body;
        const userId = req.user?.userId;
        if (!channelId || !content || !userId) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        // Verify channel and workspace access
        const channelResult = await db_1.db
            .select({ id: schema_1.chatChannels.id, workspaceId: schema_1.chatChannels.workspaceId })
            .from(schema_1.chatChannels)
            .where((0, drizzle_orm_1.eq)(schema_1.chatChannels.id, String(channelId)))
            .limit(1);
        if (channelResult.length === 0) {
            res.status(404).json({ message: "Channel not found" });
            return;
        }
        const access = await checkWorkspaceAccess(channelResult[0].workspaceId, userId);
        if (!access) {
            res.status(403).json({ message: "Forbidden: No access to this channel" });
            return;
        }
        const id = crypto_1.default.randomUUID();
        const newMessage = {
            id,
            channelId,
            senderId: Number(userId),
            content,
            createdAt: new Date()
        };
        await db_1.db.insert(schema_1.chatMessages).values(newMessage);
        res.status(201).json(newMessage);
    }
    catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.sendMessage = sendMessage;
const createChannel = async (req, res) => {
    try {
        const { workspaceId, name, type } = req.body;
        const userId = req.user?.userId;
        if (!workspaceId || !name || !userId) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        // Only allow workspace owners or managers to create channels
        const access = await checkWorkspaceAccess(String(workspaceId), userId);
        if (!access || (access.role !== "owner" && access.role !== "manager")) {
            res.status(403).json({ message: "Forbidden: Insufficient permissions to create channels" });
            return;
        }
        const id = crypto_1.default.randomUUID();
        await db_1.db.insert(schema_1.chatChannels).values({ id, workspaceId, name, type: type || "public" });
        res.status(201).json({ message: "Channel created", id });
    }
    catch (error) {
        console.error("Error in createChannel:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.createChannel = createChannel;
