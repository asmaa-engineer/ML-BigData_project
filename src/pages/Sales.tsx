import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAppStore } from '@/store';
import { calculateRevenueByProduct, calculateRevenueBySegment } from '@/lib/analytics';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'];

export default function SalesView() {
  const { sales, productMap } = useAppStore();

  const { byProduct, bySegment } = useMemo(() => {
    return {
      byProduct: calculateRevenueByProduct(sales, productMap).slice(0, 10),
      bySegment: calculateRevenueBySegment(sales),
    };
  }, [sales, productMap]);

  return (
    <div className="h-full flex flex-col gap-3 md:grid md:grid-cols-12 md:grid-rows-6">
      
      <Card className="col-span-12 md:col-span-8 row-span-6 flex flex-col">
        <CardHeader>
          <CardTitle>Top 10 Products by Revenue</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byProduct} layout="vertical" margin={{ left: 20, right: 30 }}>
              <XAxis 
                type="number" 
                tickFormatter={v => `$${v/1000}k`} 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100} 
                tick={{ fontSize: 12, fill: '#cbd5e1' }} 
                axisLine={false} 
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                formatter={(val: number) => [`$${val.toLocaleString()}`, 'Revenue']} 
              />
              <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-12 md:col-span-4 row-span-6 flex flex-col">
        <CardHeader>
          <CardTitle>Revenue by Segment</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bySegment}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {bySegment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(val: number) => [`$${val.toLocaleString()}`, 'Revenue']} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-6 w-full">
            {bySegment.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="size-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-xs font-semibold text-slate-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
