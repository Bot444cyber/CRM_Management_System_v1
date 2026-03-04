import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { db } from "../config/db";
import { analytics, activityLogs, customers, inventories } from "../db/schema";
import { eq, and } from "drizzle-orm";

export const extractProductDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const { imageBase64, mimeType } = req.body;

        if (!imageBase64 || !mimeType) {
            res.status(400).json({ error: "Missing imageBase64 or mimeType" });
            return;
        }

        if (!process.env.GEMINI_API_KEY) {
            res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
            return;
        }

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        const prompt = `Analyze this product image and extract the following details to fill a product form. 
            Return ONLY a valid JSON object with the following keys:
            - 'name': The name of the product (string, e.g., 'Wireless Headphones'). Keep it concise.
            - 'price': An estimated price as a string with 2 decimals (e.g., '29.99'). If unsure, use '0.00'.
            - 'stock': A default stock quantity integer. Use 1.
            - 'discount': A default discount percentage integer. Use 0.
            - 'description': A brief, professional description of the product based on its visible features.

            Do not include markdown formatting like \`\`\`json in the response, just the raw JSON text.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                prompt,
                {
                    inlineData: {
                        data: imageBase64,
                        mimeType: mimeType,
                    }
                }
            ],
            config: {
                responseMimeType: "application/json"
            }
        });

        if (!response.text) {
            res.status(500).json({ error: "Failed to generate content from Gemini" });
            return;
        }

        try {
            const parsedData = JSON.parse(response.text);
            res.status(200).json(parsedData);
            return;
        } catch (parseError) {
            console.error("Failed to parse JSON from Gemini:", response.text);
            res.status(500).json({ error: "Gemini returned invalid JSON format" });
            return;
        }
    } catch (error) {
        console.error("Error in extractProductDetails:", error);
        res.status(500).json({ error: "Internal server error during image extraction" });
        return;
    }
};

/** Shared helpers copied from analytics.controller.ts for use in AI context */
function parseDetails(raw: any): any {
    if (!raw) return null;
    if (typeof raw === "string") {
        try { return JSON.parse(raw); } catch { return null; }
    }
    return raw;
}

function parsePrice(val: any): number {
    if (val == null) return 0;
    const num = parseFloat(String(val).replace(/[^0-9.-]+/g, ""));
    return isNaN(num) ? 0 : num;
}

export const chatWithProductAssistant = async (req: Request, res: Response): Promise<void> => {
    try {
        const { catalog, messages } = req.body;

        if (!catalog || !messages || !Array.isArray(messages)) {
            res.status(400).json({ error: "Missing catalog or messages array" });
            return;
        }

        if (!process.env.GEMINI_API_KEY) {
            res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
            return;
        }

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        const userId = req.user?.userId || 1; // Assuming a single user system or we'd need to pass token to this endpoint properly

        // 1. Gather all basic sales logs for analytics context
        let totalRevenue = 0;
        let totalItemsSold = 0;
        const productSales = new Map<string, { units: number, revenue: number }>();

        try {
            const salesLogs = await db.select().from(activityLogs)
                .where(and(eq(activityLogs.userId, userId), eq(activityLogs.actionType, "RECORD_SALE")));

            for (const log of salesLogs) {
                const d = parseDetails(log.entityDetails);
                if (!d) continue;

                // Grab what price we can from the log directly
                const unitPrice = parsePrice(d.price);
                const qty = Number(d.quantity) || 1;
                const rev = unitPrice * qty;

                totalRevenue += rev;
                totalItemsSold += qty;

                const prodName = d.subProductName || d.mainProductName;
                if (prodName) {
                    const existing = productSales.get(prodName) || { units: 0, revenue: 0 };
                    productSales.set(prodName, {
                        units: existing.units + qty,
                        revenue: existing.revenue + rev
                    });
                }
            }
        } catch (e) {
            console.error("Failed to gather analytics for AI context", e);
        }

        const topProducts = Array.from(productSales.entries())
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        const topProductsStr = topProducts.length > 0
            ? topProducts.map(p => `- ${p.name}: ${p.units} units sold ($${p.revenue.toFixed(2)} total)`).join('\n')
            : "No sales data yet.";

        // Convert the catalog array into a readable string format for the AI
        const catalogDetails = catalog.map((p: any) =>
            `- ${p.name} (in ${p.inventory} / ${p.mainProduct}) | Price: $${p.price} | Stock: ${p.stock > 0 ? p.stock : 'Out of stock'} | Status: ${p.status}`
        ).join('\n');

        // Construct System Instruction context
        const systemInstruction = `You are a helpful, extremely polite, and professional virtual shopping and business assistant for a premium brand.
Your goal is to assist the user with questions about the products available in their inventory dashboard, AS WELL AS provide them with high-level sales analytics if requested. 

Only use the provided Catalog and Analytics data to answer questions. If asked about something unrelated, politely steer the conversation back or say you don't know. Keep your answers concise, engaging, and suitable for a chat interface. Do not list all products or data unless explicitly asked. Format your responses using markdown lists and bold text where appropriate for readability.

--- AVAILABLE PRODUCT CATALOG ---
${catalogDetails || 'No products available.'}

--- SALES & ANALYTICS DATA ---
Total Overall Revenue: $${totalRevenue.toFixed(2)}
Total Items Sold: ${totalItemsSold}
Top Selling Products (by Revenue):
${topProductsStr}
`;

        // Format history for Gemini
        const formattedContents = messages.map((msg: any) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: formattedContents,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        if (!response.text) {
            res.status(500).json({ error: "Failed to generate content from Gemini" });
            return;
        }

        res.status(200).json({ reply: response.text });
        return;

    } catch (error) {
        console.error("Error in chatWithProductAssistant:", error);
        res.status(500).json({ error: "Internal server error during chat processing" });
        return;
    }
};
