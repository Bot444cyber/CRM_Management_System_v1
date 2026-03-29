import { Router } from "express";
import * as chatController from "../controllers/chat.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/channels", authenticate, chatController.getChannels);
router.post("/channels", authenticate, chatController.createChannel);
router.get("/messages", authenticate, chatController.getMessages);
router.post("/messages", authenticate, chatController.sendMessage);
router.get("/members", authenticate, chatController.getWorkspaceMembers);
router.post("/dm", authenticate, chatController.getOrCreateDM);



export default router;
