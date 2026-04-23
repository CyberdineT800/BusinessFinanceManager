import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts'
import { formatAmountCompact, formatMonth } from '@/lib/utils'
import type { ForecastMonth } from '@/types'

interface Props { data: ForecastMonth[] }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-card-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 mb-1">{formatMonth(label)} (forecast)</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-medium">{formatAmountCompact(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

export default function ForecastChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-400">
        Not enough data for forecasting (need 2+ months)
      </div>
    )
  }

  const chartData = data.map(d => ({
    month: d.month,
    'Predicted Income': Math.round(d.predicted_income),
    'Predicted Expense': Math.round(d.predicted_expense),
    confidence: d.confidence,
  }))

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
          AI Forecast · {Math.round((data[0]?.confidence || 0) * 100)}% confidence
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonth}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={v => formatAmountCompact(v)}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Predicted Income" fill="#10b981" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Predicted Expense" fill="#f43f5e" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
