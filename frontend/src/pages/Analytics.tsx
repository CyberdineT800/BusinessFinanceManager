import { useState } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { useAnalytics } from '@/hooks/useAnalytics'
import RevenueExpenseChart from '@/components/analytics/RevenueExpenseChart'
import CategoryBreakdownChart from '@/components/analytics/CategoryBreakdown'
import ForecastChart from '@/components/analytics/ForecastChart'
import InsightCards from '@/components/analytics/InsightCards'
import Spinner from '@/components/shared/Spinner'
import { formatAmount } from '@/lib/utils'

const PERIODS = [
  { label: 'This Month', value: 'month' },
  { label: 'Last 3 Months', value: '3months' },
  { label: 'This Year', value: 'year' },
]

function getPeriodRange(period: string): { from: string; to: string } {
  const now = new Date()
  if (period === 'year') {
    return { from: `${now.getFullYear()}-01-01`, to: format(now, 'yyyy-MM-dd') }
  }
  if (period === '3months') {
    const from = new Date(now)
    from.setMonth(from.getMonth() - 2)
    return { from: format(startOfMonth(from), 'yyyy-MM-dd'), to: format(now, 'yyyy-MM-dd') }
  }
  return { from: format(startOfMonth(now), 'yyyy-MM-dd'), to: format(now, 'yyyy-MM-dd') }
}

export default function Analytics() {
  const [period, setPeriod] = useState('month')
  const [catType, setCatType] = useState<'income' | 'expense'>('expense')
  const { from, to } = getPeriodRange(period)
  const { data, isLoading } = useAnalytics(from, to)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {PERIODS.map(p => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              period === p.value
                ? 'bg-brand text-white'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {isLoading && <Spinner />}

      {!isLoading && data && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Income', value: data.period_comparison.current.total_income, color: 'text-income' },
              { label: 'Expense', value: data.period_comparison.current.total_expense, color: 'text-expense' },
              { label: 'Net', value: data.period_comparison.current.net, color: data.period_comparison.current.net >= 0 ? 'text-income' : 'text-expense' },
            ].map(m => (
              <div key={m.label} className="card text-center">
                <p className="text-xs text-slate-400 mb-1">{m.label}</p>
                <p className={`text-xl font-bold ${m.color}`}>{formatAmount(Math.abs(m.value))}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 card">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Revenue vs Expenses Trend</h3>
              <RevenueExpenseChart data={data.monthly_trends} />
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">AI Insights</h3>
              <InsightCards insights={data.insights} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700">Category Breakdown</h3>
                <div className="flex rounded-lg overflow-hidden border border-slate-200">
                  <button
                    onClick={() => setCatType('income')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${catType === 'income' ? 'bg-income text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    Income
                  </button>
                  <button
                    onClick={() => setCatType('expense')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${catType === 'expense' ? 'bg-expense text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    Expense
                  </button>
                </div>
              </div>
              <CategoryBreakdownChart data={data.category_breakdown} type={catType} />
            </div>

            <div className="card">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Cash Flow Forecast</h3>
              <ForecastChart data={data.forecast} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
