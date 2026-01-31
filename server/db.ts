
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
console.log("Importing schema in db.ts...");
import * as schema from "@shared/schema";
console.log("Schema imported successfully.");

const { Pool } = pg;

console.log("Initializing database initialization logic...");
const connectionString = process.env.DATABASE_URL;

export let pool: pg.Pool | null = null;
export let db: any = null;

try {
  // DISABLED: Database pool initialization is causing crashes on Windows when port 6543/5432 is blocked.
  // We are forcing in-memory mode for now to ensure stability.
  console.log("Database pool initialization SKIPPED for resilience. Running in in-memory mode.");
  pool = null;
  db = null;
} catch (error) {
  console.error("Unexpected error during db initialization logic:", error);
  pool = null;
  db = null;
}
