'use client';

import { useMemo } from 'react';
import type { Member } from '@/lib/mock';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface RiskDistributionWidgetProps {
  members: Member[];
}

export function RiskDistributionWidget({ members }: RiskDistributionWidgetProps) {
  const data = useMemo(() => {
    const buckets = {
      low: { min: 0, max: 39, count: 0 },
      med: { min: 40, max: 69, count: 0 },
      high: { min: 70, max: 100, count: 0 },
    };

    members.forEach((member) => {
      const risk = member.abrasionRisk ?? member.risk ?? 0;
      if (risk >= 0 && risk <= 39) buckets.low.count++;
      else if (risk >= 40 && risk <= 69) buckets.med.count++;
      else if (risk >= 70 && risk <= 100) buckets.high.count++;
    });

    return [
      { bucket: 'Low (0-39)', count: buckets.low.count, color: '#10B981' },
      { bucket: 'Med (40-69)', count: buckets.med.count, color: '#F59E0B' },
      { bucket: 'High (70-100)', count: buckets.high.count, color: '#EF4444' },
    ];
  }, [members]);

  return (
    <div className="w-full h-48">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bucket" tick={{ fontSize: 10 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

