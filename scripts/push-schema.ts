// scripts/push-schema.ts
import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config();

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Ini aman dijalankan berkali-kali: kalau tabel BELUM ada, akan dibuat baru
// (lengkap dengan kolom isPinned/pinnedAt/hasHtml). Kalau tabel SUDAH ada,
// statement ini di-skip total oleh SQLite — makanya kolom baru butuh
// penanganan terpisah lewat ALTER TABLE di bawah (lihat ensureArticleColumns).
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
    "title"       TEXT    NOT NULL,
    "body"        TEXT    NOT NULL,
    "author"      TEXT    NOT NULL,
    "htmlContent" TEXT,
    "imageUrl"    TEXT,
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPinned"    INTEGER NOT NULL DEFAULT 0,
    "pinnedAt"    DATETIME,
    "hasHtml"     INTEGER NOT NULL DEFAULT 0
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

// Kolom baru yang perlu nempel ke tabel "Article" yang SUDAH ADA sebelumnya.
// Dicek dulu satu-satu lewat PRAGMA table_info supaya idempotent
// (aman dijalankan berkali-kali, tidak akan error "duplicate column").
const newArticleColumns: { name: string; ddl: string }[] = [
  { name: "isPinned", ddl: `ALTER TABLE "Article" ADD COLUMN "isPinned" INTEGER NOT NULL DEFAULT 0` },
  { name: "pinnedAt", ddl: `ALTER TABLE "Article" ADD COLUMN "pinnedAt" DATETIME` },
  { name: "hasHtml",  ddl: `ALTER TABLE "Article" ADD COLUMN "hasHtml" INTEGER NOT NULL DEFAULT 0` },
];

async function ensureArticleColumns() {
  const info = await client.execute(`PRAGMA table_info("Article")`);
  const existingCols = new Set(info.rows.map((r: any) => String(r.name)));

  for (const col of newArticleColumns) {
    if (existingCols.has(col.name)) {
      console.log(`↷ Kolom "${col.name}" sudah ada, dilewati`);
      continue;
    }
    await client.execute(col.ddl);
    console.log(`✅ Kolom "${col.name}" berhasil ditambahkan ke tabel Article`);
  }

  // Backfill: artikel LAMA yang sudah punya htmlContent tapi baru dapat kolom
  // "hasHtml" hari ini akan default ke 0 (false) — padahal isinya sebenarnya ada.
  // Baris ini memperbaiki data lama supaya badge "Baca →" / "HTML ✓" tetap muncul.
  const result = await client.execute(
    `UPDATE "Article" SET "hasHtml" = 1
     WHERE "htmlContent" IS NOT NULL AND TRIM("htmlContent") <> '' AND "hasHtml" = 0`
  );
  console.log(`🔄 Backfill hasHtml: ${result.rowsAffected} artikel lama diperbarui`);
}

async function main() {
  console.log("🔄 Memastikan tabel dasar ada...");
  for (const sql of statements) {
    await client.execute(sql);
    const tableName = sql.match(/CREATE TABLE IF NOT EXISTS "(\w+)"/)?.[1];
    console.log(`✅ Tabel ${tableName} siap`);
  }

  console.log("🔄 Memastikan kolom baru di tabel Article...");
  await ensureArticleColumns();

  console.log("✅ Semua tabel & kolom berhasil disiapkan!");
  client.close();
}

main().catch((e) => {
  console.error("❌ Detail Error:", e.message || e);
  process.exit(1);
});