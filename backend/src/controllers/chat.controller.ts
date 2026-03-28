import { Request, Response } from "express";
import { db } from "../config/db";
import { chatChannels, chatMessages, workspaceMembers } from "../db/schema";
import { eq, and, sql, desc, gt } from "drizzle-orm";
import crypto from "crypto";

// Helper to check membership
const checkWorkspaceAccess = async (workspaceId: string, userId: any) => {
    try {
        const uId = Number(userId);
        if (isNaN(uId)) return null;

        const member = await db
            .select({ id: workspaceMembers.id, role: workspaceMembers.role })
            .from(workspaceMembers)
            .where(
                and(
                    eq(workspaceMembers.workspaceId, workspaceId),
                    eq(workspaceMembers.userId, uId)
                )
            )
            .limit(1);
        return member.length > 0 ? member[0] : null;
    } catch (e) {
        console.error("CheckWorkspaceAccess error:", e);
        return null;
    }
};

export const getChannels = async (req: Request, res: Response): Promise<void> => {
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

        const channels = await db
            .select({
                id: chatChannels.id,
                workspaceId: chatChannels.workspaceId,
                name: chatChannels.name,
                type: chatChannels.type,
                createdAt: chatChannels.createdAt
            })
            .from(chatChannels)
            .where(eq(chatChannels.workspaceId, String(workspaceId)));

        res.status(200).json(channels);
    } catch (error) {
        console.error("Error in getChannels:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const { channelId, lastTimestamp } = req.query;
        const userId = req.user?.userId;

        if (!channelId || !userId) {
            res.status(400).json({ message: "Missing required parameters" });
            return;
        }

        // Verify channel and workspace access
        const channelResult = await db
            .select({ id: chatChannels.id, workspaceId: chatChannels.workspaceId })
            .from(chatChannels)
            .where(eq(chatChannels.id, String(channelId)))
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

        let conditions = [eq(chatMessages.channelId, String(channelId))];

        if (lastTimestamp && lastTimestamp !== "undefined" && lastTimestamp !== "null") {
            try {
                const date = new Date(String(lastTimestamp));
                if (!isNaN(date.getTime())) {
                    conditions.push(gt(chatMessages.createdAt, date));
                }
            } catch (e) {
                console.error("Invalid timestamp:", lastTimestamp);
            }
        }

        const messages = await db
            .select({
                id: chatMessages.id,
                channelId: chatMessages.channelId,
                senderId: chatMessages.senderId,
                content: chatMessages.content,
                createdAt: chatMessages.createdAt
            })
            .from(chatMessages)
            .where(and(...conditions))
            .orderBy(desc(chatMessages.createdAt))
            .limit(50);

        res.status(200).json(messages.reverse());
    } catch (error) {
        console.error("Error in getMessages:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { channelId, content } = req.body;
        const userId = req.user?.userId;

        if (!channelId || !content || !userId) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        // Verify channel and workspace access
        const channelResult = await db
            .select({ id: chatChannels.id, workspaceId: chatChannels.workspaceId })
            .from(chatChannels)
            .where(eq(chatChannels.id, String(channelId)))
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

        const id = crypto.randomUUID();
        const newMessage = {
            id,
            channelId,
            senderId: Number(userId),
            content,
            createdAt: new Date()
        };

        await db.insert(chatMessages).values(newMessage);
        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const createChannel = async (req: Request, res: Response): Promise<void> => {
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

        const id = crypto.randomUUID();
        await db.insert(chatChannels).values({ id, workspaceId, name, type: type || "public" });
        res.status(201).json({ message: "Channel created", id });
    } catch (error) {
        console.error("Error in createChannel:", error);
        res.status(500).json({ message: "Server error" });
    }
};
