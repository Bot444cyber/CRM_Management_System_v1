import { Request, Response } from "express";
import WhatsAppService from "../services/whatsapp.service";
import { db } from "../config/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export const getWhatsAppGroups = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ status: false, message: "Unauthorized" });
            return;
        }

        const userRecord = await db.select({
            greenApiInstanceId: users.greenApiInstanceId,
            greenApiToken: users.greenApiToken
        }).from(users).where(eq(users.id, userId)).limit(1);

        if (!userRecord[0]?.greenApiInstanceId || !userRecord[0]?.greenApiToken) {
            res.status(400).json({ status: false, message: "Please configure your WhatsApp Integration in Workspace Settings." });
            return;
        }

        const groups = await WhatsAppService.fetchGroups(userRecord[0].greenApiInstanceId, userRecord[0].greenApiToken);
        res.status(200).json(groups);
    } catch (error) {
        console.error("WhatsApp Groups Error:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

export const publishToWhatsApp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { groupIds, productDetails, imageUrl } = req.body;

        if (!groupIds || !Array.isArray(groupIds) || groupIds.length === 0) {
            res.status(400).json({ status: false, message: "No groups selected" });
            return;
        }

        if (!productDetails) {
            res.status(400).json({ status: false, message: "Product details missing" });
            return;
        }

        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ status: false, message: "Unauthorized" });
            return;
        }

        const userRecord = await db.select({
            greenApiInstanceId: users.greenApiInstanceId,
            greenApiToken: users.greenApiToken
        }).from(users).where(eq(users.id, userId)).limit(1);

        if (!userRecord[0]?.greenApiInstanceId || !userRecord[0]?.greenApiToken) {
            res.status(400).json({ status: false, message: "Please configure your WhatsApp Integration in Workspace Settings." });
            return;
        }

        const { greenApiInstanceId, greenApiToken } = userRecord[0];

        // Format the message beautifully for marketing
        const message = `*✨ Just Arrived! New Collection ✨*\n\n` +
            `We are thrilled to announce our latest product is now available! 🎉\n\n` +
            `📦 *Product Name:* ${productDetails.name}\n` +
            `🏷️ *Variations:* ${productDetails.subProductsCount || 0} unique options available\n\n` +
            `Don't miss out on this fantastic addition to our catalog. Built for excellence and ready for you!\n\n` +
            `👇 *Interested?*\n` +
            `Reply directly to this message to inquire, pre-order, or ask for more details. We'd love to help you out! 💬\n\n` +
            `_Thank you for choosing Nexus._ 🌟`;

        // Dispatch messages to all selected groups
        const results = await Promise.all(
            groupIds.map(async (groupId: string) => {
                return await WhatsAppService.sendWhatsAppMessage(groupId, message, greenApiInstanceId, greenApiToken, imageUrl);
            })
        );

        const allSent = results.every(r => r.sent);

        if (allSent) {
            res.status(200).json({ status: true, message: "Successfully published to WhatsApp groups!" });
        } else {
            res.status(207).json({ status: true, message: "Published with some errors", details: results });
        }

    } catch (error) {
        console.error("WhatsApp Publish Error:", error);
        res.status(500).json({ status: false, message: "Internal server error while publishing" });
    }
};
