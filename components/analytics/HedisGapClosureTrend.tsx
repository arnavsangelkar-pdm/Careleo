'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

export function HedisGapClosureTrend({ data }: { data: { name: string; opened: number; closed: number; closureRate: number }[] }) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const closureRate = payload.find((p: any) => p.dataKey === 'closureRate')?.value || 0
      const opened = payload.find((p: any) => p.dataKey === 'opened')?.value || 0
      const closed = payload.find((p: any) => p.dataKey === 'closed')?.value || 0
      const total = opened + closed
      
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2">{label}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Closure Rate:</span>
              <span className="font-semibold text-blue-600">{closureRate}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Gaps Opened:</span>
              <span className="font-semibold text-red-600">{opened.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Gaps Closed:</span>
              <span className="font-semibold text-green-600">{closed.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t border-gray-200">
              <span className="text-gray-600">Total Activity:</span>
              <span className="font-semibold">{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end" 
            height={80}
            tick={{ fontSize: 11 }}
          />
          <YAxis 
            yAxisId="left" 
            domain={[0, 100]} 
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11 }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            tickFormatter={(v) => v.toString()}
            tick={{ fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="closureRate" 
            stroke="#3B82F6" 
            strokeWidth={2}
            name="Closure Rate (%)"
            dot={{ r: 4 }}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="opened" 
            stroke="#EF4444" 
            strokeWidth={1.5}
            strokeDasharray="5 5"
            name="Gaps Opened"
            dot={{ r: 3 }}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="closed" 
            stroke="#10B981" 
            strokeWidth={1.5}
            strokeDasharray="5 5"
            name="Gaps Closed"
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

