import test from "node:test";
import assert from "node:assert/strict";

import type { Product, QualityInspection, SaleEvent } from "./mockData";
import {
  calculateBridgeInsights,
  calculateHomeKpis,
  calculateModelMetrics,
  evaluateDefectRisk,
} from "./analytics";

const products: Product[] = [
  { id: "PRD-001", name: "Product 1", category: "Industrial", basePrice: 100 },
  { id: "PRD-002", name: "Product 2", category: "Industrial", basePrice: 150 },
  { id: "PRD-003", name: "Product 3", category: "Industrial", basePrice: 80 },
];

const productMap = Object.fromEntries(products.map((product) => [product.id, product]));

const sales: SaleEvent[] = [
  {
    id: "S-1",
    date: "2025-01-01T10:00:00.000Z",
    productId: "PRD-001",
    quantity: 2,
    revenue: 400,
    customerSegment: "Retail",
    hour: 10,
    dayOfWeek: "Wed",
  },
  {
    id: "S-2",
    date: "2025-01-01T12:00:00.000Z",
    productId: "PRD-002",
    quantity: 2,
    revenue: 350,
    customerSegment: "Wholesale",
    hour: 12,
    dayOfWeek: "Wed",
  },
  {
    id: "S-3",
    date: "2025-01-02T09:00:00.000Z",
    productId: "PRD-001",
    quantity: 1,
    revenue: 100,
    customerSegment: "Retail",
    hour: 9,
    dayOfWeek: "Thu",
  },
  {
    id: "S-4",
    date: "2025-01-02T10:00:00.000Z",
    productId: "PRD-003",
    quantity: 1,
    revenue: 50,
    customerSegment: "Direct",
    hour: 10,
    dayOfWeek: "Thu",
  },
];

const quality: QualityInspection[] = [
  {
    id: "Q-1",
    date: "2025-01-01T09:00:00.000Z",
    productId: "PRD-001",
    lineId: "Line Alpha",
    weight: 45,
    length: 50,
    thickness: 4,
    temperature: 80,
    isDefect: true,
  },
  {
    id: "Q-2",
    date: "2025-01-01T11:00:00.000Z",
    productId: "PRD-001",
    lineId: "Line Alpha",
    weight: 25,
    length: 50,
    thickness: 9,
    temperature: 60,
    isDefect: false,
  },
  {
    id: "Q-3",
    date: "2025-01-01T13:00:00.000Z",
    productId: "PRD-002",
    lineId: "Line Beta",
    weight: 28,
    length: 48,
    thickness: 9,
    temperature: 72,
    isDefect: false,
  },
  {
    id: "Q-4",
    date: "2025-01-02T13:00:00.000Z",
    productId: "PRD-003",
    lineId: "Line Gamma",
    weight: 26,
    length: 47,
    thickness: 8,
    temperature: 70,
    isDefect: false,
  },
];

test("evaluateDefectRisk returns deterministic probability and decision", () => {
  const result = evaluateDefectRisk({
    weight: 45,
    length: 50,
    thickness: 4,
    temperature: 80,
  });

  assert.equal(result.probability, 1);
  assert.equal(result.isDefect, true);
  assert.equal(result.threshold, 0.35);
});

test("calculateHomeKpis aggregates revenue, defects, and daily trend", () => {
  const stats = calculateHomeKpis(sales, quality);

  assert.equal(stats.totalRevenue, 900);
  assert.equal(stats.totalDefects, 1);
  assert.equal(stats.defectRate, 25);
  assert.deepEqual(stats.dailyRevenue, [
    { date: "2025-01-01", revenue: 750 },
    { date: "2025-01-02", revenue: 150 },
  ]);
});

test("calculateModelMetrics derives accuracy, precision, recall, and f1 from quality data", () => {
  const metrics = calculateModelMetrics(quality);

  assert.equal(metrics.totalPredictions, 4);
  assert.equal(metrics.accuracy, 100);
  assert.equal(metrics.precision, 100);
  assert.equal(metrics.recall, 100);
  assert.equal(metrics.f1, 100);
});

test("calculateBridgeInsights identifies high-risk products from revenue and defect rate", () => {
  const bridge = calculateBridgeInsights(sales, quality, productMap);

  assert.equal(bridge.data.length, 3);
  assert.deepEqual(bridge.highRiskProducts, ["Product 1"]);
  assert.equal(bridge.starProducts[0]?.name, "Product 2");
});
