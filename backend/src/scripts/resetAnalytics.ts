import { db } from "../config/db";
import { analytics, inventories } from "../db/schema";
import crypto from "crypto";

async function resetAnalytics() {
    console.log("Emptying old analytics data...");
    await db.delete(analytics);

    console.log("Fetching all inventories...");
    const invs = await db.select().from(inventories);

    for (const inv of invs) {
        let totalProducts = 0;
        if (inv.mainProducts && Array.isArray(inv.mainProducts)) {
            totalProducts = inv.mainProducts.reduce((acc, mp) => acc + (mp.subProducts?.length || 0), 0);
        } else if (inv.subProducts && Array.isArray(inv.subProducts)) {
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

            await db.insert(analytics).values({
                id: crypto.randomUUID(),
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
