import { calculateBridgeInsights, calculateDefectRateByLine, calculateHomeKpis, calculateRevenueByProduct } from "../lib/analytics";
import type { MLReportSummary, ReadinessPayload } from "../lib/contracts";
import type { Product, QualityInspection, SaleEvent } from "../lib/mockData";

interface AnalyticsPayload {
  sales: SaleEvent[];
  quality: QualityInspection[];
  products: Product[];
  productMap: Record<string, Product>;
  source: "mock" | "postgres";
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 }).format(Math.round(value));
}

function topProductsReply(data: AnalyticsPayload) {
  const top = calculateRevenueByProduct(data.sales, data.productMap).slice(0, 5);
  if (top.length === 0) {
    return "لا توجد بيانات مبيعات كافية حاليًا لاستخراج أفضل المنتجات.";
  }

  return [
    "أفضل 5 منتجات حسب الإيراد:",
    ...top.map((item, index) => `${index + 1}) ${item.name} - إيراد: $${formatMoney(item.revenue)}`),
    "",
    "استخدم هذه النتيجة في المناقشة لتوضيح أن النظام لا يعرض الإيراد فقط، بل يربطه لاحقًا بمخاطر الجودة.",
  ].join("\n");
}

function defectProductsReply(data: AnalyticsPayload) {
  const bridge = calculateBridgeInsights(data.sales, data.quality, data.productMap);
  const risky = bridge.data
    .filter((item) => item.defectRate > 0)
    .sort((left, right) => right.defectRate - left.defectRate)
    .slice(0, 5);

  if (risky.length === 0) {
    return "لا توجد بيانات جودة كافية حاليًا لاستخراج المنتجات الأعلى في العيوب.";
  }

  return [
    "أعلى المنتجات في معدل العيوب:",
    ...risky.map((item, index) => `${index + 1}) ${item.name} - معدل العيوب: ${item.defectRate.toFixed(1)}% - إيراد: $${formatMoney(item.revenue)}`),
    "",
    "النقطة المهمة في العرض: هذه المنتجات ليست فقط سيئة في الجودة، بل قد تكون مؤثرة على الإيراد أيضًا.",
  ].join("\n");
}

function linesReply(data: AnalyticsPayload) {
  const lines = calculateDefectRateByLine(data.quality).slice(0, 3);
  if (lines.length === 0) {
    return "لا توجد بيانات خطوط إنتاج كافية حاليًا.";
  }

  return [
    "ترتيب خطوط الإنتاج حسب معدل العيوب:",
    ...lines.map((line, index) => `${index + 1}) ${line.name} - ${line.defectRate.toFixed(1)}% عيوب من أصل ${line.total} عملية فحص`),
    "",
    "هذه الإجابة مفيدة عندما تريد ربط الجودة بالأداء التشغيلي لكل خط إنتاج.",
  ].join("\n");
}

function summaryReply(data: AnalyticsPayload, readiness: ReadinessPayload, mlReport: MLReportSummary | null) {
  const home = calculateHomeKpis(data.sales, data.quality);

  return [
    "ملخص تنفيذي سريع للمشروع:",
    `- إجمالي الإيراد: $${formatMoney(home.totalRevenue)}`,
    `- معدل العيوب العام: ${home.defectRate.toFixed(1)}%`,
    `- مصدر البيانات الحالي: ${readiness.dataSource}`,
    `- حالة الذكاء الاصطناعي: ${readiness.aiStatus === "ready" ? "Gemini جاهز" : "Fallback mode"}`,
    mlReport ? `- دقة الموديل: ${mlReport.accuracy.toFixed(2)}% | F1: ${mlReport.f1.toFixed(2)}% | ROC AUC: ${mlReport.roc_auc.toFixed(2)}%` : "- تقرير الموديل غير متاح حاليًا",
    "",
    "أفضل استخدام لهذه الإجابة في المناقشة هو كافتتاحية سريعة قبل التنقل بين الصفحات.",
  ].join("\n");
}

