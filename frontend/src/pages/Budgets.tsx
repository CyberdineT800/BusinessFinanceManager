import { useState } from 'react'
import { format, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, Target } from 'lucide-react'
import { useBudgets } from '@/hooks/useBudgets'
import BudgetManager from '@/components/budgets/BudgetManager'
import Spinner from '@/components/shared/Spinner'
import { formatAmount } from '@/lib/utils'

export default function Budgets() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const monthStr = format(currentMonth, 'yyyy-MM')
  const { data: budgets = [], isLoading } = useBudgets(monthStr)

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0)
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)
  const overBudget = budgets.filter(b => b.utilization_pct > 100).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Budget Planning</h2>
          <p className="text-xs text-slate-400">Set and track monthly spending limits per category</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(m => subMonths(m, 1))}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>
          <span className="text-sm font-medium text-slate-700 w-28 text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentMonth(m => addMonths(m, 1))}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {budgets.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-xs text-slate-400 mb-1">Total Budget</p>
            <p className="text-xl font-bold text-brand">{formatAmount(totalBudget)}</p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-slate-400 mb-1">Total Spent</p>
            <p className={`text-xl font-bold ${totalSpent > totalBudget ? 'text-expense' : 'text-slate-700'}`}>
              {formatAmount(totalSpent)}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-slate-400 mb-1">Over Budget</p>
            <p className={`text-xl font-bold ${overBudget > 0 ? 'text-expense' : 'text-income'}`}>
              {overBudget} {overBudget === 1 ? 'category' : 'categories'}
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <BudgetManager budgets={budgets} month={monthStr} />
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-brand" />
              How Budget Tracking Works
            </h3>
            <div className="space-y-3">
              {[
                { icon: '📊', text: 'Set monthly limits per expense category' },
                { icon: '🤖', text: 'Telegram bot logs expenses automatically' },
                { icon: '⚠️', text: 'See warnings when approaching 80% of budget' },
                { icon: '📈', text: 'Track spending vs budget in real-time' },
                { icon: '💡', text: 'AI insights highlight anomalies in spending' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-start gap-2.5">
                  <span className="text-base leading-none mt-0.5">{icon}</span>
                  <p className="text-sm text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
