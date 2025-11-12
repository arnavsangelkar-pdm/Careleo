'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import type { TouchesOverTimeData } from '@/lib/analytics';

interface OutreachTrend14dWidgetProps {
  data: TouchesOverTimeData[];
}

export function OutreachTrend14dWidget({ data }: OutreachTrend14dWidgetProps) {
  // Transform data to show daily trend (use weekLabel as day label)
  const chartData = data.map((item, index) => ({
    day: `Day ${index + 1}`,
    touches: item.all,
    hra: item.hra,
  }));

  return (
    <div className="w-full h-48">
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" tick={{ fontSize: 10 }} />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="touches"
            stroke="#3B82F6"
            strokeWidth={2}
            name="All Touches"
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="hra"
            stroke="#EF4444"
            strokeWidth={2}
            name="HRA Touches"
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

