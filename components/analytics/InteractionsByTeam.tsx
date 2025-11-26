'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

export function InteractionsByTeam({ data, keys }: { data: any[]; keys: string[] }) {
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16']
  
  const getTeamName = (key: string) => {
    const teamMap: Record<string, string> = {
      'care_coord': 'Care Coordination',
      'sdoh': 'SDOH Team',
      'quality': 'Quality',
      'risk_adj': 'Risk Adjustment',
      'vendor_a': 'Vendor A',
      'vendor_b': 'Vendor B',
      'vendor_c': 'Vendor C',
      'vendor_d': 'Vendor D',
    }
    return teamMap[key] || key
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, p: any) => sum + (p.value || 0), 0)
      
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2">Week: {label}</p>
          <div className="space-y-1 text-xs max-h-48 overflow-y-auto">
            {payload
              .filter((p: any) => p.value > 0)
              .sort((a: any, b: any) => (b.value || 0) - (a.value || 0))
              .map((p: any, idx: number) => {
                const percentage = total > 0 ? ((p.value / total) * 100).toFixed(1) : '0.0'
                return (
                  <div key={idx} className="flex justify-between gap-4">
                    <span className="text-gray-600 flex items-center gap-1">
                      <span 
                        className="inline-block w-3 h-3 rounded" 
                        style={{ backgroundColor: p.color }}
                      />
                      {getTeamName(p.dataKey)}:
                    </span>
                    <span className="font-semibold">
                      {p.value.toLocaleString()} ({percentage}%)
                    </span>
                  </div>
                )
              })}
            <div className="flex justify-between gap-4 pt-1 border-t border-gray-200 mt-1">
              <span className="text-gray-600 font-semibold">Total:</span>
              <span className="font-semibold text-blue-600">{total.toLocaleString()}</span>
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
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="week" 
            tick={{ fontSize: 10 }}
          />
          <YAxis 
            allowDecimals={false}
            tick={{ fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            formatter={(value) => getTeamName(value)}
          />
          {keys.map((k, i) => (
            <Area 
              key={k} 
              type="monotone" 
              dataKey={k} 
              stackId="1" 
              stroke={colors[i % colors.length]}
              fill={colors[i % colors.length]}
              name={k}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

