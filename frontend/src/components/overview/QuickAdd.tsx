import { useState } from 'react'
import { format } from 'date-fns'
import { PlusCircle } from 'lucide-react'
import { useCreateTransaction } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'

export default function QuickAdd() {
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const { data: categories = [] } = useCategories()
  const create = useCreateTransaction()

  const filteredCats = categories.filter(c => c.type === type)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const num = parseFloat(amount.replace(/\s/g, '').replace(',', '.'))
    if (!num || num <= 0) { setError('Enter a valid amount'); return }
    await create.mutateAsync({
      amount: num,
      type,
      category_id: categoryId ? parseInt(categoryId) : undefined,
      date,
      note: note || undefined,
      source: 'dashboard',
    })
    setAmount('')
    setNote('')
    setCategoryId('')
  }

  return (
    <div className="card">
      <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
        <PlusCircle className="w-4 h-4 text-brand" />
        Quick Add Transaction
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex rounded-lg overflow-hidden border border-slate-200">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              type === 'income'
                ? 'bg-income text-white'
                : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              type === 'expense'
                ? 'bg-expense text-white'
                : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            Expense
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Amount (so'm)</label>
            <input
              className="input"
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Date</label>
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
          <label className="label">Note (optional)</label>
          <input className="input" placeholder="Add a note..." value={note} onChange={e => setNote(e.target.value)} />
        </div>

        {error && <p className="text-xs text-expense">{error}</p>}
        {create.isError && <p className="text-xs text-expense">Failed to save. Try again.</p>}

        <button
          type="submit"
          className="btn-primary w-full justify-center"
          disabled={create.isPending}
        >
          {create.isPending ? 'Saving...' : 'Save Transaction'}
        </button>
      </form>
    </div>
  )
}
