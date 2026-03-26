"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUsers = void 0;
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== "string") {
            res.status(200).json([]);
            return;
        }
        const query = `%${q}%`;
        const results = await db_1.db
            .select({
            id: schema_1.users.id,
            email: schema_1.users.email,
            role: schema_1.users.role,
        })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema_1.users.email, query)))
            .limit(10);
        res.status(200).json(results);
    }
    catch (error) {
        console.error("Error searching users:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.searchUsers = searchUsers;
