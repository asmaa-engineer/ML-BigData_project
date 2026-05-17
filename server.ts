import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import express, { type NextFunction, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import { GoogleGenAI } from "@google/genai";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { z } from "zod";
import { appendActionLog, listActionLogs } from "./src/backend/actionLog.ts";
import { buildDeterministicCopilotReply } from "./src/backend/copilotFallback.ts";
import {
  fetchProducts,
  fetchQualityInspections,
  fetchSales,
} from "./src/backend/analyticsRepository.ts";
import { copilotSchema, executiveSchema, explainSchema, quadrantSchema } from "./src/backend/aiSchemas.ts";
import { mlPredictSchema } from "./src/backend/mlSchemas.ts";
import { getMLStatusReport, runMLInference } from "./src/backend/mlService.ts";
import { hasDatabaseConfig } from "./src/backend/db.ts";
import type { AITextResponse, MLPredictResponse, ReadinessPayload } from "./src/lib/contracts.ts";
import { getProductMap, MOCK_QUALITY, MOCK_SALES, PRODUCTS } from "./src/lib/mockData.ts";

dotenv.config({ path: ".env.local" });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT ?? 3000);
const NODE_ENV = process.env.NODE_ENV ?? "development";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const actionLogSchema = z.object({
  area: z.enum(["yield", "quality", "maintenance", "system"]),
  action: z.string().min(1).max(120),
  target: z.string().min(1).max(160),
  detail: z.string().min(1).max(500),
});

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function withAsync(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}

async function generateText(prompt: string) {
  if (!ai) {
    throw new HttpError(503, "AI service is not configured. Set GEMINI_API_KEY.");
  }
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  return response.text ?? "No response generated.";
}

function isGeminiPermissionDenied(error: unknown) {
  const maybeGeminiError = error as { status?: number; message?: string };
  return (
    maybeGeminiError?.status === 403 ||
    maybeGeminiError?.status === 429 ||
    maybeGeminiError?.message?.includes("PERMISSION_DENIED") ||
    maybeGeminiError?.message?.includes("RESOURCE_EXHAUSTED") ||
    maybeGeminiError?.message?.includes("429")
  );
}

function fallbackExplain(inputs: { weight: number; length: number; thickness: number; temperature: number }, prob: number) {
  const factors: string[] = [];
  if (inputs.temperature > 75) factors.push("درجة الحرارة أعلى من الحد الآمن");
  if (inputs.thickness < 5) factors.push("السُمك أقل من النطاق المستهدف");
  if (inputs.weight > 40) factors.push("الوزن أعلى من المتوقع");
  if (factors.length === 0) factors.push("كل المتغيرات ضمن الحدود الطبيعية");
  return `ثقة التنبؤ ${(prob * 100).toFixed(1)}%. أهم العوامل المؤثرة: ${factors.join(
    "، ",
  )}. الإجراء المقترح: مراجعة معايرة خط الإنتاج وإعادة فحص حدود الجودة قبل الإطلاق.`;
}

function fallbackQuadrantInsight(products: string[]) {
  const scoped = products.slice(0, 5).join(", ");
  return `1) ابدأ بتدقيق تشغيلي فوري للمنتجات: ${scoped}. 2) زوّد أخذ العينات لكل وردية وشدّد حدود رفض العيوب لهذه المنتجات. 3) احمِ الإيراد بعزل الدُفعات عالية العيوب وتوجيه الدُفعات المطابقة فقط لقنوات الطلب العالي.`;
}

function fallbackExecutiveSummary(totalRev: number, defectRate: number, modelAccuracy: number) {
  return `التحليل: الإيراد الحالي $${totalRev.toFixed(
    0,
  )} ومعدل العيوب ${defectRate.toFixed(1)}% ودقة النموذج ${modelAccuracy.toFixed(
    1,
  )}%. الإجراء: ركّز فورًا على خطوط المنتجات الأعلى عيوبًا وفعّل نقاط فحص جودة أكثر صرامة داخل خط الإنتاج.`;
}

async function getAnalyticsPayload() {
  if (!hasDatabaseConfig) {
    return {
      sales: MOCK_SALES,
      quality: MOCK_QUALITY,
      products: PRODUCTS,
      productMap: getProductMap(),
      source: "mock" as const,
    };
  }

  const [products, sales, quality] = await Promise.all([
    fetchProducts(),
    fetchSales(),
    fetchQualityInspections(),
  ]);
  const productMap = products.reduce<Record<string, (typeof products)[number]>>((acc, product) => {
    acc[product.id] = product;
    return acc;
  }, {});

  return {
    products,
    sales,
    quality,
    productMap,
    source: "postgres" as const,
  };
}

