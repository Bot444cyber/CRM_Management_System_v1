"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const drizzle_orm_1 = require("drizzle-orm");
/**
 * Adds user_id column to the customers table (idempotent — safe to run multiple times).
 */
async function migrate() {
    console.log("🔄 Adding user_id to customers table...\n");
    const [cols] = await db_1.db.execute((0, drizzle_orm_1.sql) `
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'customers'
        AND COLUMN_NAME = 'user_id'
    `);
    if (cols.length === 0) {
        await db_1.db.execute((0, drizzle_orm_1.sql) `ALTER TABLE customers ADD COLUMN user_id INT NOT NULL DEFAULT 0 AFTER id`);
        console.log("✅ user_id column added to customers");
    }
    else {
        console.log("⏭️  customers.user_id already exists — skipping");
    }
    console.log("\n✅ Migration complete!");
    process.exit(0);
}
migrate().catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
});
