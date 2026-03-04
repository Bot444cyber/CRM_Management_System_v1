import express from "express";
import { getInventories, createInventory, updateInventory, deleteInventory } from "../controllers/inventory.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/", authenticate, getInventories);
router.post("/", authenticate, createInventory);
router.put("/:id", authenticate, updateInventory);
router.delete("/:id", authenticate, deleteInventory);

export default router;
