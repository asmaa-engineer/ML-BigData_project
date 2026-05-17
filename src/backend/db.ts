import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL;

export const hasDatabaseConfig = Boolean(connectionString);

export const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
      max: Number(process.env.DB_POOL_MAX ?? 20),
      idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS ?? 30000),
      connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS ?? 5000),
    })
  : null;

export async function query<T>(text: string, values: unknown[] = []) {
  if (!pool) {
    throw new Error("Database is not configured. Set DATABASE_URL or SUPABASE_DB_URL.");
  }
  return pool.query<T>(text, values);
}

export async function closePool() {
  if (pool) {
    await pool.end();
  }
}
