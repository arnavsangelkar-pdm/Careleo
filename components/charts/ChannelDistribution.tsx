'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid } from 'recharts'

interface ChannelDistributionProps {
  data: Array<{ name: string; value: number }>
}

/**
 * Shared channel distribution chart component
 * Used across Analytics and Care Coordination views for visual/logic parity
 */
export function ChannelDistribution({ data }: ChannelDistributionProps) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <RTooltip 
            formatter={(value: number) => {
              const total = data.reduce((sum, item) => sum + item.value, 0)
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
              return [`${value} (${percentage}%)`, 'Count']
            }}
          />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

