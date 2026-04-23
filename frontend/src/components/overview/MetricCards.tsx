import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatAmount, pctLabel } from '@/lib/utils'
import type { MetricCard } from '@/types'

interface Props {
  metrics: MetricCard
}

function ChangeIndicator({ pct }: { pct?: number }) {
  if (pct === undefined || pct === null) return <span className="text-slate-400 text-xs">vs last period</span>
  const isUp = pct > 0
  const isDown = pct < 0
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${isUp ? 'text-income' : isDown ? 'text-expense' : 'text-slate-400'}`}>
      <Icon className="w-3.5 h-3.5" />
      {pctLabel(pct)} vs last period
    </span>
  )
}

export default function MetricCards({ metrics }: Props) {
  const cards = [
    {
      label: 'Total Income',
      value: formatAmount(metrics.total_income),
      pct: metrics.income_change_pct,
      accent: 'income',
      bg: 'bg-income-light',
      text: 'text-income-dark',
      bar: 'bg-income',
    },
    {
      label: 'Total Expenses',
      value: formatAmount(metrics.total_expense),
      pct: metrics.expense_change_pct,
      accent: 'expense',
      bg: 'bg-expense-light',
      text: 'text-expense-dark',
      bar: 'bg-expense',
    },
    {
      label: 'Net Profit',
      value: formatAmount(Math.abs(metrics.net)),
      pct: metrics.net_change_pct,
      accent: metrics.net >= 0 ? 'income' : 'expense',
      bg: metrics.net >= 0 ? 'bg-income-light' : 'bg-expense-light',
      text: metrics.net >= 0 ? 'text-income-dark' : 'text-expense-dark',
      bar: metrics.net >= 0 ? 'bg-income' : 'bg-expense',
      prefix: metrics.net < 0 ? '−' : '',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="card">
          <p className="text-xs font-medium text-slate-500 mb-2">{card.label}</p>
          <p className={`text-2xl font-bold mb-1 ${card.text}`}>
            {card.prefix}{card.value}
          </p>
          <ChangeIndicator pct={card.pct} />
        </div>
      ))}
    </div>
  )
}
