'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts'

export function OutreachFunnel({ data }: { data: { stage: string; value: number }[] }) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value
      const index = data.findIndex(d => d.stage === label)
      const previousValue = index > 0 ? data[index - 1].value : value
      const conversionRate = previousValue > 0 ? ((value / previousValue) * 100).toFixed(1) : '100.0'
      const dropoff = previousValue - value
      const dropoffRate = previousValue > 0 ? ((dropoff / previousValue) * 100).toFixed(1) : '0.0'
      
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2 capitalize">{label}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Count:</span>
              <span className="font-semibold text-red-600">{value.toLocaleString()}</span>
            </div>
            {index > 0 && (
              <>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Conversion Rate:</span>
                  <span className="font-semibold text-green-600">{conversionRate}%</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Drop-off:</span>
                  <span className="font-semibold text-orange-600">{dropoff.toLocaleString()} ({dropoffRate}%)</span>
                </div>
                <div className="flex justify-between gap-4 pt-1 border-t border-gray-200">
                  <span className="text-gray-600">Previous Stage:</span>
                  <span className="font-semibold">{previousValue.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="stage" 
            tick={{ fontSize: 11 }}
            angle={-15}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            allowDecimals={false}
            tick={{ fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="#EF4444" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="value" position="top" style={{ fontSize: 11 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