function projectOverviewReply(readiness: ReadinessPayload, mlReport: MLReportSummary | null) {
  return [
    "المشروع عبارة عن منصة تحليل ذكية تربط بين بيانات المبيعات وبيانات جودة الإنتاج في Dashboard واحدة.",
    "الفكرة الأساسية هي كشف تأثير مشاكل الجودة على الإيراد مبكرًا، بدل ما يظل التحليل التجاري منفصل عن التحليل التشغيلي.",
    "",
    "لماذا المشروع قوي كمناقشة؟",
    "- لأنه Full-stack وليس Frontend فقط",
    "- فيه Backend + Database + AI integration",
    mlReport ? "- فيه ML pipeline حقيقي: training dataset + model artifact + inference endpoint" : "- فيه ML-ready architecture",
    "- فيه Big Data migration path واضح نحو Kafka وSpark وBigQuery",
    `- النسخة الحالية تعمل كـ prototype مضبوط، ومصدر البيانات الآن: ${readiness.dataSource}`,
  ].join("\n");
}

function mlReply(mlReport: MLReportSummary | null) {
  if (!mlReport) {
    return "الـ ML artifact أو evaluation report غير متاحين الآن، لذلك النظام يعمل على fallback تحليلي.";
  }

  return [
    "وضع الـ ML الحالي في المشروع:",
    `- الموديل المستخدم: ${mlReport.model_name}`,
    `- Train rows: ${mlReport.train_rows}`,
    `- Test rows: ${mlReport.test_rows}`,
    `- Accuracy: ${mlReport.accuracy.toFixed(2)}%`,
    `- Precision: ${mlReport.precision.toFixed(2)}%`,
    `- Recall: ${mlReport.recall.toFixed(2)}%`,
    `- F1: ${mlReport.f1.toFixed(2)}%`,
    `- ROC AUC: ${mlReport.roc_auc.toFixed(2)}%`,
    "",
    "التوصيف الصحيح في المناقشة: هذا Prototype ML حقيقي بموديل متدرب ومربوط بالـ backend، لكنه ما زال يعتمد على dataset synthetic وليس مصنع حقيقي.",
  ].join("\n");
}

function bigDataReply() {
  return [
    "وضع الـ Big Data الحالي:",
    "- المشروع ليس distributed Big Data platform كاملة في الوقت الحالي",
    "- لكنه يحتوي الآن على ETL demo script لتوسيع البيانات إلى 1,000,000 row",
    "- ويحتوي على batch aggregation pipeline لإنتاج جداول تحليلية مجمعة",
    "",
    "المرحلة التالية المقترحة:",
    "- Kafka لاستقبال telemetry وorder events",
    "- Spark Structured Streaming للمعالجة اللحظية",
    "- BigQuery كطبقة warehouse لخدمة الـ dashboard",
    "",
    "الجملة الصحيحة في المناقشة: المشروع يحتوي على Big Data migration path واضح، لكنه ليس distributed cluster production deployment بعد.",
  ].join("\n");
}

function recommendationsReply(data: AnalyticsPayload) {
  const bridge = calculateBridgeInsights(data.sales, data.quality, data.productMap);
  const risky = bridge.highRiskProducts.slice(0, 3);
  const topLine = calculateDefectRateByLine(data.quality)[0];

  return [
    "3 توصيات تشغيلية جاهزة للمناقشة:",
    `1) ركّز فورًا على المنتجات عالية الإيراد وعالية العيوب مثل: ${risky.length > 0 ? risky.join("، ") : "المنتجات الحرجة الحالية"}.`,
    `2) شدّد الفحص على ${topLine ? topLine.name : "الخط الأعلى في العيوب"} لأنه يمثل أعلى عبء جودة في البيانات الحالية.`,
    "3) استخدم Yield Management لتقليل التعرض التجاري: ارفع سعر المنتجات الجيدة عالية الطلب، وخفّض أو جمّد المنتجات عالية المخاطر.",
  ].join("\n");
}

