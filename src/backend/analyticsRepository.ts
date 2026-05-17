import { query } from "./db";

export interface ProductRow {
  id: string;
  name: string;
  category: string;
  base_price: string;
}

export interface SaleRow {
  id: string;
  sale_ts: string;
  product_id: string;
  quantity: number;
  revenue: string;
  customer_segment: string;
  sale_hour: number;
  day_of_week: string;
}

export interface QualityRow {
  id: string;
  inspection_ts: string;
  product_id: string;
  line_id: string;
  weight: string;
  length: string;
  thickness: string;
  temperature: string;
  is_defect: boolean;
}

export async function fetchProducts() {
  const result = await query<ProductRow>(
    `SELECT id, name, category, base_price
     FROM products
     ORDER BY id`,
  );
  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    basePrice: Number(row.base_price),
  }));
}

export async function fetchSales() {
  const result = await query<SaleRow>(
    `SELECT id, sale_ts, product_id, quantity, revenue, customer_segment, sale_hour, day_of_week
     FROM sales
     ORDER BY sale_ts`,
  );
  return result.rows.map((row) => ({
    id: row.id,
    date: row.sale_ts,
    productId: row.product_id,
    quantity: row.quantity,
    revenue: Number(row.revenue),
    customerSegment: row.customer_segment,
    hour: row.sale_hour,
    dayOfWeek: row.day_of_week,
  }));
}

export async function fetchQualityInspections() {
  const result = await query<QualityRow>(
    `SELECT id, inspection_ts, product_id, line_id, weight, length, thickness, temperature, is_defect
     FROM quality_inspections
     ORDER BY inspection_ts`,
  );
  return result.rows.map((row) => ({
    id: row.id,
    date: row.inspection_ts,
    productId: row.product_id,
    lineId: row.line_id,
    weight: Number(row.weight),
    length: Number(row.length),
    thickness: Number(row.thickness),
    temperature: Number(row.temperature),
    isDefect: row.is_defect,
  }));
}
