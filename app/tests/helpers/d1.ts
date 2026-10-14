// Helper: D1Database in-memory di atas better-sqlite3 untuk test API.
import Database from "better-sqlite3";
import { D1Database, D1DatabaseAPI } from "@miniflare/d1";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

export interface TestD1 {
  db: D1Database;
  raw: Database.Database;
}

export async function createTestD1(): Promise<TestD1> {
  const raw = new Database(":memory:");
  raw.pragma("foreign_keys = ON");
  const db = new D1Database(new D1DatabaseAPI(raw));
  const migrationsDir = resolve(__dirname, "../../migrations");
  for (const file of readdirSync(migrationsDir).sort()) {
    if (file.endsWith(".sql")) {
      raw.exec(readFileSync(resolve(migrationsDir, file), "utf8"));
    }
  }
  return { db, raw };
}
