"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.poolConnection = exports.db = void 0;
const mysql2_1 = require("drizzle-orm/mysql2");
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const poolConnection = promise_1.default.createPool({
    uri: process.env.DATABASE_URL,
});
exports.poolConnection = poolConnection;
exports.db = (0, mysql2_1.drizzle)(poolConnection);
