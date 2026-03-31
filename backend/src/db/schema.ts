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
    name: varchar("name", { length: 255 }), // User's full name
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }),
    isVerified: boolean("is_verified").default(false),
    isTwoFactorEnabled: boolean("is_two_factor_enabled").default(false),
    role: varchar("role", { length: 50 }).default("user"),
    greenApiInstanceId: varchar("green_api_instance_id", { length: 255 }),
    greenApiToken: varchar("green_api_token", { length: 255 }),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
    lastActive: timestamp("last_active").default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
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

export const workspaces = mysqlTable("workspaces", {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: int("user_id").notNull(), // Original creator
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    passKey: varchar("pass_key", { length: 10 }).unique(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const workspaceMembers = mysqlTable("workspace_members", {
    id: varchar("id", { length: 255 }).primaryKey(),
    workspaceId: varchar("workspace_id", { length: 255 }).notNull(),
    userId: int("user_id").notNull(),
    role: varchar("role", { length: 50 }).notNull().default("member"), // owner | manager | member
    joinedAt: timestamp("joined_at").default(sql`CURRENT_TIMESTAMP`),
});

export const projects = mysqlTable("projects", {
    id: varchar("id", { length: 255 }).primaryKey(),
    workspaceId: varchar("workspace_id", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 50 }).default("Active"), // Active, Completed, At Risk
    deadline: timestamp("deadline"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const projectInventory = mysqlTable("project_inventory", {
    id: varchar("id", { length: 255 }).primaryKey(),
    projectId: varchar("project_id", { length: 255 }).notNull(),
    inventoryId: varchar("inventory_id", { length: 255 }).notNull(),
    subProductName: varchar("sub_product_name", { length: 255 }).notNull(),
    requiredQuantity: int("required_quantity").notNull().default(1),
    reservedQuantity: int("reserved_quantity").notNull().default(0),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const projectMilestones = mysqlTable("project_milestones", {
    id: varchar("id", { length: 255 }).primaryKey(),
    projectId: varchar("project_id", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 50 }).default("Pending"), // Pending, In Progress, Completed
    dueDate: timestamp("due_date"),
    progress: int("progress").default(0), // 0 to 100
    assignedTo: int("assigned_to"), // User ID from users table
    priority: varchar("priority", { length: 50 }).default("Medium"), // Low, Medium, High
    tags: json("tags").$type<string[]>().default([]),
    estimatedHours: int("estimated_hours").default(0),
    actualHours: int("actual_hours").default(0),
    checklists: json("checklists").$type<{ id: string; text: string; completed: boolean }[]>().default([]),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const resourceRequests = mysqlTable("resource_requests", {
    id: varchar("id", { length: 255 }).primaryKey(),
    projectId: varchar("project_id", { length: 255 }).notNull(),
    inventoryId: varchar("inventory_id", { length: 255 }).notNull(),
    subProductName: varchar("sub_product_name", { length: 255 }).notNull(),
    requestedQuantity: int("requested_quantity").notNull().default(1),
    requestedByUserId: int("requested_by_user_id").notNull(),
    status: varchar("status", { length: 50 }).default("Pending"), // Pending, Approved, Denied
    pulseEventId: varchar("pulse_event_id", { length: 255 }),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
    processedAt: timestamp("processed_at"),
});

// PMS Roles: admin | manager | team_leader | developer | designer | customer | user
export const projectMembers = mysqlTable("project_members", {
    id: varchar("id", { length: 255 }).primaryKey(),
    projectId: varchar("project_id", { length: 255 }).notNull(),
    userId: int("user_id").notNull(),
    role: varchar("role", { length: 50 }).notNull().default("developer"), // admin | manager | team_leader | developer | designer | customer | user
    joinedAt: timestamp("joined_at").default(sql`CURRENT_TIMESTAMP`),
});

export const projectInvitations = mysqlTable("project_invitations", {
    id: varchar("id", { length: 255 }).primaryKey(),
    projectId: varchar("project_id", { length: 255 }).notNull(),
    code: varchar("code", { length: 10 }).notNull().unique(),
    linkToken: varchar("link_token", { length: 255 }).notNull().unique(),
    methods: json("methods").$type<string[]>().default(["code", "link", "approval"]), // Supported join methods
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
});

export const projectJoinRequests = mysqlTable("project_join_requests", {
    id: varchar("id", { length: 255 }).primaryKey(),
    projectId: varchar("project_id", { length: 255 }).notNull(),
    userId: int("user_id").notNull(),
    status: varchar("status", { length: 50 }).default("Pending"), // Pending, Approved, Rejected
    message: text("message"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
    processedAt: timestamp("processed_at"),
});

export const projectPulse = mysqlTable("project_pulse", {
    id: varchar("id", { length: 255 }).primaryKey(),
    projectId: varchar("project_id", { length: 255 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(), // SUCCESS, INFO, WARNING, CRITICAL
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    time: timestamp("time").default(sql`CURRENT_TIMESTAMP`),
});

export const projectReminders = mysqlTable("project_reminders", {
    id: varchar("id", { length: 255 }).primaryKey(),
    projectId: varchar("project_id", { length: 255 }).notNull(),
    userId: int("user_id").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    dueDate: timestamp("due_date"),
    isRead: boolean("is_read").default(false),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const chatChannels = mysqlTable("chat_channels", {
    id: varchar("id", { length: 255 }).primaryKey(),
    workspaceId: varchar("workspace_id", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    type: varchar("type", { length: 50 }).default("public"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const chatMessages = mysqlTable("chat_messages", {
    id: varchar("id", { length: 255 }).primaryKey(),
    channelId: varchar("channel_id", { length: 255 }).notNull(),
    senderId: int("sender_id").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const chatChannelMembers = mysqlTable("chat_channel_members", {
    id: varchar("id", { length: 255 }).primaryKey(),
    channelId: varchar("channel_id", { length: 255 }).notNull(),
    userId: int("user_id").notNull(),
    lastReadAt: timestamp("last_read_at").default(sql`CURRENT_TIMESTAMP`),
    joinedAt: timestamp("joined_at").default(sql`CURRENT_TIMESTAMP`),
});


