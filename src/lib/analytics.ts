import type { Product, QualityInspection, SaleEvent } from "./mockData";

export interface ModelInputs {
  weight: number;
  length: number;
  thickness: number;
  temperature: number;
}

export interface PredictionResult {
  probability: number;
  isDefect: boolean;
  threshold: number;
}

export interface HomeKpis {
  totalRevenue: number;
  totalDefects: number;
  defectRate: number;
  dailyRevenue: { date: string; revenue: number }[];
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  threshold: number;
  totalPredictions: number;
}

export interface BridgePoint {
  id: string;
  name: string;
  revenue: number;
  defectRate: number;
  riskScore: number;
}

export interface BridgeInsights {
  data: BridgePoint[];
  avgRevenue: number;
  avgDefectRate: number;
  highRiskProducts: string[];
  starProducts: BridgePoint[];
}

export interface YieldRecommendation {
  id: string;
  name: string;
  revenue: number;
  defectRate: number;
  riskScore: number;
  basePrice: number;
  action: "INCREASE_PRICE" | "DISCOUNT_OR_PAUSE" | "PROMO_CAMPAIGN";
  suggestedChange: string;
  reason: string;
  tone: "success" | "warning" | "info";
}

function round(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

export function evaluateDefectRisk(inputs: ModelInputs): PredictionResult {
  let probability = 0.15;

  if (inputs.temperature > 75) probability += 0.4;
  if (inputs.thickness < 5) probability += 0.3;
  if (inputs.weight > 40) probability += 0.2;

  const threshold = 0.35;
  const bounded = Math.max(0, Math.min(1, probability));

  return {
    probability: bounded,
    isDefect: bounded > threshold,
    threshold,
  };
}

export function calculateHomeKpis(sales: SaleEvent[], quality: QualityInspection[]): HomeKpis {
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.revenue, 0);
  const totalDefects = quality.filter((item) => item.isDefect).length;
  const defectRate = quality.length > 0 ? (totalDefects / quality.length) * 100 : 0;

  const dailyRevenueMap = new Map<string, number>();
  for (const sale of sales) {
    const day = sale.date.split("T")[0];
    dailyRevenueMap.set(day, (dailyRevenueMap.get(day) ?? 0) + sale.revenue);
  }

  const dailyRevenue = Array.from(dailyRevenueMap.entries())
    .map(([date, revenue]) => ({
      date,
      revenue: round(revenue, 2),
    }))
    .sort((left, right) => left.date.localeCompare(right.date));

  return {
    totalRevenue: round(totalRevenue, 2),
    totalDefects,
    defectRate,
    dailyRevenue,
  };
}

export function calculateModelMetrics(quality: QualityInspection[]): ModelMetrics {
  let truePositive = 0;
  let trueNegative = 0;
  let falsePositive = 0;
  let falseNegative = 0;

  for (const item of quality) {
    const prediction = evaluateDefectRisk({
      weight: item.weight,
      length: item.length,
      thickness: item.thickness,
      temperature: item.temperature,
    });

    if (prediction.isDefect && item.isDefect) truePositive += 1;
    if (!prediction.isDefect && !item.isDefect) trueNegative += 1;
    if (prediction.isDefect && !item.isDefect) falsePositive += 1;
    if (!prediction.isDefect && item.isDefect) falseNegative += 1;
  }

  const totalPredictions = quality.length;
  const accuracy = totalPredictions > 0 ? ((truePositive + trueNegative) / totalPredictions) * 100 : 0;
  const precisionBase = truePositive + falsePositive;
  const recallBase = truePositive + falseNegative;
  const precision = precisionBase > 0 ? (truePositive / precisionBase) * 100 : 0;
  const recall = recallBase > 0 ? (truePositive / recallBase) * 100 : 0;
  const f1 =
    precision + recall > 0
      ? (2 * (precision / 100) * (recall / 100)) / ((precision / 100) + (recall / 100)) * 100
      : 0;

  return {
    accuracy: round(accuracy, 2),
    precision: round(precision, 2),
    recall: round(recall, 2),
    f1: round(f1, 2),
    threshold: 0.35,
    totalPredictions,
  };
}

export function calculateRevenueByProduct(sales: SaleEvent[], productMap: Record<string, Product>) {
  const totals = new Map<string, number>();

  for (const sale of sales) {
    totals.set(sale.productId, (totals.get(sale.productId) ?? 0) + sale.revenue);
  }

  return Array.from(totals.entries())
    .map(([id, revenue]) => ({
      id,
      name: productMap[id]?.name ?? id,
      revenue: round(revenue, 2),
    }))
    .sort((left, right) => right.revenue - left.revenue);
}

export function calculateRevenueBySegment(sales: SaleEvent[]) {
  const totals = new Map<string, number>();

  for (const sale of sales) {
    totals.set(sale.customerSegment, (totals.get(sale.customerSegment) ?? 0) + sale.revenue);
  }

  return Array.from(totals.entries())
    .map(([name, value]) => ({
      name,
      value: round(value, 2),
    }))
    .sort((left, right) => right.value - left.value);
}

