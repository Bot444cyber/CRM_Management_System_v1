"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardInsights = exports.getAnalytics = void 0;
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const getAnalytics = async (req, res) => {
    try {
        const { inventoryId } = req.query;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const allData = await db_1.db.select().from(schema_1.analytics).where((0, drizzle_orm_1.eq)(schema_1.analytics.userId, userId));
        allData.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateA - dateB;
        });
        const inventoryLatest = new Map();
        const groupedByDay = new Map();
        // 1. Initialize the last 7 days with 0 so the chart always has a baseline
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            groupedByDay.set(dateStr, 0);
        }
        // 2. Process data and override totals for those days
        for (const curr of allData) {
            const date = curr.createdAt ? new Date(curr.createdAt) : new Date();
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            // Update the global latest tracking for this inventory
            inventoryLatest.set(curr.name, curr.value);
            // Calculate the total based on what is filtered
            let dayTotal = 0;
            for (const [invId, val] of inventoryLatest.entries()) {
                if (!inventoryId || inventoryId === 'all' || inventoryId === invId) {
                    dayTotal += val;
                }
            }
            // Only update if this date is within our 7-day window
            if (groupedByDay.has(dateStr)) {
                groupedByDay.set(dateStr, dayTotal);
            }
        }
        const result = Array.from(groupedByDay.entries()).map(([dateStr, total]) => ({
            name: dateStr,
            value: total
        }));
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error fetching analytics:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getAnalytics = getAnalytics;
const getDashboardInsights = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        // 1. Marketing Insights (from activity_logs WHERE actionType = 'RECORD_SALE')
        const { activityLogs, customers } = await Promise.resolve().then(() => __importStar(require("../db/schema")));
        const { and } = await Promise.resolve().then(() => __importStar(require("drizzle-orm")));
        const salesLogs = await db_1.db
            .select()
            .from(activityLogs)
            .where(and((0, drizzle_orm_1.eq)(activityLogs.userId, userId), (0, drizzle_orm_1.eq)(activityLogs.actionType, "RECORD_SALE")));
        let totalMarketingRevenue = 0;
        let totalSalesConverted = salesLogs.length;
        // Count top products
        const productCounts = new Map();
        for (const log of salesLogs) {
            const details = log.entityDetails;
            if (details) {
                // add to revenue
                if (details.price) {
                    const priceNum = parseFloat(String(details.price).replace(/[^0-9.-]+/g, ''));
                    if (!isNaN(priceNum)) {
                        totalMarketingRevenue += priceNum;
                    }
                }
                // Track top products
                const prodName = details.subProductName || details.mainProductName;
                if (prodName) {
                    productCounts.set(prodName, (productCounts.get(prodName) || 0) + 1);
                }
            }
        }
        const topProducts = Array.from(productCounts.entries())
            .map(([name, sales]) => ({ name, sales }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);
        // 2. Customer Insights (from customers table)
        const allCustomers = await db_1.db
            .select()
            .from(customers)
            .where((0, drizzle_orm_1.eq)(customers.userId, userId));
        const totalCustomers = allCustomers.length;
        let totalCustomerSpend = 0;
        const customerSpends = allCustomers.map(c => {
            const spendNum = parseFloat(String(c.spent).replace(/[^0-9.-]+/g, '')) || 0;
            totalCustomerSpend += spendNum;
            return {
                name: c.name,
                email: c.email,
                spent: spendNum,
                orders: c.orders || 0,
                avatar: c.avatar
            };
        });
        const averageSpend = totalCustomers > 0 ? (totalCustomerSpend / totalCustomers) : 0;
        const topCustomers = customerSpends
            .sort((a, b) => b.spent - a.spent)
            .slice(0, 5)
            .map(c => ({
            ...c,
            spentStr: `$${c.spent.toFixed(2)}`
        }));
        const topNames = topCustomers.map(c => c.name);
        // Build 3-day graph data
        const d3 = new Date();
        d3.setHours(0, 0, 0, 0);
        d3.setDate(d3.getDate() - 2); // 3 days inclusive (today, yesterday, day before)
        const cutoff3 = d3.getTime();
        const last3Days = new Map();
        for (let i = 2; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const dayObj = { date: dateStr };
            for (const name of topNames) {
                dayObj[name] = 0;
            }
            last3Days.set(dateStr, dayObj);
        }
        for (const log of salesLogs) {
            const date = log.createdAt ? new Date(log.createdAt) : new Date();
            if (date.getTime() >= cutoff3) {
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const details = log.entityDetails;
                const custName = details?.customerName;
                if (custName && topNames.includes(custName) && last3Days.has(dateStr)) {
                    const priceNum = parseFloat(String(details.price).replace(/[^0-9.-]+/g, '')) || 0;
                    const qtyNum = details.quantity || 1;
                    const dayObj = last3Days.get(dateStr);
                    dayObj[custName] += (priceNum * qtyNum);
                }
            }
        }
        const topCustomersGraph = Array.from(last3Days.values());
        res.status(200).json({
            marketing: {
                totalRevenue: totalMarketingRevenue,
                salesConverted: totalSalesConverted,
                topProducts
            },
            customers: {
                totalCustomers,
                averageSpend,
                topCustomers,
                topCustomersGraph
            }
        });
    }
    catch (error) {
        console.error("Error fetching dashboard insights:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getDashboardInsights = getDashboardInsights;
