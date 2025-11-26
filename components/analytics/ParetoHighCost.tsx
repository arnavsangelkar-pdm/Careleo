'use client'

import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

export function ParetoHighCost({ data }: { data: { name: string; cost: number; cumPct: number }[] }) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const costItem = payload.find((p: any) => p.dataKey === 'cost')
      const cumPctItem = payload.find((p: any) => p.dataKey === 'cumPct')
      const cost = costItem?.value || 0
      const cumPct = cumPctItem?.value || 0
      const memberId = label
      const rank = data.findIndex(d => d.name === memberId) + 1
      const totalCost = data.reduce((sum, d) => sum + d.cost, 0)
      const individualPct = ((cost / totalCost) * 100).toFixed(2)
      
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2">Member: {memberId}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Rank:</span>
              <span className="font-semibold">#{rank} of {data.length}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Total Cost:</span>
              <span className="font-semibold text-purple-600">${cost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Individual %:</span>
              <span className="font-semibold">{individualPct}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Cumulative %:</span>
              <span className="font-semibold text-red-600">{cumPct}%</span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t border-gray-200">
              <span className="text-gray-600">Total Top {data.length} Cost:</span>
              <span className="font-semibold">${totalCost.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            hide 
          />
          <YAxis 
            yAxisId="left" 
            allowDecimals={false}
            tick={{ fontSize: 11 }}
            label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft' }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            domain={[0, 100]} 
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11 }}
            label={{ value: 'Cumulative %', angle: 90, position: 'insideRight' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            formatter={(value) => value === 'cost' ? 'Individual Cost' : 'Cumulative %'}
          />
          <Bar 
            yAxisId="left" 
            dataKey="cost" 
            fill="#8B5CF6" 
            name="cost"
            radius={[4, 4, 0, 0]}
          />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="cumPct" 
            dot={{ r: 4 }}
            stroke="#EF4444" 
            strokeWidth={2}
            name="cumPct"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

