import express from "express";
import { getAnalytics, getDashboardInsights, getSalesBreakdown } from "../controllers/analytics.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/", authenticate, getAnalytics);
router.get("/insights", authenticate, getDashboardInsights);
router.get("/sales-breakdown", authenticate, getSalesBreakdown);

export default router;
