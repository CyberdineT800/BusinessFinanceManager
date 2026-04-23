import { Search, X } from 'lucide-react'
import type { TransactionFilters as Filters } from '@/types'
import type { Category } from '@/types'

interface Props {
  filters: Filters
  onChange: (f: Filters) => void
  categories: Category[]
}

export default function TransactionFilters({ filters, onChange, categories }: Props) {
  function set(patch: Partial<Filters>) {
    onChange({ ...filters, ...patch, page: 1 })
  }

  function clear() {
    onChange({ page: 1, page_size: filters.page_size })
  }

  const hasFilters = filters.type || filters.category_id || filters.date_from || filters.date_to || filters.search

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          className="input pl-9"
          placeholder="Search notes..."
          value={filters.search || ''}
          onChange={e => set({ search: e.target.value || undefined })}
        />
      </div>

      <div>
        <label className="label">Type</label>
        <select
          className="select w-32"
          value={filters.type || ''}
          onChange={e => set({ type: (e.target.value as 'income' | 'expense') || undefined })}
        >
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div>
        <label className="label">Category</label>
        <select
          className="select w-44"
          value={filters.category_id || ''}
          onChange={e => set({ category_id: e.target.value ? parseInt(e.target.value) : undefined })}
        >
          <option value="">All categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">From</label>
        <input
          type="date"
          className="input w-36"
          value={filters.date_from || ''}
          onChange={e => set({ date_from: e.target.value || undefined })}
        />
      </div>

      <div>
        <label className="label">To</label>
        <input
          type="date"
          className="input w-36"
          value={filters.date_to || ''}
          onChange={e => set({ date_to: e.target.value || undefined })}
        />
      </div>

      {hasFilters && (
        <button onClick={clear} className="btn-secondary self-end">
          <X className="w-4 h-4" />
          Clear
        </button>
      )}
    </div>
  )
}
