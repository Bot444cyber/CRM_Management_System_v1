import dotenv from "dotenv";
dotenv.config();

import express, { Express, Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import inventoryRoutes from "./routes/inventory.routes";
import analyticsRoutes from "./routes/analytics.routes";
import customersRoutes from "./routes/customers.routes";
import notificationsRoutes from "./routes/notifications.routes";
import marketingRoutes from "./routes/marketing.routes";
import settingsRoutes from "./routes/settings.routes";
import aiRoutes from "./routes/ai.routes";
import whatsappRoutes from "./routes/whatsapp.routes";
import pmsRoutes from "./routes/pms.routes";
import { poolConnection } from "./config/db";

const app: Express = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));

app.use("/api/auth", authRoutes);
app.use("/api/inventories", inventoryRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/marketing", marketingRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/pms", pmsRoutes);

app.get("/", (req: Request, res: Response) => {
    res.send("CRM Backend API is running");
});

app.listen(PORT, async () => {
    console.log(`🚀 Server listening on port ${PORT}`);

    try {
        const connection = await poolConnection.getConnection();
        console.log("✅ Database connected successfully");
        connection.release();
    }
    catch (error) {
        console.error("❌ Database connection failed:", error instanceof Error ? error.message : error);
    }
});






