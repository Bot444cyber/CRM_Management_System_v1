import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';
import dotenv from 'dotenv';
dotenv.config();

// Create the pool using an object to handle special characters safely
export const poolConnection = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1', 
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306, 
  
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,

  // Essential for keeping the connection alive on Hostinger
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

export const db = drizzle(poolConnection, { schema, mode: 'default' });

// Add a quick check to log if the connection fails
poolConnection.getConnection()
  .then(conn => {
    console.log("✅ Database Pool Initialized");
    conn.release();
  })
  .catch(err => {
    console.error("❌ Database Pool Error:", err.message);
  });

export const closeDbConnection = async () => {
  try {
    await poolConnection.end();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error closing database connection:", error);
  }
};