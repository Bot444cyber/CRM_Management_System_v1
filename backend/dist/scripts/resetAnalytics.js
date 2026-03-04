"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
const crypto_1 = __importDefault(require("crypto"));
async function resetAnalytics() {
    console.log("Emptying old analytics data...");
    await db_1.db.delete(schema_1.analytics);
    console.log("Fetching all inventories...");
    const invs = await db_1.db.select().from(schema_1.inventories);
    for (const inv of invs) {
        let totalProducts = 0;
        if (inv.mainProducts && Array.isArray(inv.mainProducts)) {
            totalProducts = inv.mainProducts.reduce((acc, mp) => acc + (mp.subProducts?.length || 0), 0);
        }
        else if (inv.subProducts && Array.isArray(inv.subProducts)) {
            // Fallback for legacy data
            totalProducts = inv.subProducts.length;
        }
        console.log(`Inventory ${inv.name} has ${totalProducts} products.`);
        // Generate simulated timeline up to 6 points before today + current point
        // To make it look like a real chart
        for (let i = 6; i >= 0; i--) {
            // slightly fluctuate past data so chart looks interesting but ends on real data
            const fluctuation = i === 0 ? 0 : Math.floor(Math.random() * 3) - 1;
            const val = Math.max(0, totalProducts - (i * 2) + fluctuation);
            const date = new Date();
            date.setDate(date.getDate() - i);
            await db_1.db.insert(schema_1.analytics).values({
                id: crypto_1.default.randomUUID(),
                userId: inv.userId,
                name: inv.id, // we store inventoryId in name
                value: val,
                createdAt: date,
            });
        }
    }
    console.log("Analytics reset complete with simulated timeline history.");
    process.exit(0);
}
resetAnalytics().catch(console.error);
