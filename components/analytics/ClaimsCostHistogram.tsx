'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

export function ClaimsCostHistogram({ data }: { data: { name: string; value: number; range?: string }[] }) {
  // Color gradient based on cost range
  const getColor = (index: number, total: number) => {
    const colors = ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95']
    return colors[Math.min(index % colors.length, colors.length - 1)]
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value
      const item = payload[0].payload
      const totalMembers = data.reduce((sum, d) => sum + d.value, 0)
      const percentage = ((value / totalMembers) * 100).toFixed(1)
      
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2">{item.range ? `Cost Range: ${item.range}` : label}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Members:</span>
              <span className="font-semibold text-purple-600">{value.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Percentage:</span>
              <span className="font-semibold">{percentage}%</span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t border-gray-200">
              <span className="text-gray-600">Total Members:</span>
              <span className="font-semibold">{totalMembers.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-muted-foreground">
        No claims data available
      </div>
    )
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 15, left: 10, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            interval={0} 
            angle={-45} 
            textAnchor="end" 
            height={80}
            tick={{ fontSize: 10 }}
          />
          <YAxis 
            allowDecimals={false}
            tick={{ fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(index, data.length)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

