import { ArrowUpRight, ArrowDownRight, ArrowLeftRight } from 'lucide-react'
import { formatAmount, formatDate } from '@/lib/utils'
import type { Transaction } from '@/types'

interface Props {
  transactions: Transaction[]
}

export default function RecentActivity({ transactions }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="card">
        <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-slate-400" />
          Recent Activity
        </h2>
        <p className="text-sm text-slate-400 text-center py-6">No transactions yet</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
        <ArrowLeftRight className="w-4 h-4 text-slate-400" />
        Recent Activity
      </h2>
      <div className="space-y-1">
        {transactions.map(tx => (
          <div key={tx.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              tx.type === 'income' ? 'bg-income-light' : 'bg-expense-light'
            }`}>
              {tx.type === 'income'
                ? <ArrowUpRight className="w-4 h-4 text-income" />
                : <ArrowDownRight className="w-4 h-4 text-expense" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">
                {tx.category?.name || 'Uncategorized'}
              </p>
              <p className="text-xs text-slate-400">
                {tx.note ? `${tx.note} · ` : ''}{formatDate(tx.date, 'dd MMM')}
              </p>
            </div>
            <span className={`text-sm font-semibold flex-shrink-0 ${
              tx.type === 'income' ? 'text-income' : 'text-expense'
            }`}>
              {tx.type === 'income' ? '+' : '−'}{formatAmount(tx.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