async function buildReadinessPayload(): Promise<ReadinessPayload> {
  const data = await getAnalyticsPayload();
  const mlStatus = await getMLStatusReport();
  const report = mlStatus.report;

  return {
    env: NODE_ENV,
    active: true,
    dataSource: data.source,
    dbConfigured: hasDatabaseConfig,
    dbStatus: hasDatabaseConfig ? "connected" : "demo",
    aiConfigured: Boolean(GEMINI_API_KEY),
    aiStatus: ai ? "ready" : "fallback",
    modelStatus: report
      ? `${report.model_name} ready • F1 ${report.f1.toFixed(2)}% • AUC ${report.roc_auc.toFixed(2)}%`
      : "Heuristic threshold model active (artifact missing)",
    lastSync: new Date().toISOString(),
    records: {
      products: data.products.length,
      sales: data.sales.length,
      quality: data.quality.length,
    },
  };
}

async function startServer() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy:
        NODE_ENV === "production"
          ? undefined
          : false,
    }),
  );
  app.use(cors({ origin: true, credentials: false }));
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: NODE_ENV === "production" ? 300 : 1200,
    standardHeaders: true,
    legacyHeaders: false,
  });
  const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: NODE_ENV === "production" ? 60 : 300,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api", apiLimiter);

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      env: NODE_ENV,
      active: true,
      dbConfigured: hasDatabaseConfig,
      aiConfigured: Boolean(GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  app.get(
    "/api/readiness",
    withAsync(async (_req, res) => {
      const readiness = await buildReadinessPayload();
      res.json(readiness);
    }),
  );

  app.get(
    "/api/ml/status",
    withAsync(async (_req, res) => {
      const status = await getMLStatusReport();
      res.json(status);
    }),
  );

  app.get(
    "/api/data",
    withAsync(async (_req, res) => {
      const data = await getAnalyticsPayload();
      res.json(data);
    }),
  );

  app.get("/api/actions/log", (_req, res) => {
    res.json({ items: listActionLogs() });
  });

  app.post(
    "/api/actions/log",
    withAsync(async (req, res) => {
      const payload = actionLogSchema.parse(req.body);
      const item = appendActionLog(payload);
      res.status(201).json({ item });
    }),
  );

  app.post(
    "/api/ml/predict",
    withAsync(async (req, res) => {
      const payload = mlPredictSchema.parse(req.body);
      try {
        const prediction = await runMLInference(payload);
        const response: MLPredictResponse = {
          probability: prediction.probability,
          isDefect: prediction.isDefect,
          threshold: prediction.threshold,
          modelSource: prediction.modelSource,
        };
        res.json(response);
      } catch (error) {
        const fallbackProbability =
          (payload.temperature > 75 ? 0.55 : 0.15) +
          (payload.thickness < 5 ? 0.22 : 0) +
          (payload.weight > 40 ? 0.15 : 0);
        const bounded = Math.max(0, Math.min(1, fallbackProbability));
        const response: MLPredictResponse = {
          probability: bounded,
          isDefect: bounded >= 0.35,
          threshold: 0.35,
          modelSource: "heuristic_fallback",
        };
        res.json(response);
      }
    }),
  );

  app.post("/api/action", (req, res) => {
    const { action, id } = req.body;
    const item = appendActionLog({
      area: "system",
      action: String(action ?? "UNKNOWN_ACTION"),
      target: String(id ?? "unknown-target"),
      detail: `Action ${String(action ?? "UNKNOWN_ACTION")} processed on ${String(id ?? "unknown-target")}.`,
    });
    res.json({ success: true, item, message: `Action ${action} processed on ${id}` });
  });

  app.post(
    "/api/ai/explain",
    aiLimiter,
    withAsync(async (req, res) => {
      const { inputs, prob, isDefect } = explainSchema.parse(req.body);
      const prompt = `
System Role: You are an expert AI manufacturing consultant.
Task: Explain a Random Forest model's prediction for product defect.
Model Inputs:
- Weight: ${inputs.weight} kg
- Length: ${inputs.length} cm
- Thickness: ${inputs.thickness} mm
- Temperature: ${inputs.temperature} °C
- Defect Probability: ${(prob * 100).toFixed(1)}%
- Threshold: 35.0%
- Final Determination: ${isDefect ? "DEFECT" : "PASS"}

Provide a concise 2-3 sentence explanation and identify the strongest contributing factor.
      `;
      if (!ai) {
        const fallback: AITextResponse = { text: fallbackExplain(inputs, prob), source: "fallback" };
        res.json(fallback);
        return;
      }
      try {
        const text = await generateText(prompt);
        res.json({ text, source: "gemini" satisfies AITextResponse["source"] });
      } catch (error) {
        if (isGeminiPermissionDenied(error)) {
          res.json({ text: fallbackExplain(inputs, prob), source: "fallback" satisfies AITextResponse["source"] });
          return;
        }
        throw error;
      }
    }),
  );

  app.post(
    "/api/ai/quadrant-insight",
    aiLimiter,
    withAsync(async (req, res) => {
      const { highRiskProducts } = quadrantSchema.parse(req.body);
      const prompt = `
System Role: You are an expert Quality Assurance and Business Analytics Director.
Task: We have analyzed our product matrix (Sales vs. Defect Rate).
The following products fall into the "High Risk" quadrant (High Sales, High Defect Rate):
${highRiskProducts.join(", ")}

Provide a concise 3-point action plan (around 50 words total) to protect revenue and improve quality.
      `;
      if (!ai) {
        res.json({ text: fallbackQuadrantInsight(highRiskProducts), source: "fallback" satisfies AITextResponse["source"] });
        return;
      }
      try {
        const text = await generateText(prompt);
        res.json({ text, source: "gemini" satisfies AITextResponse["source"] });
      } catch (error) {
        if (isGeminiPermissionDenied(error)) {
          res.json({ text: fallbackQuadrantInsight(highRiskProducts), source: "fallback" satisfies AITextResponse["source"] });
          return;
        }
        throw error;
      }
    }),
  );

  app.post(
    "/api/ai/executive-summary",
    aiLimiter,
    withAsync(async (req, res) => {
      const { totalRev, defectRate, modelAccuracy } = executiveSchema.parse(req.body);
      const prompt = `
System Role: You are a concise AI assistant in a manufacturing dashboard.
Task: Provide a 2-sentence executive summary based on the following KPIs. Use bold text for key actions.
- Total Revenue: $${totalRev.toFixed(0)}
- Defect Rate: ${defectRate.toFixed(1)}%
- Defect Prediction Model Accuracy: ${modelAccuracy.toFixed(1)}%

Format:
ANALYSIS: [One sentence about KPI state]
ACTION: [One short prescriptive sentence]
      `;
      if (!ai) {
        res.json({ text: fallbackExecutiveSummary(totalRev, defectRate, modelAccuracy), source: "fallback" satisfies AITextResponse["source"] });
        return;
      }
      try {
        const text = await generateText(prompt);
        res.json({ text, source: "gemini" satisfies AITextResponse["source"] });
      } catch (error) {
        if (isGeminiPermissionDenied(error)) {
          res.json({ text: fallbackExecutiveSummary(totalRev, defectRate, modelAccuracy), source: "fallback" satisfies AITextResponse["source"] });
          return;
        }
        throw error;
      }
    }),
  );

  app.post(
    "/api/ai/copilot-chat",
    aiLimiter,
    withAsync(async (req, res) => {
      const { userMessage, salesCount, qualityCount } = copilotSchema.parse(req.body);
      const data = await getAnalyticsPayload();
      const readiness = await buildReadinessPayload();
      const mlStatus = await getMLStatusReport();
      const deterministicReply = buildDeterministicCopilotReply(userMessage, data, readiness, mlStatus.report);

      if (deterministicReply) {
        res.json({ text: deterministicReply, source: "fallback" satisfies AITextResponse["source"] });
        return;
      }

      const prompt = `
System Context: You are an AI Copilot for a Smart Commerce & Production Analytics System.
You analyze sales and production quality defects.
Current dataset size: ${salesCount} sales records and ${qualityCount} quality inspection records.
Always answer in Arabic.
Provide practical business insights and operational recommendations.

User: ${userMessage}
      `;
      if (!ai) {
        res.json({
          text: "أقدر أساعدك في المبيعات والجودة والمناقشة. جرّب مثلًا: لخص المشروع، وضع الـ ML، وضع الـ Big Data، أعلى المنتجات في العيوب، أو 3 توصيات تشغيلية.",
          source: "fallback" satisfies AITextResponse["source"],
        });
        return;
      }
      try {
        const text = await generateText(prompt);
        res.json({ text, source: "gemini" satisfies AITextResponse["source"] });
      } catch (error) {
        if (isGeminiPermissionDenied(error)) {
          res.json({
            text: "الخدمة الذكية غير متاحة الآن، لكن أقدر أجاوبك بأسئلة المناقشة الجاهزة. جرّب: لخص المشروع، وضع الـ ML، وضع الـ Big Data، أو أعلى المنتجات في العيوب.",
            source: "fallback" satisfies AITextResponse["source"],
          });
          return;
        }
        throw error;
      }
    }),
  );

  if (NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request payload.", details: err.flatten() });
    }
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: err.message });
    }

    const maybeGeminiError = err as { status?: number; message?: string };
    if (maybeGeminiError?.status === 429 || maybeGeminiError?.message?.includes("RESOURCE_EXHAUSTED")) {
      return res.status(429).json({ error: "API Quota Exceeded. Please try again later." });
    }
    if (maybeGeminiError?.status === 403 || maybeGeminiError?.message?.includes("PERMISSION_DENIED")) {
      return res.status(403).json({
        error:
          "Gemini API access denied for this project/key. Verify API enablement, billing, and project permissions.",
      });
    }

    console.error("[SERVER_ERROR]", err);
    return res.status(500).json({ error: "Internal server error." });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (${NODE_ENV})`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
