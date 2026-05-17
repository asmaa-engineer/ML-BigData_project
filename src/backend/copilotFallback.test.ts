import test from "node:test";
import assert from "node:assert/strict";

import { buildDeterministicCopilotReply } from "./copilotFallback";
import type { ReadinessPayload } from "../lib/contracts";
import type { Product, QualityInspection, SaleEvent } from "../lib/mockData";

const products: Product[] = [
  { id: "PRD-001", name: "Product 1", category: "Industrial", basePrice: 120 },
  { id: "PRD-002", name: "Product 2", category: "Industrial", basePrice: 80 },
];

const productMap = Object.fromEntries(products.map((item) => [item.id, item]));

const sales: SaleEvent[] = [
  {
    id: "S-1",
    date: "2025-01-01T10:00:00.000Z",
    productId: "PRD-001",
    quantity: 4,
    revenue: 800,
    customerSegment: "Retail",
    hour: 10,
    dayOfWeek: "Wed",
  },
  {
    id: "S-2",
    date: "2025-01-02T10:00:00.000Z",
    productId: "PRD-002",
    quantity: 2,
    revenue: 150,
    customerSegment: "Wholesale",
    hour: 10,
    dayOfWeek: "Thu",
  },
];

const quality: QualityInspection[] = Array.from({ length: 25 }, (_, index) => ({
  id: `Q-${index}`,
  date: "2025-01-01T10:00:00.000Z",
  productId: index < 20 ? "PRD-001" : "PRD-002",
  lineId: index < 20 ? "Line Gamma" : "Line Alpha",
  weight: 42,
  length: 50,
  thickness: index < 15 ? 4 : 8,
  temperature: index < 15 ? 82 : 65,
  isDefect: index < 14,
}));

const readiness: ReadinessPayload = {
  env: "development",
  active: true,
  dataSource: "mock",
  dbConfigured: false,
  dbStatus: "demo",
  aiConfigured: false,
  aiStatus: "fallback",
  modelStatus: "RandomForest ready",
  lastSync: "2026-05-16T18:00:00.000Z",
  records: {
    products: 2,
    sales: 2,
    quality: 25,
  },
};

test("returns project overview for discussion prompts", () => {
  const reply = buildDeterministicCopilotReply(
    "لخص المشروع",
    { sales, quality, products, productMap, source: "mock" },
    readiness,
    {
      model_name: "RandomForestClassifier",
      accuracy: 78.08,
      precision: 49.39,
      recall: 59.72,
      f1: 54.07,
      roc_auc: 78.05,
      train_rows: 20000,
      test_rows: 5000,
      threshold: 0.5,
    },
  );

  assert.ok(reply?.includes("Full-stack"));
  assert.ok(reply?.includes("ML pipeline"));
});

test("returns defect-focused answer for quality prompts", () => {
  const reply = buildDeterministicCopilotReply(
    "سبب العيوب",
    { sales, quality, products, productMap, source: "mock" },
    readiness,
    null,
  );

  assert.ok(reply?.includes("أعلى المنتجات"));
  assert.ok(reply?.includes("Product 1"));
});
