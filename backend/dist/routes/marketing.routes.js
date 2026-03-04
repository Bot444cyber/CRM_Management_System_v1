"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const marketing_controller_1 = require("../controllers/marketing.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.authenticate);
router.get("/customer-lookup", marketing_controller_1.lookupCustomer);
router.post("/sell", marketing_controller_1.recordSale);
router.get("/sales", marketing_controller_1.getSales);
exports.default = router;
