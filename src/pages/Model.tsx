import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { explainPrediction, predictDefectWithModel } from '@/services/aiService';
import { Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import type { AITextResponse } from '@/lib/contracts';
import { useAppStore } from '@/store';

export default function ModelView() {
  const [inputs, setInputs] = useState({
    weight: 25.5,
    length: 50.0,
    thickness: 8.5,
    temperature: 65.0
  });
  
  const [result, setResult] = useState<{prob: number, isDefect: boolean, threshold: number, modelSource: string} | null>(null);
  const [explanation, setExplanation] = useState<AITextResponse | null>(null);
  const [explanationError, setExplanationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const { mlReport } = useAppStore();

  const handlePredict = async () => {
    setLoading(true);
    setExplanation(null);
    setExplanationError(null);
    
    const prediction = await predictDefectWithModel(inputs);
    
    setResult({
      prob: prediction.probability,
      isDefect: prediction.isDefect,
      threshold: prediction.threshold,
      modelSource: prediction.modelSource,
    });
    setLoading(false);

    // Call AI Explanation
    setExplaining(true);
    try {
      const aiExplanation = await explainPrediction(inputs, prediction.probability, prediction.isDefect);
      setExplanation(aiExplanation);
    } catch (error) {
      setExplanationError(error instanceof Error ? error.message : 'Unable to generate explanation.');
    } finally {
      setExplaining(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-3 md:grid md:grid-cols-12 md:grid-rows-6">

      <Card className="col-span-12 md:col-span-6 row-span-6 flex flex-col">
        <CardHeader>
          <CardTitle>Input Parameters</CardTitle>
          <CardDescription>Test the trained Random Forest artifact for product defect prediction.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-1">
          {mlReport && (
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 text-xs text-slate-300">
              <p className="font-semibold text-indigo-300 mb-1">{mlReport.model_name} evaluation report</p>
              <p>Accuracy: {mlReport.accuracy.toFixed(2)}% • Precision: {mlReport.precision.toFixed(2)}% • Recall: {mlReport.recall.toFixed(2)}%</p>
              <p>F1: {mlReport.f1.toFixed(2)}% • ROC AUC: {mlReport.roc_auc.toFixed(2)}% • Train/Test: {mlReport.train_rows}/{mlReport.test_rows}</p>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Weight (kg)</label>
            <input 
              type="number" 
              value={inputs.weight}
              onChange={(e) => setInputs({...inputs, weight: parseFloat(e.target.value)})}
              className="w-full flex h-10 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 text-slate-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Length (cm)</label>
            <input 
              type="number" 
              value={inputs.length}
              onChange={(e) => setInputs({...inputs, length: parseFloat(e.target.value)})}
              className="w-full flex h-10 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 text-slate-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Thickness (mm)</label>
            <input 
              type="number" 
              value={inputs.thickness}
              onChange={(e) => setInputs({...inputs, thickness: parseFloat(e.target.value)})}
              className="w-full flex h-10 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 text-slate-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Temperature (°C)</label>
            <input 
              type="number" 
              value={inputs.temperature}
              onChange={(e) => setInputs({...inputs, temperature: parseFloat(e.target.value)})}
              className="w-full flex h-10 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 text-slate-100"
            />
          </div>
          
          <Button onClick={handlePredict} disabled={loading} className="w-full mt-4">
            {loading ? 'Predicting...' : 'Run Prediction'}
          </Button>
        </CardContent>
      </Card>

      <Card className="col-span-12 md:col-span-6 row-span-6 flex flex-col">
        <CardHeader>
          <CardTitle>Prediction Result</CardTitle>
          <CardDescription>Backend-served model inference output</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          {!result && !loading && (
             <p className="text-slate-500 text-sm">Run a prediction to see the result.</p>
          )}
          {loading && (
             <div className="animate-pulse flex flex-col space-y-4 items-center">
               <div className="size-32 rounded-full bg-slate-800/50"></div>
               <div className="h-6 bg-slate-800 rounded w-24"></div>
             </div>
          )}
          {result && !loading && (
            <div className="space-y-4 flex flex-col items-center w-full">
              <div className={`size-32 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg ${result.isDefect ? 'bg-amber-500 ring-8 ring-amber-500/20' : 'bg-emerald-500 ring-8 ring-emerald-500/20'}`}>
                {result.isDefect ? 'DEFECT' : 'PASS'}
              </div>
              <div className="mt-8">
                <p className="text-sm font-medium text-slate-400">Probability</p>
                <p className="text-4xl font-black tracking-tighter text-slate-100">{(result.prob * 100).toFixed(1)}%</p>
                <p className="mt-2 text-[11px] uppercase tracking-wider text-slate-500">{result.modelSource}</p>
              </div>

              {/* AI Explanation Section */}
              <div className="mt-8 w-full p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="size-4 text-indigo-400" />
                  <h4 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider">AI Analysis</h4>
                </div>
                {explaining ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
                    <Loader2 className="size-4 animate-spin" />
                    Generating insight...
                  </div>
                ) : explanation ? (
                  <div className="space-y-2">
                    <div className="text-[10px] uppercase tracking-wider text-indigo-300">
                      {explanation.source === 'gemini' ? 'Gemini explanation' : 'Fallback explanation'}
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {explanation.text}
                    </p>
                  </div>
                ) : explanationError ? (
                  <div className="flex items-start gap-2 text-sm text-amber-300">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                    <span>{explanationError}</span>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
    </div>
  );
}
