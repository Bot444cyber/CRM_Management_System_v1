"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customers_controller_1 = require("../controllers/customers.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.authenticate);
router.get("/", customers_controller_1.getCustomers);
router.get("/:id", customers_controller_1.getCustomerById);
router.post("/", customers_controller_1.createCustomer);
router.put("/:id", customers_controller_1.updateCustomer);
router.delete("/:id", customers_controller_1.deleteCustomer);
exports.default = router;
