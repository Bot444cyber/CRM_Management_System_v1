"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const analytics_controller_1 = require("../controllers/analytics.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.get("/", auth_middleware_1.authenticate, analytics_controller_1.getAnalytics);
router.get("/insights", auth_middleware_1.authenticate, analytics_controller_1.getDashboardInsights);
exports.default = router;
