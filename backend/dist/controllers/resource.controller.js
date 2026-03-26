"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processResourceRequest = exports.createResourceRequest = exports.getResourceRequests = exports.reserveInventory = void 0;
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
const reserveInventory = async (req, res) => {
    try {
        const { id } = req.params; // projectId
        const { inventoryId, subProductName, requiredQuantity } = req.body;
        if (!inventoryId || !subProductName || !requiredQuantity) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        const invId = crypto_1.default.randomUUID();
        await db_1.db.insert(schema_1.projectInventory).values({
            id: invId,
            projectId: id,
            inventoryId: inventoryId,
            subProductName: subProductName,
            requiredQuantity: Number(requiredQuantity)
        });
        res.status(201).json({ message: "Inventory reserved successfully", id: invId });
    }
    catch (error) {
        console.error("Error reserving inventory:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.reserveInventory = reserveInventory;
const getResourceRequests = async (req, res) => {
    try {
        const { id } = req.params;
        const rows = await db_1.db.select().from(schema_1.resourceRequests).where((0, drizzle_orm_1.eq)(schema_1.resourceRequests.projectId, id));
        res.status(200).json(rows);
    }
    catch (error) {
        console.error("Error fetching resource requests:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getResourceRequests = getResourceRequests;
const createResourceRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { inventoryId, subProductName, requestedQuantity } = req.body;
        const userId = req.user?.userId;
        if (!inventoryId || !subProductName || !requestedQuantity || !userId) {
            res.status(400).json({ message: "Missing required fields or unauthorized" });
            return;
        }
        const reqId = crypto_1.default.randomUUID();
        await db_1.db.insert(schema_1.resourceRequests).values({
            id: reqId,
            projectId: id,
            inventoryId: inventoryId,
            subProductName: subProductName,
            requestedQuantity: Number(requestedQuantity),
            requestedByUserId: userId
        });
        // Pulse: Resource requested
        await db_1.db.insert(schema_1.activityLogs).values({
            userId,
            actionType: 'RESOURCE_REQUESTED',
            entityId: reqId,
            entityDetails: { projectId: id, inventoryId, subProductName, requestedQuantity, priority: "Action Needed" }
        });
        res.status(201).json({ message: "Resource request submitted", id: reqId });
    }
    catch (error) {
        console.error("Error submitting resource request:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.createResourceRequest = createResourceRequest;
const processResourceRequest = async (req, res) => {
    try {
        const { id, requestId } = req.params;
        const { status } = req.body; // 'Approved' or 'Denied'
        const userId = req.user?.userId;
        if (!status || !userId) {
            res.status(400).json({ message: "Missing required fields or unauthorized" });
            return;
        }
        const reqRows = await db_1.db.select().from(schema_1.resourceRequests).where((0, drizzle_orm_1.eq)(schema_1.resourceRequests.id, requestId)).limit(1);
        if (!reqRows.length) {
            res.status(404).json({ message: "Request not found" });
            return;
        }
        const rRequest = reqRows[0];
        await db_1.db.update(schema_1.resourceRequests).set({
            status,
            processedAt: new Date()
        }).where((0, drizzle_orm_1.eq)(schema_1.resourceRequests.id, requestId));
        if (status === "Approved") {
            const existingLinks = await db_1.db.select().from(schema_1.projectInventory)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.projectInventory.projectId, id), (0, drizzle_orm_1.eq)(schema_1.projectInventory.inventoryId, rRequest.inventoryId), (0, drizzle_orm_1.eq)(schema_1.projectInventory.subProductName, rRequest.subProductName)))
                .limit(1);
            if (existingLinks.length > 0) {
                await db_1.db.update(schema_1.projectInventory)
                    .set({ requiredQuantity: existingLinks[0].requiredQuantity + rRequest.requestedQuantity })
                    .where((0, drizzle_orm_1.eq)(schema_1.projectInventory.id, existingLinks[0].id));
            }
            else {
                await db_1.db.insert(schema_1.projectInventory).values({
                    id: crypto_1.default.randomUUID(),
                    projectId: id,
                    inventoryId: rRequest.inventoryId,
                    subProductName: rRequest.subProductName,
                    requiredQuantity: rRequest.requestedQuantity
                });
            }
        }
        // Pulse log for manager action
        await db_1.db.insert(schema_1.activityLogs).values({
            userId,
            actionType: `RESOURCE_REQUEST_${status.toUpperCase()}`,
            entityId: requestId,
            entityDetails: { projectId: id, status, subProductName: rRequest.subProductName }
        });
        res.status(200).json({ message: `Request ${status}` });
    }
    catch (error) {
        console.error("Error processing resource request:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.processResourceRequest = processResourceRequest;
