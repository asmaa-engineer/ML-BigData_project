import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { createActionLog } from '@/services/aiService';
import { CheckCircle2 } from 'lucide-react';

export default function PredictiveMaintenanceView() {
  const [message, setMessage] = useState<string | null>(null);
  const degradationData = useMemo(() => {
    const data = [];
    let health = 100;
    const now = new Date();
    
    // Simulate historical data (last 14 days)
    for (let i = 14; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      data.push({
        day: `Day -${i}`,
        date: d.toLocaleDateString(),
        health: health,
        isForecast: false,
      });
      health -= (Math.random() * 2 + 0.5);
    }

    // Simulate forecast data (next 14 days)
    for (let i = 1; i <= 14; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        
        // Accelerated degradation in forecast
        health -= (Math.random() * 3 + 1.5);
        
        data.push({
          day: `Day +${i}`,
          date: d.toLocaleDateString(),
          health: Math.max(0, Math.floor(health)),
          isForecast: true,
        });
    }
    return data;
  }, []);

  const currentHealth = degradationData.find(d => d.day === 'Day -0')?.health || 0;
  const daysUntilCritical = degradationData.filter(d => d.isForecast && d.health > 30).length;

  const handleLogAction = async (action: string, detail: string) => {
    await createActionLog({
      area: 'maintenance',
      action,
      target: 'Line Gamma',
      detail,
    });
    setMessage(`${action} logged for Line Gamma`);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="h-full flex flex-col gap-3 md:grid md:grid-cols-12 md:grid-rows-6">
      <Card className="col-span-12 md:col-span-8 row-span-6 flex flex-col">
        <CardHeader>
          <CardTitle>Machine Health Degradation Forecast</CardTitle>
          <CardDescription>Predicts when "Line Gamma" equipment requires maintenance before critical failure (&lt; 30%).</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={degradationData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.4}/>
                </linearGradient>
                <linearGradient id="colorHealthForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} minTickGap={20} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}
              />
              <ReferenceLine y={30} stroke="#f43f5e" strokeDasharray="3 3" label={{ position: 'top', value: 'Critical Threshold', fill: '#f43f5e', fontSize: 10 }} />
              <ReferenceLine x="Day -0" stroke="#cbd5e1" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: '#cbd5e1', fontSize: 10 }} />
              
              <Area 
                type="monotone" 
                dataKey="health" 
                stroke="#10b981" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorHealth)" 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-12 md:col-span-4 row-span-3 flex flex-col">
        <CardHeader>
          <CardTitle>Current Status: Line Gamma</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center flex-1 space-y-4 text-center">
            <div className={`size-32 rounded-full border-8 flex flex-col items-center justify-center ${currentHealth > 70 ? 'border-emerald-500/20' : currentHealth > 30 ? 'border-amber-500/20' : 'border-rose-500/20'}`}>
                <span className={`text-4xl font-black ${currentHealth > 70 ? 'text-emerald-400' : currentHealth > 30 ? 'text-amber-400' : 'text-rose-400'}`}>
                   {Math.floor(currentHealth)}%
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Health</span>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700 w-full p-4 rounded-xl">
               <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Estimated Time to Critical</p>
               <p className="text-2xl font-bold text-slate-100">{daysUntilCritical} Days</p>
            </div>
        </CardContent>
      </Card>

      <div className="col-span-12 md:col-span-4 row-span-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex flex-col">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2">Maintenance Recommendation</h3>
        <p className="text-sm text-amber-200/80 leading-relaxed">
           Line Gamma's primary servo motor is exhibiting accelerated high-frequency vibration patterns. 
           Failure predicted within {daysUntilCritical + 2} days. 
        </p>
        {message && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 border border-emerald-500/20">
            <CheckCircle2 className="size-3" />
            {message}
          </div>
        )}
        <div className="mt-auto space-y-2">
            <button
              onClick={() => void handleLogAction('Schedule preventive maintenance', 'Preventive maintenance requested from predictive maintenance panel.')}
              className="w-full bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs py-2 rounded-lg transition-colors"
            >
                Schedule Preventative Maintenance
            </button>
            <button
              onClick={() => void handleLogAction('Order spare parts', 'Servo spare kit order initiated from predictive maintenance panel.')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2 rounded-lg transition-colors border border-slate-700"
            >
                Order Spare Parts (Servo Kit)
            </button>
        </div>
      </div>
    </div>
  );
}
