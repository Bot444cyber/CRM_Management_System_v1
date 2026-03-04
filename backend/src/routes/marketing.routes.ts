import express from "express";
import { lookupCustomer, recordSale, getSales } from "../controllers/marketing.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

router.use(authenticate);

router.get("/customer-lookup", lookupCustomer);
router.post("/sell", recordSale);
router.get("/sales", getSales);

export default router;
