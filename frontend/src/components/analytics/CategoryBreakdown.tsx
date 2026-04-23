import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatAmount } from '@/lib/utils'
import type { CategoryBreakdown } from '@/types'

interface Props {
  data: CategoryBreakdown[]
  type: 'income' | 'expense'
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-card-lg p-3 text-sm">
      <p className="font-semibold text-slate-700">{d.category_name}</p>
      <p className="text-slate-500">{formatAmount(d.total)}</p>
      <p className="text-slate-400">{d.percentage}%</p>
    </div>
  )
}

export default function CategoryBreakdown({ data, type }: Props) {
  const filtered = data.filter(d => d.type === type)
  if (!filtered.length) {
    return <p className="text-sm text-slate-400 text-center py-8">No data for this period</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={filtered}
            dataKey="total"
            nameKey="category_name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
          >
            {filtered.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {filtered.map(item => (
          <div key={item.category_name} className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-slate-600 flex-1 truncate">{item.category_name}</span>
            <span className="text-sm font-medium text-slate-700">{formatAmount(item.total)}</span>
            <span className="text-xs text-slate-400 w-10 text-right">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
