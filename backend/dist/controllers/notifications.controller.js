"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = void 0;
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const paginationHelper_1 = require("../utils/paginationHelper");
const getNotifications = async (req, res) => {
    try {
        const { page, limit, offset } = (0, paginationHelper_1.parsePagination)(req.query);
        const [rows, countResult] = await Promise.all([
            db_1.db.select().from(schema_1.notifications).orderBy((0, drizzle_orm_1.desc)(schema_1.notifications.createdAt)).limit(limit).offset(offset),
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.notifications),
        ]);
        const total = Number(countResult[0]?.count ?? 0);
        res.status(200).json((0, paginationHelper_1.paginatedResponse)(rows, total, page, limit));
    }
    catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getNotifications = getNotifications;
