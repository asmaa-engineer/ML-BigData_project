CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  base_price NUMERIC(12,2) NOT NULL CHECK (base_price >= 0)
);

CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  sale_ts TIMESTAMPTZ NOT NULL,
  product_id TEXT NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  revenue NUMERIC(14,2) NOT NULL CHECK (revenue >= 0),
  customer_segment TEXT NOT NULL,
  sale_hour SMALLINT NOT NULL CHECK (sale_hour >= 0 AND sale_hour <= 23),
  day_of_week TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS sales_product_id_idx ON sales(product_id);
CREATE INDEX IF NOT EXISTS sales_sale_ts_idx ON sales(sale_ts);

CREATE TABLE IF NOT EXISTS quality_inspections (
  id TEXT PRIMARY KEY,
  inspection_ts TIMESTAMPTZ NOT NULL,
  product_id TEXT NOT NULL REFERENCES products(id),
  line_id TEXT NOT NULL,
  weight NUMERIC(12,4) NOT NULL,
  length NUMERIC(12,4) NOT NULL,
  thickness NUMERIC(12,4) NOT NULL,
  temperature NUMERIC(12,4) NOT NULL,
  is_defect BOOLEAN NOT NULL
);

CREATE INDEX IF NOT EXISTS quality_product_id_idx ON quality_inspections(product_id);
CREATE INDEX IF NOT EXISTS quality_inspection_ts_idx ON quality_inspections(inspection_ts);
