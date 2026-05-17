import React, { useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { generateQuadrantInsight } from '@/services/aiService';
import { Loader2, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import { useAppStore } from '@/store';
import { calculateBridgeInsights } from '@/lib/analytics';
import type { AITextResponse } from '@/lib/contracts';

export default function BridgeView() {
  const [insight, setInsight] = useState<AITextResponse | null>(null);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const { sales, quality, productMap } = useAppStore();

  const { data, avgRev, avgDefect, highRisk } = useMemo(() => {
    const bridge = calculateBridgeInsights(sales, quality, productMap);
    return {
      data: bridge.data,
      avgRev: bridge.avgRevenue,
      avgDefect: bridge.avgDefectRate,
      highRisk: bridge.highRiskProducts,
    };
  }, [sales, quality, productMap]);

  useEffect(() => {
    if (highRisk.length > 0) {
      setLoadingInsight(true);
      setInsightError(null);
      generateQuadrantInsight(highRisk)
        .then((res) => {
          setInsight(res);
        })
        .catch((error) => {
          setInsightError(error instanceof Error ? error.message : 'Insight unavailable.');
        })
        .finally(() => {
          setLoadingInsight(false);
        });
    } else {
      setInsight(null);
    }
  }, [highRisk]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg text-sm text-slate-200">
          <p className="font-bold border-b border-slate-800 pb-1 mb-1">{data.name}</p>
          <p className="text-emerald-400">Revenue: ${data.revenue.toLocaleString()}</p>
          <p className="text-rose-400">Defect Rate: {data.defectRate}%</p>
          <p className="text-slate-500 mt-1">Risk Score: {data.riskScore}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col gap-3 md:grid md:grid-cols-12 md:grid-rows-6">

      <Card className="col-span-12 md:col-span-8 row-span-6 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-indigo-400">The Bridge: Sales-Quality Correlation</CardTitle>
          <span className="px-2 py-1 bg-slate-800 rounded text-[9px] uppercase font-bold text-slate-300">Quadrants</span>
        </CardHeader>
        <CardContent className="flex-1 min-h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis 
                type="number" 
                dataKey="revenue" 
                name="Revenue" 
                tickFormatter={v => `$${v/1000}k`}
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis 
                type="number" 
                dataKey="defectRate" 
                name="Defect Rate" 
                tickFormatter={v => `${v}%`}
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#475569' }} />
              <ReferenceLine x={avgRev} stroke="#475569" strokeDasharray="3 3" />
              <ReferenceLine y={avgDefect} stroke="#475569" strokeDasharray="3 3" />
              
              <Scatter name="Products" data={data} fill="#8b5cf6">
                {data.map((entry, index) => {
                  let fill = '#6366f1'; // normal (indigo)
                  if (entry.revenue > avgRev && entry.defectRate > avgDefect) fill = '#f59e0b'; // critical (amber)
                  else if (entry.revenue > avgRev && entry.defectRate <= avgDefect) fill = '#10b981'; // star (emerald)
                  else if (entry.revenue <= avgRev && entry.defectRate > avgDefect) fill = '#64748b'; // low sales high defect (slate)
                  return <Cell key={`cell-${index}`} fill={fill} />;
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <div className="col-span-12 md:col-span-4 row-span-6 flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1">High Risk Alerts</h3>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {data.filter(d => d.revenue > avgRev && d.defectRate > avgDefect).map(p => (
             <div key={p.id} className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col items-start gap-2">
               <div className="flex w-full justify-between items-start">
                 <div>
                   <h4 className="font-bold text-amber-500 tracking-tight">{p.name}</h4>
                   <p className="text-[10px] text-amber-400/80 uppercase tracking-wider mt-1">High Sales & Defect Risk</p>
                 </div>
                 <div className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-1 rounded">
                   Risk: {p.riskScore}
                 </div>
               </div>
             </div>
          ))}
          {data.filter(d => d.revenue > avgRev && d.defectRate <= avgDefect).slice(0, 2).map(p => (
             <div key={p.id} className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col items-start gap-2 shrink-0">
               <div className="flex w-full justify-between items-start">
                 <div>
                   <h4 className="font-bold text-emerald-400 tracking-tight">{p.name}</h4>
                   <p className="text-[10px] text-emerald-300/80 uppercase tracking-wider mt-1">High Sales, Good Quality</p>
                 </div>
               </div>
             </div>
          ))}

          {/* AI Strategic Insight Box */}
          <div className="mt-4 bg-indigo-950/30 border border-indigo-900 rounded-2xl p-4 flex flex-col shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="size-3 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">AI Stragetic Action Plan</h3>
            </div>
            <div className="bg-indigo-950/50 rounded-lg p-3 border border-indigo-800/50">
              {loadingInsight ? (
                <div className="flex items-center justify-center gap-2 text-indigo-300/50 text-xs py-2">
                   <Loader2 className="size-4 animate-spin" />
                   <span>Formulating strategy...</span>
                </div>
              ) : (
                <div className="text-xs leading-relaxed text-indigo-100 opacity-90 markdown-body prose prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0 max-w-none">
                  {insight ? (
                    <>
                      <div className="mb-2 text-[10px] uppercase tracking-wider text-indigo-300">
                        {insight.source === 'gemini' ? 'Gemini strategic plan' : 'Fallback strategic plan'}
                      </div>
                      <Markdown>{insight.text}</Markdown>
                    </>
                  ) : (
                    <span className="text-indigo-300/50">{insightError ?? 'Plan not available.'}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
