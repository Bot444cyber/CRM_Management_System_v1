"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inventory_controller_1 = require("../controllers/inventory.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.get("/", auth_middleware_1.authenticate, inventory_controller_1.getInventories);
router.post("/", auth_middleware_1.authenticate, inventory_controller_1.createInventory);
router.put("/:id", auth_middleware_1.authenticate, inventory_controller_1.updateInventory);
router.delete("/:id", auth_middleware_1.authenticate, inventory_controller_1.deleteInventory);
exports.default = router;
