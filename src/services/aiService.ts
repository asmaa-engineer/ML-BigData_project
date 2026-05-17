import type { AITextResponse, ActionLogEntry, MLPredictResponse, MLReportSummary } from "@/lib/contracts";

interface ModelInputs {
  weight: number;
  length: number;
  thickness: number;
  temperature: number;
}

async function postJSON<TReq, TRes>(endpoint: string, body: TReq): Promise<TRes> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const fallback = 'Unable to process AI request right now.';
    try {
      const data = await res.json();
      throw new Error(data?.error ?? fallback);
    } catch {
      throw new Error(fallback);
    }
  }

  return res.json() as Promise<TRes>;
}

export async function explainPrediction(inputs: ModelInputs, prob: number, isDefect: boolean) {
  const data = await postJSON<
    { inputs: ModelInputs; prob: number; isDefect: boolean },
    AITextResponse
  >('/api/ai/explain', { inputs, prob, isDefect });
  return data;
}

export async function generateQuadrantInsight(highRiskProducts: string[]) {
  const data = await postJSON<{ highRiskProducts: string[] }, AITextResponse>(
    '/api/ai/quadrant-insight',
    { highRiskProducts },
  );
  return data;
}

export async function generateExecutiveSummary(totalRev: number, defectRate: number, modelAccuracy: number) {
  const data = await postJSON<
    { totalRev: number; defectRate: number; modelAccuracy: number },
    AITextResponse
  >('/api/ai/executive-summary', { totalRev, defectRate, modelAccuracy });
  return data;
}

export async function copilotChat(userMessage: string, context: { salesCount: number; qualityCount: number }) {
  const data = await postJSON<
    { userMessage: string; salesCount: number; qualityCount: number },
    AITextResponse
  >('/api/ai/copilot-chat', {
    userMessage,
    salesCount: context.salesCount,
    qualityCount: context.qualityCount,
  });
  return data;
}

export async function createActionLog(entry: {
  area: ActionLogEntry["area"];
  action: string;
  target: string;
  detail: string;
}) {
  const data = await postJSON<typeof entry, { item: ActionLogEntry }>("/api/actions/log", entry);
  return data.item;
}

export async function fetchActionLogs() {
  const res = await fetch("/api/actions/log");

  if (!res.ok) {
    throw new Error("Unable to load action logs.");
  }

  const data = (await res.json()) as { items: ActionLogEntry[] };
  return data.items;
}

export async function predictDefectWithModel(payload: {
  weight: number;
  length: number;
  thickness: number;
  temperature: number;
}) {
  return postJSON<typeof payload, MLPredictResponse>("/api/ml/predict", payload);
}

export async function fetchMLStatus() {
  const res = await fetch("/api/ml/status");

  if (!res.ok) {
    throw new Error("Unable to load ML status.");
  }

  return (await res.json()) as {
    artifactReady: boolean;
    metricsReady: boolean;
    report: MLReportSummary | null;
  };
}
