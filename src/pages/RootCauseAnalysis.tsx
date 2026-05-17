import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Network, Search, AlertCircle, ArrowRight } from 'lucide-react';
import { createActionLog } from '@/services/aiService';

export default function RootCauseAnalysisView() {
  const [selectedNode, setSelectedNode] = useState<number | null>(1);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const treeNodes = [
    { id: 1, label: 'High Defect Rate', value: '42% of Batch', type: 'root', color: 'rose' },
    { id: 2, label: 'Line Alpha', value: '78% Contribution', type: 'branch', color: 'amber', parentId: 1 },
    { id: 3, label: 'Line Beta', value: '22% Contribution', type: 'branch', color: 'slate', parentId: 1 },
    { id: 4, label: 'Temp > 85°C', value: 'Correlation: 0.89', type: 'leaf', color: 'rose', parentId: 2 },
    { id: 5, label: 'Vibration > 5mm/s', value: 'Correlation: 0.45', type: 'leaf', color: 'amber', parentId: 2 },
    { id: 6, label: 'Raw Material (S2)', value: 'Correlation: 0.12', type: 'leaf', color: 'slate', parentId: 3 },
  ];

  const renderInsights = () => {
    switch(selectedNode) {
      case 1:
        return "System has detected a macro-level anomaly in the latest production batch. Expand nodes to identify causal factors.";
      case 2:
        return "Line Alpha is disproportionately responsible for the recent defect spike. Isolating variables on this specific line.";
      case 4:
        return "CRITICAL CAUSE REVEALED: Thermal sensors indicate cooling system failure. When Temp exceeds 85°C, structural integrity fails 89% of the time.";
      case 5:
        return "SECONDARY CAUSE: Mild correlation found with increased servo vibration. Likely a side effect of thermal expansion.";
      default:
        return "Select a node to view causal inference details.";
    }
  }

  const handleOverride = async () => {
    await createActionLog({
      area: 'quality',
      action: 'Execute PLC override',
      target: 'Line Alpha',
      detail: 'PLC override requested after root cause analysis identified thermal failure.',
    });
    setActionMessage('PLC override logged for Line Alpha');
    setTimeout(() => setActionMessage(null), 3000);
  };

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="shrink-0 mb-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Network className="size-6 text-indigo-400" />
            Causal Inference & Root Cause
        </h2>
        <p className="text-xs text-slate-400 mt-1">Multi-variate ML analysis isolating the exact parameters causing production defects.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
        <Card className="flex-1 overflow-y-auto bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Decision Tree Analysis</CardTitle>
            <CardDescription>Random Forest variable importance mapped as a causal tree</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-10">
            <div className="flex flex-col items-center gap-6 w-full max-w-md">
              {/* Root */}
              <button 
                onClick={() => setSelectedNode(1)}
                className={`p-4 rounded-xl border-2 w-full transition-all ${selectedNode === 1 ? 'border-rose-500 bg-rose-500/20' : 'border-rose-500/50 bg-rose-500/10 hover:border-rose-500/80'}`}
              >
                <p className="font-bold text-rose-100">{treeNodes[0].label}</p>
                <p className="text-xs text-rose-300 mt-1">{treeNodes[0].value}</p>
              </button>
              
              <div className="h-8 w-px bg-slate-700"></div>

              {/* Branch Level */}
              <div className="flex gap-4 w-full">
                <div className="flex flex-col items-center flex-1 gap-6">
                  <button 
                    onClick={() => setSelectedNode(2)}
                    className={`p-4 rounded-xl border-2 w-full transition-all ${selectedNode === 2 ? 'border-amber-500 bg-amber-500/20' : 'border-amber-500/50 bg-amber-500/10 hover:border-amber-500/80'}`}
                  >
                    <p className="font-bold text-amber-100">{treeNodes[1].label}</p>
                    <p className="text-xs text-amber-300 mt-1">{treeNodes[1].value}</p>
                  </button>
                  
                  <div className="h-8 w-px bg-slate-700"></div>
                  
                  {/* Leaves for Alpha */}
                  <div className="flex gap-2 w-full">
                     <button 
                       onClick={() => setSelectedNode(4)}
                       className={`p-3 rounded-lg border-2 flex-1 transition-all ${selectedNode === 4 ? 'border-rose-500 bg-rose-500/20' : 'border-rose-500/50 bg-rose-500/10 hover:border-rose-500/80'}`}
                     >
                       <p className="font-semibold text-rose-100 text-sm whitespace-nowrap overflow-hidden text-ellipsis">{treeNodes[3].label}</p>
                       <p className="text-[10px] text-rose-300 mt-1">{treeNodes[3].value}</p>
                     </button>
                     <button 
                       onClick={() => setSelectedNode(5)}
                       className={`p-3 rounded-lg border-2 flex-1 transition-all ${selectedNode === 5 ? 'border-amber-500 bg-amber-500/20' : 'border-amber-500/50 bg-amber-500/10 hover:border-amber-500/80'}`}
                     >
                       <p className="font-semibold text-amber-100 text-sm whitespace-nowrap overflow-hidden text-ellipsis">{treeNodes[4].label}</p>
                       <p className="text-[10px] text-amber-300 mt-1">{treeNodes[4].value}</p>
                     </button>
                  </div>
                </div>

                <div className="flex flex-col items-center flex-1 gap-6">
                  <button 
                    onClick={() => setSelectedNode(3)}
                    className={`p-4 rounded-xl border-2 w-full transition-all ${selectedNode === 3 ? 'border-slate-500 bg-slate-800' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}
                  >
                    <p className="font-bold text-slate-100">{treeNodes[2].label}</p>
                    <p className="text-xs text-slate-400 mt-1">{treeNodes[2].value}</p>
                  </button>

                  <div className="h-8 w-px bg-slate-700"></div>

                  {/* Leaves for Beta */}
                  <button 
                    onClick={() => setSelectedNode(6)}
                    className={`p-3 rounded-lg border-2 w-full max-w-[50%] transition-all ${selectedNode === 6 ? 'border-slate-500 bg-slate-800' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}
                  >
                    <p className="font-semibold text-slate-100 text-sm whitespace-nowrap overflow-hidden text-ellipsis">{treeNodes[5].label}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{treeNodes[5].value}</p>
                  </button>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        <div className="md:w-80 flex flex-col gap-4">
          <Card className="bg-indigo-950/30 border-indigo-900/50 flex-1">
            <CardHeader>
              <CardTitle className="text-indigo-200 flex items-center gap-2">
                <Search className="size-4" /> Insight Engine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-indigo-950/50 rounded-xl border border-indigo-800/30 leading-relaxed text-sm text-indigo-100 animate-in fade-in zoom-in-95 duration-300" key={selectedNode}>
                {renderInsights()}
              </div>

              {selectedNode === 4 && (
                <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <AlertCircle className="size-3" /> Recommended Action
                  </h4>
                  <p className="text-xs text-rose-200/80 mb-3">
                    Throttle Line Alpha production speed by 15% immediately to reduce thermal load until technicians can service the cooling loop.
                  </p>
                  {actionMessage && <p className="mb-3 text-[11px] text-emerald-300">{actionMessage}</p>}
                  <button onClick={() => void handleOverride()} className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors flex justify-center items-center gap-2">
                    Execute PLC Override <ArrowRight className="size-3" />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
