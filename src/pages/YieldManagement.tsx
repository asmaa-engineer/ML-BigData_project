import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, TrendingUp, DollarSign, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store';
import { createActionLog } from '@/services/aiService';
import { calculateYieldRecommendations } from '@/lib/analytics';

export default function YieldManagementView() {
  const [actedOn, setActedOn] = useState<Set<string>>(new Set());
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const { sales, quality, productMap } = useAppStore();

  const baseRecommendations = useMemo(() => {
    return calculateYieldRecommendations(sales, quality, productMap).map((item) => ({
      ...item,
      colorStyles:
        item.tone === 'success'
          ? {
              border: 'border-emerald-500/20',
              bgBar: 'bg-emerald-500',
              text: 'text-emerald-200/80',
              highlight: 'text-emerald-400',
            }
          : item.tone === 'warning'
            ? {
                border: 'border-rose-500/20',
                bgBar: 'bg-rose-500',
                text: 'text-rose-200/80',
                highlight: 'text-rose-400',
              }
            : {
                border: 'border-indigo-500/20',
                bgBar: 'bg-indigo-500',
                text: 'text-indigo-200/80',
                highlight: 'text-indigo-400',
              },
    }));
  }, [sales, quality, productMap]);

  const recommendations = baseRecommendations.filter(r => !actedOn.has(r.id));

  const handleAction = async (id: string, productName: string, actionName: string) => {
    setSubmittingId(id);
    try {
      await createActionLog({
        area: 'yield',
        action: actionName,
        target: productName,
        detail: `${actionName} requested from Yield Management for ${productName}.`,
      });
      setActedOn(prev => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      setActionMessage(`${actionName} logged for ${productName}`);
      setTimeout(() => setActionMessage(null), 3000);
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="shrink-0 mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <DollarSign className="size-6 text-emerald-400" />
              Dynamic Pricing & Yield Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">Algorithmic price adjustment recommendations based on combined demand and production quality metrics.</p>
        </div>
        {actionMessage && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="size-4" />
            {actionMessage}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 overflow-y-auto">
        {recommendations.map((rec, i) => (
            <Card key={rec.id} className={`border ${rec.colorStyles.border} bg-slate-900 overflow-hidden relative animate-in fade-in zoom-in-95 duration-300`}>
                <div className={`absolute top-0 left-0 w-1 h-full ${rec.colorStyles.bgBar}`}></div>
                <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-200">{rec.name}</h3>
                            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">{rec.id} • Base: ${rec.basePrice.toFixed(2)}</p>
                            <p className={`text-sm mt-3 ${rec.colorStyles.text}`}>{rec.reason}</p>
                        </div>
                        
                        <div className="flex items-center gap-6 bg-slate-950 p-4 rounded-xl border border-slate-800 shrink-0">
                            <div className="text-center">
                                <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Rev Trajectory</p>
                                <p className="text-sm font-semibold text-slate-300">${(rec.revenue / 1000).toFixed(1)}k</p>
                            </div>
                            <div className={`text-center ${rec.defectRate > 30 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Defect Rate</p>
                                <p className="text-sm font-semibold">{rec.defectRate}%</p>
                            </div>
                            <div className="text-center border-l border-slate-800 pl-6">
                                <p className="text-[10px] uppercase text-indigo-400 font-bold mb-1">Action</p>
                                <p className={`text-xl font-black ${rec.suggestedChange.includes('+') ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {rec.suggestedChange}
                                </p>
                            </div>
                        </div>

                        <div className="shrink-0 flex md:flex-col gap-2">
                           <button
                             onClick={() => void handleAction(rec.id, rec.name, 'Pricing update')}
                             disabled={submittingId === rec.id}
                             className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-bold rounded-lg transition-colors w-full"
                           >
                               {submittingId === rec.id ? 'Logging...' : 'Apply Pricing'}
                           </button>
                           <button
                             onClick={() => void handleAction(rec.id, rec.name, 'Dismissed')}
                             disabled={submittingId === rec.id}
                             className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-slate-300 text-xs font-bold rounded-lg transition-colors w-full"
                           >
                               Ignore
                           </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        ))}
        {recommendations.length === 0 && (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center">
                <CheckCircle2 className="size-12 text-slate-700 mb-3" />
                <p>No active yield management recommendations at this time.</p>
                <p className="text-xs mt-1">All queues have been processed.</p>
            </div>
        )}
      </div>
    </div>
  );
}
