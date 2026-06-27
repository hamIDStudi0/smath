// scripts/push-schema.ts
import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config();

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const statements = [
  `CREATE TABLE IF NOT EXISTS "AdminUser" (
    "id"           INTEGER PRIMARY KEY AUTOINCREMENT,
    "email"        TEXT    NOT NULL UNIQUE,
    "passwordHash" TEXT    NOT NULL,
    "name"         TEXT    NOT NULL,
    "createdAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "Article" (
    "id"          INTEGER PRIMARY KEY AUTOINCREMENT,
    "title"       TEXT     NOT NULL,
    "body"        TEXT     NOT NULL,
    "author"      TEXT     NOT NULL,
    "htmlContent" TEXT,
    "imageUrl"    TEXT,
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "Generation" (
    "id"   INTEGER PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "Member" (
    "id"           INTEGER PRIMARY KEY AUTOINCREMENT,
    "name"         TEXT    NOT NULL,
    "bio"          TEXT,
    "imageUrl"     TEXT,
    "generationId" INTEGER NOT NULL,
    FOREIGN KEY ("generationId") REFERENCES "Generation"("id") ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Feedback" (
    "id"        INTEGER  PRIMARY KEY AUTOINCREMENT,
    "name"      TEXT     NOT NULL,
    "message"   TEXT     NOT NULL,
    "ipAddress" TEXT     NOT NULL DEFAULT '',
    "isRead"    INTEGER  NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
];

async function main() {
  console.log("🔄 Pushing schema ke Turso...");
  for (const sql of statements) {
    await client.execute(sql);
    const tableName = sql.match(/CREATE TABLE IF NOT EXISTS "(\w+)"/)?.[1];
    console.log(`✅ Tabel ${tableName} siap`);
  }
  console.log("✅ Semua tabel berhasil dibuat!");
  client.close();
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});