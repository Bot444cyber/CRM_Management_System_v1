"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const inventory_routes_1 = __importDefault(require("./routes/inventory.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const customers_routes_1 = __importDefault(require("./routes/customers.routes"));
const notifications_routes_1 = __importDefault(require("./routes/notifications.routes"));
const marketing_routes_1 = __importDefault(require("./routes/marketing.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const whatsapp_routes_1 = __importDefault(require("./routes/whatsapp.routes"));
const pms_routes_1 = __importDefault(require("./routes/pms.routes"));
const db_1 = require("./config/db");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use("/api/auth", auth_routes_1.default);
app.use("/api/inventories", inventory_routes_1.default);
app.use("/api/analytics", analytics_routes_1.default);
app.use("/api/customers", customers_routes_1.default);
app.use("/api/notifications", notifications_routes_1.default);
app.use("/api/marketing", marketing_routes_1.default);
app.use("/api/settings", settings_routes_1.default);
app.use("/api/ai", ai_routes_1.default);
app.use("/api/whatsapp", whatsapp_routes_1.default);
app.use("/api/pms", pms_routes_1.default);
app.get("/", (req, res) => {
    res.send("CRM Backend API is running");
});
app.listen(PORT, async () => {
    console.log(`🚀 Server listening on port ${PORT}`);
    try {
        const connection = await db_1.poolConnection.getConnection();
        console.log("✅ Database connected successfully");
        connection.release();
    }
    catch (error) {
        console.error("❌ Database connection failed:", error instanceof Error ? error.message : error);
    }
});
