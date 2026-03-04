import { sql } from "drizzle-orm";
import {
    mysqlTable,
    int,
    varchar,
    boolean,
    timestamp,
    json,
    decimal,
    text
} from "drizzle-orm/mysql-core";

// Interfaces
export interface SubProduct {
    name: string;
    price: string;
    stock: number;
    discount: number;
    status: 'Active' | 'Draft' | 'Archived';
    url?: string;
    imageUrl?: string;
}

export interface MainProduct {
    name: string;
    imageUrl?: string;
    subProducts: SubProduct[];
}

export interface PurchasedProduct {
    inventoryId: string;
    subProductName: string;
}

// Tables
export const users = mysqlTable("users", {
    id: int("id").autoincrement().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }),
    isVerified: boolean("is_verified").default(false),
    isTwoFactorEnabled: boolean("is_two_factor_enabled").default(false),
    role: varchar("role", { length: 50 }).default("user"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
});

export const oauthAccounts = mysqlTable("oauth_accounts", {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id").notNull(),
    provider: varchar("provider", { length: 50 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const verificationTokens = mysqlTable("verification_tokens", {
    id: int("id").autoincrement().primaryKey(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires").notNull(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const inventories = mysqlTable("inventories", {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: int("user_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    imageUrl: varchar("image_url", { length: 2048 }),
    mainProducts: json("main_products").$type<MainProduct[]>(),
    // Legacy columns (kept for backward compat)
    mainProduct: varchar("main_product", { length: 255 }).notNull().default(""),
    mainProductImageUrl: varchar("main_product_image_url", { length: 2048 }),
    subProducts: json("sub_products").$type<SubProduct[]>().notNull().default([]),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const analytics = mysqlTable("analytics", {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: int("user_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    value: int("value").notNull(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const customers = mysqlTable("customers", {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: int("user_id").notNull().default(0),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    location: varchar("location", { length: 255 }),
    orders: int("orders").default(0),
    spent: varchar("spent", { length: 50 }).default("$ 0"),
    rating: decimal("rating", { precision: 3, scale: 1 }),
    avatar: varchar("avatar", { length: 10 }),
    purchasedProducts: json("purchased_products").$type<PurchasedProduct[]>().default([]),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const notifications = mysqlTable("notifications", {
    id: varchar("id", { length: 255 }).primaryKey(),
    type: varchar("type", { length: 50 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    time: varchar("time", { length: 50 }),
    icon: varchar("icon", { length: 255 }),
    color: varchar("color", { length: 255 }),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const activityLogs = mysqlTable("activity_logs", {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id").notNull(),
    actionType: varchar("action_type", { length: 255 }).notNull(),
    entityId: varchar("entity_id", { length: 255 }).notNull(),
    entityDetails: json("entity_details"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});
