import { useState } from 'react'
import { Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatAmount, formatDate } from '@/lib/utils'
import { useDeleteTransaction } from '@/hooks/useTransactions'
import TransactionModal from './TransactionModal'
import type { Transaction, TransactionListResponse } from '@/types'

interface Props {
  data: TransactionListResponse
  page: number
  onPageChange: (p: number) => void
}

export default function TransactionTable({ data, page, onPageChange }: Props) {
  const [editTx, setEditTx] = useState<Transaction | undefined>()
  const deleteTx = useDeleteTransaction()

  async function handleDelete(tx: Transaction) {
    if (!window.confirm(`Delete "${tx.category?.name || 'transaction'}" for ${formatAmount(tx.amount)}?`)) return
    await deleteTx.mutateAsync(tx.id)
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Note</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Source</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.items.map(tx => (
              <tr key={tx.id} className="bg-white hover:bg-slate-50/60 transition-colors">
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(tx.date)}</td>
                <td className="px-4 py-3">
                  <span className={tx.type === 'income' ? 'badge-income' : 'badge-expense'}>
                    {tx.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {tx.category ? (
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tx.category.color }}
                      />
                      <span className="text-slate-700">{tx.category.name}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{tx.note || '—'}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-500">
                    {tx.source}
                  </span>
                </td>
                <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${
                  tx.type === 'income' ? 'text-income' : 'text-expense'
                }`}>
                  {tx.type === 'income' ? '+' : '−'}{formatAmount(tx.amount)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setEditTx(tx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand hover:bg-brand-light transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-expense hover:bg-expense-light transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.total_pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-400">
            Showing {((page - 1) * data.page_size) + 1}–{Math.min(page * data.page_size, data.total)} of {data.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              className="btn-secondary py-1.5 px-3 text-xs"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-500">{page} / {data.total_pages}</span>
            <button
              className="btn-secondary py-1.5 px-3 text-xs"
              disabled={page >= data.total_pages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <TransactionModal
        open={!!editTx}
        onClose={() => setEditTx(undefined)}
        transaction={editTx}
      />
    </>
  )
}