function architectureReply() {
  return [
    "معمارية المشروع باختصار:",
    "- Frontend: React + Vite + Zustand + Recharts",
    "- Backend: Express + TypeScript + Zod + rate limiting",
    "- Data layer: PostgreSQL أو mock data",
    "- AI layer: Gemini مع fallback deterministic",
    "- ML layer: Python training pipeline + exported artifact + backend inference endpoint",
    "",
    "الميزة الأساسية هنا أن الـ UI لا يحتوي على المنطق الحساس وحده، بل يعتمد على backend موحد قابل للتوسعة.",
  ].join("\n");
}

function normalizeMessage(message: string) {
  return message.toLowerCase().trim();
}

export function buildDeterministicCopilotReply(
  userMessage: string,
  data: AnalyticsPayload,
  readiness: ReadinessPayload,
  mlReport: MLReportSummary | null,
) {
  const msg = normalizeMessage(userMessage);

  if (
    msg.includes("لخص المشروع") ||
    msg.includes("عرفني بالمشروع") ||
    msg.includes("project overview") ||
    msg.includes("what is this project")
  ) {
    return projectOverviewReply(readiness, mlReport);
  }

  if (
    msg.includes("ملخص") ||
    msg.includes("summary") ||
    msg.includes("الوضع") ||
    msg.includes("النتائج") ||
    msg.includes("اي النتائج")
  ) {
    return summaryReply(data, readiness, mlReport);
  }

  if (
    msg.includes("اكتر المنتجات") ||
    msg.includes("أكتر المنتجات") ||
    msg.includes("اكثر المنتجات") ||
    msg.includes("أكثر المنتجات") ||
    msg.includes("top products") ||
    msg.includes("most sold")
  ) {
    return topProductsReply(data);
  }

  if (
    msg.includes("اعلى عيوب") ||
    msg.includes("أعلى عيوب") ||
    msg.includes("المنتجات اللي فيها عيوب") ||
    msg.includes("المنتجات فيها عيوب") ||
    msg.includes("سبب العيوب") ||
    msg.includes("high defect")
  ) {
    return defectProductsReply(data);
  }

  if (
    msg.includes("خط") ||
    msg.includes("خطوط") ||
    msg.includes("line")
  ) {
    return linesReply(data);
  }

  if (
    msg.includes("ازاي احسن الايرادات") ||
    msg.includes("ازاي احسن الإيرادات") ||
    msg.includes("احسن الايرادات") ||
    msg.includes("احسن الإيرادات") ||
    msg.includes("recommend") ||
    msg.includes("توصيات")
  ) {
    return recommendationsReply(data);
  }

  if (
    msg.includes("ml") ||
    msg.includes("model") ||
    msg.includes("موديل") ||
    msg.includes("الموديل") ||
    msg.includes("المشروع ml")
  ) {
    return mlReply(mlReport);
  }

  if (
    msg.includes("big data") ||
    msg.includes("بيج داتا") ||
    msg.includes("المشروع big data")
  ) {
    return bigDataReply();
  }

  if (
    msg.includes("architecture") ||
    msg.includes("معمارية") ||
    msg.includes("arch") ||
    msg.includes("stack")
  ) {
    return architectureReply();
  }

  if (
    msg.includes("اهلا") ||
    msg.includes("أهلا") ||
    msg.includes("مرحبا") ||
    msg.includes("هاي") ||
    msg.includes("hello")
  ) {
    return [
      "أهلًا بك. أقدر أساعدك في المناقشة أو في تحليل البيانات مباشرة.",
      "اسألني مثلًا:",
      "- لخص المشروع",
      "- أكثر المنتجات مبيعًا",
      "- أعلى المنتجات في العيوب",
      "- وضع الـ ML",
      "- وضع الـ Big Data",
      "- 3 توصيات تشغيلية",
    ].join("\n");
  }

  return null;
}
