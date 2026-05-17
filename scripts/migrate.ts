import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { closePool, hasDatabaseConfig, query } from "../src/backend/db";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function run() {
  if (!hasDatabaseConfig) {
    throw new Error("DATABASE_URL or SUPABASE_DB_URL is required to run migrations.");
  }

  const migrationsDir = path.join(process.cwd(), "db", "migrations");
  const files = (await fs.readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");
    console.log(`Applying migration: ${file}`);
    await query(sql);
  }
}

run()
  .then(async () => {
    await closePool();
    console.log("Migrations completed.");
  })
  .catch(async (error) => {
    await closePool();
    console.error("Migration failed:", error);
    process.exit(1);
  });
