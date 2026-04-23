import { useState } from 'react'
import { Plus, Trash2, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { useCreateBudget, useDeleteBudget } from '@/hooks/useBudgets'
import { useCategories } from '@/hooks/useCategories'
import { formatAmount } from '@/lib/utils'
import type { Budget } from '@/types'

function BudgetBar({ budget }: { budget: Budget }) {
  const pct = Math.min(budget.utilization_pct, 100)
  const isOver = budget.utilization_pct > 100
  const isWarning = budget.utilization_pct > 80

  return (
    <div className="py-3 border-b border-slate-50 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: budget.category_color }} />
          <span className="text-sm font-medium text-slate-700">{budget.category_name}</span>
          {(isWarning || isOver) && (
            <AlertTriangle className={`w-3.5 h-3.5 ${isOver ? 'text-expense' : 'text-amber-500'}`} />
          )}
        </div>
        <span className="text-xs text-slate-500">
          {formatAmount(budget.spent)} / {formatAmount(budget.amount)}
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isOver ? 'bg-expense' : isWarning ? 'bg-amber-400' : 'bg-income'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className={`text-xs font-medium ${isOver ? 'text-expense' : isWarning ? 'text-amber-600' : 'text-slate-400'}`}>
          {budget.utilization_pct.toFixed(0)}% used
        </span>
        <span className="text-xs text-slate-400">
          {budget.remaining >= 0 ? `${formatAmount(budget.remaining)} left` : `${formatAmount(Math.abs(budget.remaining))} over`}
        </span>
      </div>
    </div>
  )
}

function AddBudgetForm({ month, onDone }: { month: string; onDone: () => void }) {
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const { data: categories = [] } = useCategories()
  const create = useCreateBudget()

  const expenseCats = categories.filter(c => c.type === 'expense')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const num = parseFloat(amount.replace(/\s/g, '').replace(',', '.'))
    if (!num || !categoryId) return
    await create.mutateAsync({
      category_id: parseInt(categoryId),
      amount: num,
      month: `${month}-01`,
    })
    onDone()
  }

  return (
    <form onSubmit={submit} className="flex gap-2 items-end pt-3 border-t border-slate-100">
      <div className="flex-1">
        <label className="label">Category</label>
        <select className="select" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
          <option value="">— Select —</option>
          {expenseCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="w-36">
        <label className="label">Budget (so'm)</label>
        <input className="input" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} required />
      </div>
      <button type="submit" className="btn-primary self-end" disabled={create.isPending}>
        Set
      </button>
      <button type="button" className="btn-secondary self-end" onClick={onDone}>
        Cancel
      </button>
    </form>
  )
}

interface Props {
  budgets: Budget[]
  month: string
}

export default function BudgetManager({ budgets, month }: Props) {
  const [adding, setAdding] = useState(false)
  const deleteBudget = useDeleteBudget()

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Monthly Budget Tracking</h3>
          <p className="text-xs text-slate-400">{format(new Date(`${month}-01`), 'MMMM yyyy')}</p>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)} className="btn-secondary text-xs py-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Budget
          </button>
        )}
      </div>

      {budgets.length === 0 && !adding && (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500 mb-2">No budgets set for this month</p>
          <p className="text-xs text-slate-400">Set spending limits per category to track your cash flow</p>
        </div>
      )}

      {budgets.map(b => <BudgetBar key={b.id} budget={b} />)}
      {adding && <AddBudgetForm month={month} onDone={() => setAdding(false)} />}
    </div>
  )
}
