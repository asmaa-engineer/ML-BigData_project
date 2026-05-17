export type DataSource = "mock" | "postgres";
export type AISource = "gemini" | "fallback";

export interface ReadinessPayload {
  env: string;
  active: boolean;
  dataSource: DataSource;
  dbConfigured: boolean;
  dbStatus: "connected" | "demo";
  aiConfigured: boolean;
  aiStatus: "ready" | "fallback";
  modelStatus: string;
  lastSync: string;
  records: {
    products: number;
    sales: number;
    quality: number;
  };
}

export interface ActionLogEntry {
  id: string;
  area: "yield" | "quality" | "maintenance" | "system";
  action: string;
  target: string;
  detail: string;
  createdAt: string;
}

export interface AITextResponse {
  text: string;
  source: AISource;
}

export interface MLReportSummary {
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  train_rows: number;
  test_rows: number;
  threshold: number;
}

export interface MLPredictResponse {
  probability: number;
  isDefect: boolean;
  threshold: number;
  modelSource: string;
}
