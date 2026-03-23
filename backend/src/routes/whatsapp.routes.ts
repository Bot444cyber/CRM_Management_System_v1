import express from "express";
import { getWhatsAppGroups, publishToWhatsApp } from "../controllers/whatsapp.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/groups", authenticate, getWhatsAppGroups);
router.post("/publish", authenticate, publishToWhatsApp);

export default router;
