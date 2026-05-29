import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";

// .envファイルを読み込む
try {
  const envContent = readFileSync("/home/ubuntu/the-herbs-counseling/.env", "utf8");
  const lines = envContent.split("\n");
  for (const line of lines) {
    const [key, ...vals] = line.split("=");
    if (key && vals.length) process.env[key.trim()] = vals.join("=").trim();
  }
} catch {}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

const conn = await mysql.createConnection(dbUrl);
const [rows] = await conn.execute("SELECT id, code, type, label, isActive, partnerSalonId FROM passcodes");
console.log("Passcodes in DB:", JSON.stringify(rows, null, 2));
await conn.end();
