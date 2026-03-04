import { Router } from "express";
import { extractProductDetails, chatWithProductAssistant } from "../controllers/ai.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/extract-product", authenticate, extractProductDetails);
router.post("/chat", authenticate, chatWithProductAssistant);

export default router;
