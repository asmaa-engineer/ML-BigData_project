import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store';

const PRODUCTION_LINES = ['Line Alpha', 'Line Beta', 'Line Gamma'];

export default function LiveOperationsView() {
  const [streamData, setStreamData] = useState<{time: string, temp: number, vibration: number}[]>([]);
  const [latestEvent, setLatestEvent] = useState<any>(null);
  const { products } = useAppStore();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      const newPoint = {
        time: timeStr,
        temp: 65 + Math.random() * 20, // 65-85
        vibration: 2 + Math.random() * 4, // 2-6
      };

      setStreamData(prev => {
        const next = [...prev, newPoint];
        if (next.length > 20) return next.slice(1);
        return next;
      });

      // Simulate a random quality inspection live
      if (Math.random() > 0.6 && products.length > 0) {
        const product = products[Math.floor(Math.random() * products.length)];
        const lineId = PRODUCTION_LINES[Math.floor(Math.random() * PRODUCTION_LINES.length)];
        
        let isDefect = false;
        if (newPoint.temp > 80 || newPoint.vibration > 5.5) isDefect = true;

        setLatestEvent({
          id: `Q-LIVE-${Math.floor(Math.random() * 10000)}`,
          time: timeStr,
          product: product.name,
          lineId,
          temp: newPoint.temp.toFixed(1),
          vibration: newPoint.vibration.toFixed(2),
          isDefect
        });
      }

    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-3 md:grid md:grid-cols-12 md:grid-rows-6">
      
      <Card className="col-span-12 md:col-span-8 row-span-6 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>IoT Sensor Stream: Line Alpha</CardTitle>
            <CardDescription>Real-time temperature and vibration telemetry</CardDescription>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Connection
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={streamData} margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[50, 100]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 10]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}
                cursor={{ stroke: '#475569' }}
              />
              <Line yAxisId="left" type="monotone" dataKey="temp" name="Temp (°C)" stroke="#f43f5e" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="vibration" name="Vibration (mm/s)" stroke="#6366f1" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-12 md:col-span-4 row-span-3 flex flex-col bg-slate-900 border-slate-800">
         <CardHeader>
           <CardTitle>Latest Inference Event</CardTitle>
           <CardDescription>ML anomaly detection on live stream</CardDescription>
         </CardHeader>
         <CardContent className="flex flex-col items-center justify-center flex-1">
           {latestEvent ? (
             <div className="w-full space-y-4">
               <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                 <span className="text-xs font-semibold text-slate-400">Status</span>
                 {latestEvent.isDefect ? (
                   <div className="flex items-center gap-1 text-rose-500 font-bold bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">
                     <AlertTriangle className="size-4" /> DEFECT DETECTED
                   </div>
                 ) : (
                   <div className="flex items-center gap-1 text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                     <CheckCircle2 className="size-4" /> PASS
                   </div>
                 )}
               </div>
               <div className="grid grid-cols-2 gap-4 text-sm">
                 <div>
                   <p className="text-slate-500 text-xs">Product</p>
                   <p className="font-semibold text-slate-200">{latestEvent.product}</p>
                 </div>
                 <div>
                   <p className="text-slate-500 text-xs">Line</p>
                   <p className="font-semibold text-slate-200">{latestEvent.lineId}</p>
                 </div>
                 <div>
                   <p className="text-slate-500 text-xs">Temp</p>
                   <p className={`font-semibold ${parseFloat(latestEvent.temp) > 80 ? 'text-rose-400' : 'text-slate-200'}`}>
                     {latestEvent.temp}°C
                   </p>
                 </div>
                 <div>
                   <p className="text-slate-500 text-xs">Vibration</p>
                   <p className={`font-semibold ${parseFloat(latestEvent.vibration) > 5.5 ? 'text-rose-400' : 'text-slate-200'}`}>
                     {latestEvent.vibration}
                   </p>
                 </div>
               </div>
               <div className="text-right pt-2 border-t border-slate-800">
                 <span className="text-[10px] text-slate-500 font-mono">ID: {latestEvent.id} @ {latestEvent.time}</span>
               </div>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center text-slate-600 gap-2">
               <Activity className="size-8 animate-pulse" />
               <p className="text-xs">Waiting for events...</p>
             </div>
           )}
         </CardContent>
      </Card>

      <div className="col-span-12 md:col-span-4 row-span-3 bg-indigo-950/30 border border-indigo-900 rounded-2xl p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">Automated Actions</h3>
        </div>
        <div className="space-y-2 overflow-y-auto">
           {latestEvent?.isDefect && (
             <div className="bg-rose-500/10 border border-rose-500/30 p-2 rounded text-xs animate-in fade-in slide-in-from-right-4 duration-300">
               <span className="text-rose-400 font-bold">ACT:</span> Page Floor Manager (Shift 2) - Anomaly on {latestEvent.lineId}.
             </div>
           )}
           {latestEvent?.isDefect && parseFloat(latestEvent.temp) > 82 && (
             <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded text-xs animate-in fade-in slide-in-from-right-4 duration-300 delay-150">
               <span className="text-amber-400 font-bold">ERP:</span> Sending pause signal to PLC controller {latestEvent.lineId} due to thermal limits.
             </div>
           )}
           <div className="bg-indigo-900/50 border border-indigo-800 p-2 rounded text-xs text-indigo-200">
             <span className="font-bold">SYSTEM:</span> Checkpoint saved. Auto-retraining scheduler standing by.
           </div>
        </div>
      </div>

    </div>
  );
}
