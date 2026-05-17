import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppStore } from '@/store';
import { calculateDefectRateByLine, calculateProductDefectRates } from '@/lib/analytics';

export default function QualityView() {
  const { quality, productMap } = useAppStore();

  const { byLine, byProduct } = useMemo(() => {
    return {
      byLine: calculateDefectRateByLine(quality),
      byProduct: calculateProductDefectRates(quality, productMap).slice(0, 10),
    };
  }, [quality, productMap]);

  return (
    <div className="h-full flex flex-col gap-3 md:grid md:grid-cols-12 md:grid-rows-6">
      
      <Card className="col-span-12 md:col-span-5 row-span-6 flex flex-col">
        <CardHeader>
          <CardTitle>Defect Rate by Production Line (%)</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byLine} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                formatter={(val: number) => [`${val.toFixed(2)}%`, 'Defect Rate']} 
              />
              <Bar dataKey="defectRate" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-12 md:col-span-7 row-span-6 flex flex-col">
        <CardHeader>
          <CardTitle>Top 10 Products with Highest Defect Rates (%)</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-[300px]">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byProduct} layout="vertical" margin={{ left: 20, right: 20 }}>
              <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#cbd5e1' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                formatter={(val: number) => [`${val.toFixed(2)}%`, 'Defect Rate']} 
              />
              <Bar dataKey="defectRate" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
    </div>
  );
}
