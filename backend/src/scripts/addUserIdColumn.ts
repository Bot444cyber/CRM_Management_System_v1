import { db } from "../config/db";
import { sql } from "drizzle-orm";

/**
 * Comprehensive migration script that:
 * 1. Adds user_id to inventories (if column doesn't exist)
 * 2. Adds user_id to analytics (if column doesn't exist)
 * 3. Creates the activity_logs table (if it doesn't exist)
 * 
 * MySQL-compatible: checks INFORMATION_SCHEMA before altering, no IF NOT EXISTS for ALTER
 */
async function migrate() {
    console.log("🔄 Starting comprehensive migration...\n");

    // ── 1. Add user_id to inventories ────────────────────────────────────────
    const [inventoryCols] = await db.execute<any>(sql`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'inventories'
        AND COLUMN_NAME = 'user_id'
    `);
    if ((inventoryCols as unknown as any[]).length === 0) {
        await db.execute(sql`ALTER TABLE inventories ADD COLUMN user_id INT NULL AFTER id`);
        console.log("✅ user_id column added to inventories");
    } else {
        console.log("⏭️  inventories.user_id already exists — skipping");
    }

    // ── 2. Add user_id to analytics ──────────────────────────────────────────
    const [analyticsCols] = await db.execute<any>(sql`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'analytics'
        AND COLUMN_NAME = 'user_id'
    `);
    if ((analyticsCols as unknown as any[]).length === 0) {
        await db.execute(sql`ALTER TABLE analytics ADD COLUMN user_id INT NULL AFTER id`);
        console.log("✅ user_id column added to analytics");
    } else {
        console.log("⏭️  analytics.user_id already exists — skipping");
    }

    // ── 3. Create activity_logs table ─────────────────────────────────────────
    const [activityTable] = await db.execute<any>(sql`
        SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'activity_logs'
    `);
    if ((activityTable as unknown as any[]).length === 0) {
        await db.execute(sql`
            CREATE TABLE activity_logs (
                id          INT AUTO_INCREMENT PRIMARY KEY,
                user_id     INT NOT NULL,
                action_type VARCHAR(255) NOT NULL,
                entity_id   VARCHAR(255) NOT NULL,
                entity_details JSON,
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ activity_logs table created");
    } else {
        console.log("⏭️  activity_logs table already exists — skipping");
    }

    console.log("\n✅ Migration complete!");
    process.exit(0);
}

migrate().catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
});
