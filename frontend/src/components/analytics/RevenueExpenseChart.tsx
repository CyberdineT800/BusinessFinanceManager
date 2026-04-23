import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { formatAmountCompact, formatMonth } from '@/lib/utils'
import type { MonthlyTrend } from '@/types'

interface Props { data: MonthlyTrend[] }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-card-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 mb-2">{formatMonth(label)}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-medium">{formatAmountCompact(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

export default function RevenueExpenseChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="income-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="expense-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
          </linearGradient>
        </defs>
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
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(v) => <span className="text-slate-600">{v}</span>}
        />
        <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fill="url(#income-grad)" />
        <Area type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={2} fill="url(#expense-grad)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
