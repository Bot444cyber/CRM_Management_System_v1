"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityLogs = exports.notifications = exports.customers = exports.analytics = exports.inventories = exports.verificationTokens = exports.oauthAccounts = exports.users = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const mysql_core_1 = require("drizzle-orm/mysql-core");
// Tables
exports.users = (0, mysql_core_1.mysqlTable)("users", {
    id: (0, mysql_core_1.int)("id").autoincrement().primaryKey(),
    email: (0, mysql_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    password: (0, mysql_core_1.varchar)("password", { length: 255 }),
    isVerified: (0, mysql_core_1.boolean)("is_verified").default(false),
    isTwoFactorEnabled: (0, mysql_core_1.boolean)("is_two_factor_enabled").default(false),
    role: (0, mysql_core_1.varchar)("role", { length: 50 }).default("user"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).onUpdateNow(),
});
exports.oauthAccounts = (0, mysql_core_1.mysqlTable)("oauth_accounts", {
    id: (0, mysql_core_1.int)("id").autoincrement().primaryKey(),
    userId: (0, mysql_core_1.int)("user_id").notNull(),
    provider: (0, mysql_core_1.varchar)("provider", { length: 50 }).notNull(),
    providerAccountId: (0, mysql_core_1.varchar)("provider_account_id", { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.verificationTokens = (0, mysql_core_1.mysqlTable)("verification_tokens", {
    id: (0, mysql_core_1.int)("id").autoincrement().primaryKey(),
    identifier: (0, mysql_core_1.varchar)("identifier", { length: 255 }).notNull(),
    token: (0, mysql_core_1.varchar)("token", { length: 255 }).notNull(),
    expires: (0, mysql_core_1.timestamp)("expires").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.inventories = (0, mysql_core_1.mysqlTable)("inventories", {
    id: (0, mysql_core_1.varchar)("id", { length: 255 }).primaryKey(),
    userId: (0, mysql_core_1.int)("user_id").notNull(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    imageUrl: (0, mysql_core_1.varchar)("image_url", { length: 2048 }),
    mainProducts: (0, mysql_core_1.json)("main_products").$type(),
    // Legacy columns (kept for backward compat)
    mainProduct: (0, mysql_core_1.varchar)("main_product", { length: 255 }).notNull().default(""),
    mainProductImageUrl: (0, mysql_core_1.varchar)("main_product_image_url", { length: 2048 }),
    subProducts: (0, mysql_core_1.json)("sub_products").$type().notNull().default([]),
    createdAt: (0, mysql_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.analytics = (0, mysql_core_1.mysqlTable)("analytics", {
    id: (0, mysql_core_1.varchar)("id", { length: 255 }).primaryKey(),
    userId: (0, mysql_core_1.int)("user_id").notNull(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    value: (0, mysql_core_1.int)("value").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.customers = (0, mysql_core_1.mysqlTable)("customers", {
    id: (0, mysql_core_1.varchar)("id", { length: 255 }).primaryKey(),
    userId: (0, mysql_core_1.int)("user_id").notNull().default(0),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    email: (0, mysql_core_1.varchar)("email", { length: 255 }).notNull(),
    location: (0, mysql_core_1.varchar)("location", { length: 255 }),
    orders: (0, mysql_core_1.int)("orders").default(0),
    spent: (0, mysql_core_1.varchar)("spent", { length: 50 }).default("$ 0"),
    rating: (0, mysql_core_1.decimal)("rating", { precision: 3, scale: 1 }),
    avatar: (0, mysql_core_1.varchar)("avatar", { length: 10 }),
    purchasedProducts: (0, mysql_core_1.json)("purchased_products").$type().default([]),
    createdAt: (0, mysql_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.notifications = (0, mysql_core_1.mysqlTable)("notifications", {
    id: (0, mysql_core_1.varchar)("id", { length: 255 }).primaryKey(),
    type: (0, mysql_core_1.varchar)("type", { length: 50 }).notNull(),
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    message: (0, mysql_core_1.text)("message").notNull(),
    time: (0, mysql_core_1.varchar)("time", { length: 50 }),
    icon: (0, mysql_core_1.varchar)("icon", { length: 255 }),
    color: (0, mysql_core_1.varchar)("color", { length: 255 }),
    createdAt: (0, mysql_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.activityLogs = (0, mysql_core_1.mysqlTable)("activity_logs", {
    id: (0, mysql_core_1.int)("id").autoincrement().primaryKey(),
    userId: (0, mysql_core_1.int)("user_id").notNull(),
    actionType: (0, mysql_core_1.varchar)("action_type", { length: 255 }).notNull(),
    entityId: (0, mysql_core_1.varchar)("entity_id", { length: 255 }).notNull(),
    entityDetails: (0, mysql_core_1.json)("entity_details"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