export function calculateDefectRateByLine(quality: QualityInspection[]) {
  const totals = new Map<string, { total: number; defects: number }>();

  for (const item of quality) {
    const current = totals.get(item.lineId) ?? { total: 0, defects: 0 };
    current.total += 1;
    if (item.isDefect) current.defects += 1;
    totals.set(item.lineId, current);
  }

  return Array.from(totals.entries())
    .map(([name, stats]) => ({
      name,
      defectRate: stats.total > 0 ? round((stats.defects / stats.total) * 100, 2) : 0,
      total: stats.total,
      defects: stats.defects,
    }))
    .sort((left, right) => right.defectRate - left.defectRate);
}

export function calculateProductDefectRates(
  quality: QualityInspection[],
  productMap: Record<string, Product>,
  minimumSamples = 10,
) {
  const totals = new Map<string, { total: number; defects: number }>();

  for (const item of quality) {
    const current = totals.get(item.productId) ?? { total: 0, defects: 0 };
    current.total += 1;
    if (item.isDefect) current.defects += 1;
    totals.set(item.productId, current);
  }

  return Array.from(totals.entries())
    .map(([id, stats]) => ({
      id,
      name: productMap[id]?.name ?? id,
      defectRate: stats.total > 0 ? round((stats.defects / stats.total) * 100, 2) : 0,
      total: stats.total,
      defects: stats.defects,
    }))
    .filter((item) => item.total >= minimumSamples)
    .sort((left, right) => right.defectRate - left.defectRate);
}

export function calculateBridgeInsights(
  sales: SaleEvent[],
  quality: QualityInspection[],
  productMap: Record<string, Product>,
): BridgeInsights {
  const revenueByProduct = new Map<string, number>();
  const qualityByProduct = new Map<string, { total: number; defects: number }>();

  for (const sale of sales) {
    revenueByProduct.set(sale.productId, (revenueByProduct.get(sale.productId) ?? 0) + sale.revenue);
  }

  for (const item of quality) {
    const current = qualityByProduct.get(item.productId) ?? { total: 0, defects: 0 };
    current.total += 1;
    if (item.isDefect) current.defects += 1;
    qualityByProduct.set(item.productId, current);
  }

  const data = Object.keys(productMap)
    .map((id) => {
      const revenue = round(revenueByProduct.get(id) ?? 0, 2);
      const stats = qualityByProduct.get(id) ?? { total: 0, defects: 0 };
      const defectRate = stats.total > 0 ? round((stats.defects / stats.total) * 100, 2) : 0;

      return {
        id,
        name: productMap[id]?.name ?? id,
        revenue,
        defectRate,
        riskScore: round((defectRate / 100) * (revenue / 1000) * 10, 2),
      };
    })
    .filter((item) => item.revenue > 0)
    .sort((left, right) => right.revenue - left.revenue);

  const avgRevenue = data.length > 0 ? data.reduce((sum, item) => sum + item.revenue, 0) / data.length : 0;
  const avgDefectRate = data.length > 0 ? data.reduce((sum, item) => sum + item.defectRate, 0) / data.length : 0;

  const highRiskProducts = data
    .filter((item) => item.revenue > avgRevenue && item.defectRate > avgDefectRate)
    .map((item) => item.name);

  const starProducts = data.filter((item) => item.revenue > avgRevenue && item.defectRate <= avgDefectRate);

  return {
    data,
    avgRevenue,
    avgDefectRate,
    highRiskProducts,
    starProducts,
  };
}

export function calculateYieldRecommendations(
  sales: SaleEvent[],
  quality: QualityInspection[],
  productMap: Record<string, Product>,
): YieldRecommendation[] {
  const bridge = calculateBridgeInsights(sales, quality, productMap);

  return (bridge.data
    .map((item) => {
      const basePrice = productMap[item.id]?.basePrice ?? 0;

      if (item.revenue > bridge.avgRevenue && item.defectRate < 20) {
        return {
          ...item,
          basePrice,
          action: "INCREASE_PRICE" as const,
          suggestedChange: "+5%",
          reason: "High demand with strong quality performance supports a controlled price increase.",
          tone: "success" as const,
        };
      }

      if (item.defectRate > 40) {
        return {
          ...item,
          basePrice,
          action: "DISCOUNT_OR_PAUSE" as const,
          suggestedChange: "-15%",
          reason: "Defect rate is critically high. Reduce exposure or pause sell-through until quality stabilizes.",
          tone: "warning" as const,
        };
      }

      if (item.revenue < bridge.avgRevenue * 0.5 && item.defectRate < 30) {
        return {
          ...item,
          basePrice,
          action: "PROMO_CAMPAIGN" as const,
          suggestedChange: "-5% Promo",
          reason: "Quality is acceptable, but commercial traction is weak. Promote to improve movement.",
          tone: "info" as const,
        };
      }

      return null;
    })
    .filter((item) => item !== null) as YieldRecommendation[])
    .slice(0, 5);
}
