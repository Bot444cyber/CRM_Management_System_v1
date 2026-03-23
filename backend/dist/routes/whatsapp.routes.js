"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const whatsapp_controller_1 = require("../controllers/whatsapp.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.get("/groups", auth_middleware_1.authenticate, whatsapp_controller_1.getWhatsAppGroups);
router.post("/publish", auth_middleware_1.authenticate, whatsapp_controller_1.publishToWhatsApp);
exports.default = router;
