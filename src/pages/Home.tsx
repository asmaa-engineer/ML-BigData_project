import React, { useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/store';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { generateExecutiveSummary } from '@/services/aiService';
import { Activity, Database, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import { calculateDefectRateByLine, calculateHomeKpis } from '@/lib/analytics';
import type { AITextResponse, MLReportSummary } from '@/lib/contracts';

export default function HomeView() {
  const [aiSummary, setAiSummary] = useState<AITextResponse | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const { mlReport, readiness, sales, quality } = useAppStore();

  const stats = useMemo(() => {
    const home = calculateHomeKpis(sales, quality);
    const byLine = calculateDefectRateByLine(quality);
    return { ...home, byLine };
  }, [sales, quality]);

  const modelMetrics: MLReportSummary = mlReport ?? {
    model_name: 'Model report unavailable',
    accuracy: 0,
    precision: 0,
    recall: 0,
    f1: 0,
    roc_auc: 0,
    train_rows: 0,
    test_rows: 0,
    threshold: 0.5,
  };

  const loadSummary = async () => {
    setLoadingSummary(true);
    setSummaryError(null);
    try {
      const summary = await generateExecutiveSummary(stats.totalRevenue, stats.defectRate, modelMetrics.accuracy);
      setAiSummary(summary);
    } catch (error) {
      setSummaryError(error instanceof Error ? error.message : 'Summary unavailable.');
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    void loadSummary();
  }, [stats.totalRevenue, stats.defectRate, modelMetrics.accuracy]);

  return (
    <div className="h-full flex flex-col gap-3 md:grid md:grid-cols-12 md:grid-rows-6">
      
      {/* Top row cards */}
      <Card className="col-span-12 md:col-span-3 row-span-2 flex flex-col justify-between">
        <CardHeader className="pb-0">
          <CardTitle>Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-3xl md:text-4xl font-bold italic tracking-tighter text-slate-100">
            ${Math.floor(stats.totalRevenue).toLocaleString()}<span className="text-sm font-normal text-slate-500 ml-1 italic">.{(stats.totalRevenue % 1).toFixed(2).substring(2)}</span>
          </h2>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-2 font-semibold uppercase tracking-wider">
            <span>{sales.length.toLocaleString()} sales events loaded</span>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-12 md:col-span-3 row-span-2 flex flex-col justify-between">
        <CardHeader className="pb-0">
          <CardTitle>General Defect Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-amber-500">
            {stats.defectRate.toFixed(2)}%
          </h2>
          <div className="flex items-center gap-1 text-[10px] text-rose-400 mt-2 font-semibold uppercase tracking-wider">
            <span>{stats.totalDefects} defects across {quality.length} inspections</span>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-12 md:col-span-3 row-span-2 flex flex-col justify-between">
        <CardHeader className="pb-0">
          <CardTitle>ML Prediction Accuracy</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-slate-100">{modelMetrics.accuracy.toFixed(2)}%</h2>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-2 font-mono">
            <span>F1: {modelMetrics.f1.toFixed(2)}% | Precision: {modelMetrics.precision.toFixed(2)}% | Recall: {modelMetrics.recall.toFixed(2)}%</span>
          </div>
        </CardContent>
      </Card>

      <div className="col-span-12 md:col-span-3 row-span-2 bg-indigo-600 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-indigo-500/10 text-white border border-indigo-500">
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-200">System Health</p>
        <h2 className="text-2xl md:text-3xl font-bold leading-tight mt-2 text-white pb-2 border-b border-indigo-500/30">Production Optimized</h2>
        <p className="text-[10px] text-indigo-200 uppercase tracking-widest mt-3 font-semibold">Lines Alpha, Beta Active</p>
      </div>

      {/* Main Bridge Section */}
      <Card className="col-span-12 md:col-span-8 row-span-4 flex flex-col">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-400">Daily Revenue Forecast</h3>
            <p className="text-[10px] text-slate-500 mb-2">Trend analysis based on live loaded records</p>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.dailyRevenue} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748b' }}
                dy={10}
                minTickGap={20}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#818cf8' }}
                formatter={(val: number) => [`$${val.toFixed(2)}`, 'Revenue']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Side Content */}
      <Card className="col-span-12 md:col-span-4 row-span-2 flex flex-col">
        <CardHeader>
          <CardTitle>Quality by Line</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center space-y-5">
          {stats.byLine.map((line) => {
            const colorClass = line.defectRate > 30 ? 'text-rose-400' : line.defectRate > 18 ? 'text-amber-400' : 'text-emerald-400';
            const barClass = line.defectRate > 30 ? 'bg-rose-500' : line.defectRate > 18 ? 'bg-amber-500' : 'bg-emerald-500';

            return (
              <div key={line.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{line.name}</span>
                  <span className={colorClass}>{line.defectRate.toFixed(1)}% Defect</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className={`${barClass} h-full`} style={{ width: `${Math.min(line.defectRate, 100)}%` }}></div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="col-span-12 md:col-span-4 row-span-2 flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle>Project Readiness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
            <span className="text-slate-400">Data source</span>
            <span className="font-semibold uppercase text-slate-200">{readiness?.dataSource ?? 'unknown'}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
            <span className="text-slate-400">Database</span>
            <span className={`font-semibold ${readiness?.dbStatus === 'connected' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {readiness?.dbStatus === 'connected' ? 'Connected' : 'Demo mode'}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
            <span className="text-slate-400">AI status</span>
            <span className={`font-semibold ${readiness?.aiStatus === 'ready' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {readiness?.aiStatus === 'ready' ? 'Gemini ready' : 'Fallback active'}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
            <span className="text-slate-400">Model</span>
            <span className="font-semibold text-slate-200">{modelMetrics.train_rows + modelMetrics.test_rows} rows</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
            <span className="text-slate-400">Last sync</span>
            <span className="font-semibold text-slate-200">{readiness ? new Date(readiness.lastSync).toLocaleTimeString() : 'n/a'}</span>
          </div>
        </CardContent>
      </Card>

      <div className="col-span-12 md:col-span-4 row-span-2 bg-indigo-950/30 border border-indigo-900 rounded-2xl p-4 flex flex-col relative group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-3 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">AI Exec Summary</h3>
          </div>
          <button 
            onClick={loadSummary} 
            disabled={loadingSummary} 
            className="text-indigo-500 hover:text-indigo-300 transition-colors disabled:opacity-50"
            title="Regenerate Exec Summary"
          >
            <RefreshCw className={`size-3 ${loadingSummary ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="bg-indigo-950/50 rounded-lg p-3 border border-indigo-800/50 flex-grow overflow-hidden flex flex-col justify-center">
          {loadingSummary ? (
            <div className="flex items-center justify-center gap-2 text-indigo-300/50 text-xs">
               <Loader2 className="size-4 animate-spin" />
               <span>Synthesizing data...</span>
            </div>
          ) : (
            <div className="text-xs leading-relaxed text-indigo-100 opacity-90 markdown-body prose prose-invert prose-p:my-1 prose-h3:text-xs prose-h3:uppercase prose-h3:text-indigo-200 prose-strong:text-emerald-400 max-w-none">
              {aiSummary ? (
                <>
                  <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-indigo-300">
                    {aiSummary.source === 'gemini' ? <Sparkles className="size-3" /> : <Activity className="size-3" />}
                    <span>{aiSummary.source === 'gemini' ? 'Gemini summary' : 'Fallback summary'}</span>
                  </div>
                  <Markdown>{aiSummary.text}</Markdown>
                </>
              ) : (
                <span className="text-indigo-300/50">{summaryError ?? 'Summary not available.'}</span>
              )}
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
