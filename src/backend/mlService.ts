import fs from "fs/promises";
import path from "path";
import { spawn } from "node:child_process";
import type { MLReportSummary } from "../lib/contracts";

export interface MLPredictionPayload {
  productId?: string;
  lineId?: string;
  weight: number;
  length: number;
  thickness: number;
  temperature: number;
  vibration?: number;
  humidity?: number;
  shift?: number;
}

export interface MLPredictionResult {
  probability: number;
  isDefect: boolean;
  threshold: number;
  modelSource: string;
}

export interface MLStatusReport {
  artifactReady: boolean;
  metricsReady: boolean;
  report: MLReportSummary | null;
}

const projectRoot = process.cwd();
const pythonBin = process.env.PYTHON_BIN || "python3";
const mlRoot = path.join(projectRoot, "ml");
const artifactPath = path.join(mlRoot, "artifacts", "defect_random_forest.joblib");
const reportPath = path.join(mlRoot, "artifacts", "evaluation_report.json");
const predictScriptPath = path.join(mlRoot, "predict_model.py");

export async function getMLStatusReport(): Promise<MLStatusReport> {
  const [artifactReady, metricsReady] = await Promise.all([
    fs.access(artifactPath).then(() => true).catch(() => false),
    fs.access(reportPath).then(() => true).catch(() => false),
  ]);

  if (!metricsReady) {
    return { artifactReady, metricsReady, report: null };
  }

  const raw = await fs.readFile(reportPath, "utf8");
  const json = JSON.parse(raw) as MLReportSummary;
  return {
    artifactReady,
    metricsReady,
    report: json,
  };
}

export async function runMLInference(payload: MLPredictionPayload): Promise<MLPredictionResult> {
  const stdout = await new Promise<string>((resolve, reject) => {
    const child = spawn(pythonBin, [predictScriptPath], {
      cwd: projectRoot,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let out = "";
    let err = "";

    child.stdout.on("data", (chunk) => {
      out += String(chunk);
    });

    child.stderr.on("data", (chunk) => {
      err += String(chunk);
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(out);
        return;
      }
      reject(new Error(err || `Python inference process exited with code ${code}.`));
    });

    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });

  return JSON.parse(stdout) as MLPredictionResult;
}
