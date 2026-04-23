import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { format } from 'date-fns'
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import type { Transaction } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  transaction?: Transaction
}

export default function TransactionModal({ open, onClose, transaction }: Props) {
  const isEdit = !!transaction
  const [type, setType] = useState<'income' | 'expense'>(transaction?.type || 'expense')
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '')
  const [categoryId, setCategoryId] = useState(transaction?.category_id ? String(transaction.category_id) : '')
  const [date, setDate] = useState(transaction?.date || format(new Date(), 'yyyy-MM-dd'))
  const [note, setNote] = useState(transaction?.note || '')

  const { data: categories = [] } = useCategories()
  const create = useCreateTransaction()
  const update = useUpdateTransaction()

  useEffect(() => {
    if (transaction) {
      setType(transaction.type)
      setAmount(String(transaction.amount))
      setCategoryId(transaction.category_id ? String(transaction.category_id) : '')
      setDate(transaction.date)
      setNote(transaction.note || '')
    }
  }, [transaction])

  if (!open) return null

  const filteredCats = categories.filter(c => c.type === type)
  const isPending = create.isPending || update.isPending

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const num = parseFloat(amount.replace(/\s/g, '').replace(',', '.'))
    if (!num) return
    const payload = {
      amount: num,
      type,
      category_id: categoryId ? parseInt(categoryId) : undefined,
      date,
      note: note || undefined,
      source: 'dashboard' as const,
    }
    if (isEdit && transaction) {
      await update.mutateAsync({ id: transaction.id, data: payload })
    } else {
      await create.mutateAsync(payload)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">
            {isEdit ? 'Edit Transaction' : 'New Transaction'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex rounded-xl overflow-hidden border border-slate-200">
            <button
              type="button"
              onClick={() => { setType('income'); setCategoryId('') }}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                type === 'income' ? 'bg-income text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => { setType('expense'); setCategoryId('') }}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                type === 'expense' ? 'bg-expense text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              Expense
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Amount (so'm) *</label>
              <input
                className="input"
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Date *</label>
              <input
                type="date"
                className="input"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Category</label>
            <select className="select" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
              <option value="">— Select category —</option>
              {filteredCats.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Note</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Add details..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={isPending}>
              {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
