import { Request, Response } from "express";
import { db } from "../config/db";
import { chatChannels, chatMessages, workspaceMembers, users, chatChannelMembers } from "../db/schema";


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
        const userId = Number(req.user?.userId);

        if (!workspaceId || isNaN(userId)) {
            res.status(400).json({ message: "Missing Workspace ID or User Session" });
            return;
        }

        const access = await checkWorkspaceAccess(String(workspaceId), userId);
        if (!access) {
            res.status(403).json({ message: "Forbidden: Access restricted to workspace members" });
            return;
        }

        // 1. Ensure 'General' channel exists for this workspace
        const generalChannel = await db.select({ id: chatChannels.id }).from(chatChannels).where(and(eq(chatChannels.workspaceId, String(workspaceId)), eq(chatChannels.name, 'General'))).limit(1);
        if (generalChannel.length === 0) {
            await db.insert(chatChannels).values({ id: crypto.randomUUID(), workspaceId: String(workspaceId), name: 'General', type: 'public' });
        }

        // 2. Fetch all channels the user can see (public or they are a member)
        // First get the IDs of the channels the user is in
        const userChannelIdsRes = await db.select({ channelId: chatChannelMembers.channelId }).from(chatChannelMembers).where(eq(chatChannelMembers.userId, userId));
        const userChannelIds = userChannelIdsRes.map(chr => chr.channelId);

        // Fetch the channels
        const channels = await db
            .select({
                id: chatChannels.id,
                workspaceId: chatChannels.workspaceId,
                name: chatChannels.name,
                type: chatChannels.type,
                createdAt: chatChannels.createdAt
            })
            .from(chatChannels)
            .where(
                and(
                    eq(chatChannels.workspaceId, String(workspaceId)),
                    sql`(${chatChannels.type} = 'public' OR ${chatChannels.id} IN (${userChannelIds.length > 0 ? userChannelIds.map(id => `'${id}'`).join(',') : "'none'"}))`
                )
            );

        const processedChannels = [];

        for (const c of channels) {
            let processed = { ...c, otherMemberName: null as string | null, otherMemberReadAt: null as Date | null };

            if (c.type === 'dm') {
                // Find the other member of this DM
                const otherM = await db
                    .select({
                        name: users.name,
                        email: users.email,
                        lastReadAt: chatChannelMembers.lastReadAt
                    })
                    .from(chatChannelMembers)
                    .innerJoin(users, eq(chatChannelMembers.userId, users.id))
                    .where(
                        and(
                            eq(chatChannelMembers.channelId, c.id),
                            sql`${chatChannelMembers.userId} != ${userId}`
                        )
                    )
                    .limit(1);

                if (otherM.length > 0) {
                    processed.otherMemberName = otherM[0].name || otherM[0].email.split('@')[0];
                    processed.otherMemberReadAt = otherM[0].lastReadAt;
                }
            }
            processedChannels.push(processed);
        }

        res.status(200).json(processedChannels);
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
                createdAt: chatMessages.createdAt,
                senderName: sql`COALESCE(NULLIF(${users.name}, ''), SUBSTRING_INDEX(${users.email}, '@', 1))`
            })
            .from(chatMessages)
            .innerJoin(users, eq(chatMessages.senderId, users.id))
            .where(and(...conditions))
            .orderBy(desc(chatMessages.createdAt))
            .limit(50);

        // Update lastReadAt for current user in this channel
        if (userId && channelId) {
            await db.update(chatChannelMembers)
                .set({ lastReadAt: new Date() })
                .where(
                    and(
                        eq(chatChannelMembers.channelId, String(channelId)),
                        eq(chatChannelMembers.userId, userId)
                    )
                );
        }

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

export const getWorkspaceMembers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { workspaceId } = req.query;
        const userId = req.user?.userId;

        if (!workspaceId || !userId) {
            res.status(400).json({ message: "Missing Workspace ID or User Session" });
            return;
        }

        const access = await checkWorkspaceAccess(String(workspaceId), userId);
        if (!access) {
            res.status(403).json({ message: "Forbidden: Access restricted to workspace members" });
            return;
        }

        const members = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                userName: sql`COALESCE(NULLIF(${users.name}, ''), SUBSTRING_INDEX(${users.email}, '@', 1))`,
                role: workspaceMembers.role,
                lastActive: users.lastActive,
            })
            .from(workspaceMembers)
            .innerJoin(users, eq(workspaceMembers.userId, users.id))
            .where(eq(workspaceMembers.workspaceId, String(workspaceId)));

        const now = new Date();
        const results = members.map(m => ({
            ...m,
            isOnline: m.lastActive ? (now.getTime() - new Date(m.lastActive).getTime()) < 60000 : false // Online if active in last 60s
        }));

        res.status(200).json(results);
    } catch (error) {
        console.error("Error in getWorkspaceMembers:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getOrCreateDM = async (req: Request, res: Response): Promise<void> => {
    try {
        const { workspaceId, targetUserId } = req.body;
        const userId = req.user?.userId;

        if (!workspaceId || !targetUserId || !userId) {
            res.status(400).json({ message: "Missing required parameters" });
            return;
        }

        const tId = Number(targetUserId);

        // Check if DM already exists in this workspace
        const existingDM = await db
            .select({ id: chatChannels.id })
            .from(chatChannels)
            .innerJoin(chatChannelMembers, eq(chatChannels.id, chatChannelMembers.channelId))
            .where(
                and(
                    eq(chatChannels.workspaceId, String(workspaceId)),
                    eq(chatChannels.type, 'dm'),
                    eq(chatChannelMembers.userId, userId)
                )
            );

        for (const dm of existingDM) {
            const isTargetIn = await db
                .select({ id: chatChannelMembers.id })
                .from(chatChannelMembers)
                .where(
                    and(
                        eq(chatChannelMembers.channelId, dm.id),
                        eq(chatChannelMembers.userId, tId)
                    )
                )
                .limit(1);

            if (isTargetIn.length > 0) {
                res.status(200).json({ id: dm.id });
                return;
            }
        }

        // Create new DM channel
        const channelId = crypto.randomUUID();
        await db.insert(chatChannels).values({
            id: channelId,
            workspaceId: String(workspaceId),
            name: `dm-${userId}-${tId}`,
            type: 'dm'
        });

        // Add both members
        await db.insert(chatChannelMembers).values([
            { id: crypto.randomUUID(), channelId, userId: userId },
            { id: crypto.randomUUID(), channelId, userId: tId }
        ]);

        res.status(201).json({ id: channelId });
    } catch (error) {
        console.error("Error in getOrCreateDM:", error);
        res.status(500).json({ message: "Server error" });
    }
};

