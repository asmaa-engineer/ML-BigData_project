import dotenv from "dotenv";
import { closePool, hasDatabaseConfig, query } from "../src/backend/db";
import { MOCK_QUALITY, MOCK_SALES, PRODUCTS } from "../src/lib/mockData";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function run() {
  if (!hasDatabaseConfig) {
    throw new Error("DATABASE_URL or SUPABASE_DB_URL is required to seed data.");
  }

  await query("BEGIN");
  try {
    await query("TRUNCATE TABLE quality_inspections, sales, products RESTART IDENTITY CASCADE");

    for (const p of PRODUCTS) {
      await query(
        `INSERT INTO products (id, name, category, base_price)
         VALUES ($1, $2, $3, $4)`,
        [p.id, p.name, p.category, p.basePrice],
      );
    }

    for (const s of MOCK_SALES) {
      await query(
        `INSERT INTO sales (id, sale_ts, product_id, quantity, revenue, customer_segment, sale_hour, day_of_week)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [s.id, s.date, s.productId, s.quantity, s.revenue, s.customerSegment, s.hour, s.dayOfWeek],
      );
    }

    for (const q of MOCK_QUALITY) {
      await query(
        `INSERT INTO quality_inspections (id, inspection_ts, product_id, line_id, weight, length, thickness, temperature, is_defect)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [q.id, q.date, q.productId, q.lineId, q.weight, q.length, q.thickness, q.temperature, q.isDefect],
      );
    }

    await query("COMMIT");
    console.log(`Seed completed: ${PRODUCTS.length} products, ${MOCK_SALES.length} sales, ${MOCK_QUALITY.length} quality rows.`);
  } catch (error) {
    await query("ROLLBACK");
    throw error;
  }
}

run()
  .then(async () => {
    await closePool();
  })
  .catch(async (error) => {
    await closePool();
    console.error("Seed failed:", error);
    process.exit(1);
  });
