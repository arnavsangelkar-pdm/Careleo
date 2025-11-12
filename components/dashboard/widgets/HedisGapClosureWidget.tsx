'use client';

import { useMemo } from 'react';
import type { Member } from '@/lib/mock';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface HedisGapClosureWidgetProps {
  members: Member[];
  hedisCode?: string;
}

export function HedisGapClosureWidget({ members, hedisCode }: HedisGapClosureWidgetProps) {
  const data = useMemo(() => {
    const measureCounts: Record<string, { open: number; closed: number }> = {};

    members.forEach((member) => {
      if (member.measures) {
        member.measures.forEach((measure) => {
          if (!hedisCode || measure.code === hedisCode) {
            if (!measureCounts[measure.code]) {
              measureCounts[measure.code] = { open: 0, closed: 0 };
            }
            if (measure.gap === 'closed') {
              measureCounts[measure.code].closed++;
            } else {
              measureCounts[measure.code].open++;
            }
          }
        });
      }
    });

    return Object.entries(measureCounts).map(([code, counts]) => ({
      code,
      open: counts.open,
      closed: counts.closed,
      total: counts.open + counts.closed,
      closureRate: counts.open + counts.closed > 0
        ? Math.round((counts.closed / (counts.open + counts.closed)) * 100)
        : 0,
    }));
  }, [members, hedisCode]);

  if (data.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        No HEDIS gap data available
      </div>
    );
  }

  return (
    <div className="w-full h-48">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="code" tick={{ fontSize: 10 }} />
          <YAxis />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'closureRate') {
                return [`${value}%`, 'Closure Rate'];
              }
              return [value, name === 'open' ? 'Open Gaps' : 'Closed Gaps'];
            }}
          />
          <Bar dataKey="open" stackId="a" fill="#EF4444" />
          <Bar dataKey="closed" stackId="a" fill="#10B981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

