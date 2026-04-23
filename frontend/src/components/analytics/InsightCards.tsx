import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import type { InsightItem } from '@/types'

const ICON_MAP: Record<string, React.ElementType> = {
  income_growth: TrendingUp,
  expense_trend: TrendingDown,
  cash_flow_warning: AlertTriangle,
  healthy_margin: CheckCircle,
  top_expense: Info,
}

const COLOR_MAP: Record<string, string> = {
  up: 'bg-expense-light text-expense-dark',
  down: 'bg-income-light text-income-dark',
  neutral: 'bg-brand-light text-brand-dark',
}

export default function InsightCards({ insights }: { insights: InsightItem[] }) {
  if (!insights.length) return null

  return (
    <div className="grid grid-cols-1 gap-3">
      {insights.map((insight, i) => {
        const Icon = ICON_MAP[insight.type] || Info
        const colorClass = COLOR_MAP[insight.trend || 'neutral'] || COLOR_MAP.neutral
        return (
          <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-white">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700">{insight.title}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{insight.description}</p>
            </div>
            {insight.value && (
              <span className={`text-sm font-bold flex-shrink-0 ${colorClass.split(' ')[1]}`}>
                {insight.value}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
