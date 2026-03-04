import { Router } from "express";
import { wipeData } from "../controllers/settings.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.delete("/wipe-data", authenticate, wipeData);

export default router;
