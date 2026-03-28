"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatMessages = exports.chatChannels = exports.projectReminders = exports.projectPulse = exports.projectJoinRequests = exports.projectInvitations = exports.projectMembers = exports.resourceRequests = exports.projectMilestones = exports.projectInventory = exports.projects = exports.workspaceMembers = exports.workspaces = exports.activityLogs = exports.notifications = exports.customers = exports.analytics = exports.inventories = exports.verificationTokens = exports.oauthAccounts = exports.users = void 0;
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
    greenApiInstanceId: (0, mysql_core_1.varchar)("green_api_instance_id", { length: 255 }),
    greenApiToken: (0, mysql_core_1.varchar)("green_api_token", { length: 255 }),
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
exports.workspaces = (0, mysql_core_1.mysqlTable)("workspaces", {
    id: (0, mysql_core_1.varchar)("id", { length: 255 }).primaryKey(),
    userId: (0, mysql_core_1.int)("user_id").notNull(), // Original creator
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    description: (0, mysql_core_1.text)("description"),
    passKey: (0, mysql_core_1.varchar)("pass_key", { length: 10 }).unique(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.workspaceMembers = (0, mysql_core_1.mysqlTable)("workspace_members", {
    id: (0, mysql_core_1.varchar)("id", { length: 255 }).primaryKey(),
    workspaceId: (0, mysql_core_1.varchar)("workspace_id", { length: 255 }).notNull(),
    userId: (0, mysql_core_1.int)("user_id").notNull(),
    role: (0, mysql_core_1.varchar)("role", { length: 50 }).notNull().default("member"), // owner | manager | member
    joinedAt: (0, mysql_core_1.timestamp)("joined_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.projects = (0, mysql_core_1.mysqlTable)("projects", {
    id: (0, mysql_core_1.varchar)("id", { length: 255 }).primaryKey(),
    workspaceId: (0, mysql_core_1.varchar)("workspace_id", { length: 255 }).notNull(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    description: (0, mysql_core_1.text)("description"),
    status: (0, mysql_core_1.varchar)("status", { length: 50 }).default("Active"), // Active, Completed, At Risk
    deadline: (0, mysql_core_1.timestamp)("deadline"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.projectInventory = (0, mysql_core_1.mysqlTable)("project_inventory", {
    id: (0, mysql_core_1.varchar)("id", { length: 255 }).primaryKey(),
    projectId: (0, mysql_core_1.varchar)("project_id", { length: 255 }).notNull(),
    inventoryId: (0, mysql_core_1.varchar)("inventory_id", { length: 255 }).notNull(),
    subProductName: (0, mysql_core_1.varchar)("sub_product_name", { length: 255 }).notNull(),
    requiredQuantity: (0, mysql_core_1.int)("required_quantity").notNull().default(1),
    reservedQuantity: (0, mysql_core_1.int)("reserved_quantity").notNull().default(0),
    createdAt: (0, mysql_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.projectMilestones = (0, mysql_core_1.mysqlTable)("project_milestones", {
    id: (0, mysql_core_1.varchar)("id", { length: 255 }).primaryKey(),
    projectId: (0, mysql_core_1.varchar)("project_id", { length: 255 }).notNull(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    description: (0, mysql_core_1.text)("description"),
    status: (0, mysql_core_1.varchar)("status", { length: 50 }).default("Pending"), // Pending, In Progress, Completed
    dueDate: (0, mysql_core_1.timestamp)("due_date"),
    progress: (0, mysql_core_1.int)("progress").default(0), // 0 to 100
    createdAt: (0, mysql_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.resourceRequests = (0, mysql_core_1.mysqlTable)("resource_requests", {
    id: (0, mysql_core_1.varchar)("id", { length: 255 }).primaryKey(),
    projectId: (0, mysql_core_1.varchar)("project_id", { length: 255 }).notNull(),
    inventoryId: (0, mysql_core_1.varchar)("inventory_id", { length: 255 }).notNull(),
    subProductName: (0, mysql_core_1.varchar)("sub_product_name", { length: 255 }).notNull(),
    requestedQuantity: (0, mysql_core_1.int)("requested_quantity").notNull().default(1),
    requestedByUserId: (0, mysql_core_1.int)("requested_by_user_id").notNull(),
    status: (0, mysql_core_1.varchar)("status", { length: 50 }).default("Pending"), // Pending, Approved, Denied
    pulseEventId: (0, mysql_core_1.varchar)("pulse_event_id", { length: 255 }),
    createdAt: (0, mysql_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    processedAt: (0, mysql_core_1.timestamp)("processed_at"),
});
// PMS Roles: admin | manager | team_leader | developer | designer | customer | user
exports.projectMembers = (0, mysql_core_1.mysqlTable)("project_members", {
    id: (0, mysql_core_1.varchar)("id", { length: 255 }).primaryKey(),
    projectId: (0, mysql_core_1.varchar)("project_id", { length: 255 }).notNull(),
    userId: (0, mysql_core_1.int)("user_id").notNull(),
    role: (0, mysql_core_1.varchar)("role", { length: 50 }).notNull().default("developer"), // admin | manager | team_leader | developer | designer | customer | user
    joinedAt: (0, mysql_core_1.timestamp)("joined_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.projectInvitations = (0, mysql_core_1.mysqlTable)("project_invitations", {
    id: (0, mysql_core_1.varchar)("id", { length: 255 }).primaryKey(),
    projectId: (0, mysql_core_1.varchar)("project_id", { length: 255 }).notNull(),
    code: (0, mysql_core_1.varchar)("code", { length: 10 }).notNull().unique(),
    linkToken: (0, mysql_core_1.varchar)("link_token", { length: 255 }).notNull().unique(),
    methods: (0, mysql_core_1.json)("methods").$type().default(["code", "link", "approval"]), // Supported join methods
    isActive: (0, mysql_core_1.boolean)("is_active").default(true),
    createdAt: (0, mysql_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).onUpdateNow(),
});
exports.projectJoinRequests = (0, mysql_core_1.mysqlTable)("project_join_requests", {
    id: (0, mysql_core_1.varchar)("id", { length: 255 }).primaryKey(),
    projectId: (0, mysql_core_1.varchar)("project_id", { length: 255 }).notNull(),
    userId: (0, mysql_core_1.int)("user_id").notNull(),
    status: (0, mysql_core_1.varchar)("status", { length: 50 }).default("Pending"), // Pending, Approved, Rejected
    message: (0, mysql_core_1.text)("message"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    processedAt: (0, mysql_core_1.timestamp)("processed_at"),
});
exports.projectPulse = (0, mysql_core_1.mysqlTable)("project_pulse", {
    id: (0, mysql_core_1.varchar)("id", { length: 255 }).primaryKey(),
    projectId: (0, mysql_core_1.varchar)("project_id", { length: 255 }).notNull(),
    type: (0, mysql_core_1.varchar)("type", { length: 50 }).notNull(), // SUCCESS, INFO, WARNING, CRITICAL
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    message: (0, mysql_core_1.text)("message").notNull(),
    time: (0, mysql_core_1.timestamp)("time").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.projectReminders = (0, mysql_core_1.mysqlTable)("project_reminders", {
    id: (0, mysql_core_1.varchar)("id", { length: 255 }).primaryKey(),
    projectId: (0, mysql_core_1.varchar)("project_id", { length: 255 }).notNull(),
    userId: (0, mysql_core_1.int)("user_id").notNull(),
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    message: (0, mysql_core_1.text)("message").notNull(),
    dueDate: (0, mysql_core_1.timestamp)("due_date"),
    isRead: (0, mysql_core_1.boolean)("is_read").default(false),
    createdAt: (0, mysql_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.chatChannels = (0, mysql_core_1.mysqlTable)("chat_channels", {
    id: (0, mysql_core_1.varchar)("id", { length: 255 }).primaryKey(),
    workspaceId: (0, mysql_core_1.varchar)("workspace_id", { length: 255 }).notNull(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    type: (0, mysql_core_1.varchar)("type", { length: 50 }).default("public"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.chatMessages = (0, mysql_core_1.mysqlTable)("chat_messages", {
    id: (0, mysql_core_1.varchar)("id", { length: 255 }).primaryKey(),
    channelId: (0, mysql_core_1.varchar)("channel_id", { length: 255 }).notNull(),
    senderId: (0, mysql_core_1.int)("sender_id").notNull(),
    content: (0, mysql_core_1.text)("content").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
