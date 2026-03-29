"use client";

import { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface ChartProps {
  data: { day: string, count: number }[];
}

export function BusinessFlowChart({ data }: { data: { day: string, count: number }[] }) {

  // Format data for recharts if needed, but the incoming prop is already nice
  const chartData = useMemo(() => {
    return data.map(item => ({
      name: item.day,
      scans: item.count
    }));
  }, [data]);

  return (
    <div className="h-64 w-full overflow-hidden rounded-b-3xl">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 20,
            right: 0,
            left: -20, // Negative left margin to reduce gap
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#27272a" strokeDasharray="3 3" opacity={0.4} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 11 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 11 }} 
            tickCount={5}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#18181b', 
              borderColor: '#27272a', 
              borderRadius: '8px', 
              color: '#fff',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' 
            }}
            itemStyle={{ color: '#818cf8', fontWeight: 600 }}
            cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
            formatter={(value: any) => [`${value} Scans`, 'Activity']}
            labelStyle={{ color: '#a1a1aa', marginBottom: '0.25rem' }}
          />
          <Area 
            type="linear"
            dataKey="scans"
            stroke="#6366f1"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorScans)" 
            animationDuration={1500}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#818cf8' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
