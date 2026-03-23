import { Router } from "express";
import { wipeData, getGreenAPI, updateGreenAPI } from "../controllers/settings.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.delete("/wipe-data", authenticate, wipeData);
router.get("/green-api", authenticate, getGreenAPI);
router.put("/green-api", authenticate, updateGreenAPI);

export default router;
