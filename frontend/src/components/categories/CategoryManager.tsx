import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories'
import type { Category } from '@/types'

const COLORS = [
  '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#f43f5e',
  '#ef4444', '#f97316', '#ec4899', '#84cc16', '#6366f1',
  '#14b8a6', '#64748b', '#0ea5e9', '#a855f7', '#eab308',
]

interface Props {
  categories: Category[]
  type: 'income' | 'expense'
}

function CategoryRow({ cat }: { cat: Category }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(cat.name)
  const [color, setColor] = useState(cat.color)
  const update = useUpdateCategory()
  const del = useDeleteCategory()

  async function save() {
    await update.mutateAsync({ id: cat.id, data: { name, color } })
    setEditing(false)
  }

  async function remove() {
    if (!window.confirm(`Delete "${cat.name}"? This won't affect existing transactions.`)) return
    await del.mutateAsync(cat.id)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
        <div className="flex gap-1 flex-wrap w-36">
          {COLORS.map(c => (
            <button
              key={c}
              className={`w-5 h-5 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-1 ring-brand' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <input
          className="input flex-1 text-sm py-1.5"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
        <button onClick={save} className="p-1.5 rounded-lg bg-income-light text-income hover:bg-income hover:text-white transition-colors">
          <Check className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0 group">
      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
      <span className="flex-1 text-sm text-slate-700">{cat.name}</span>
      {cat.is_default && (
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">default</span>
      )}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-brand hover:bg-brand-light transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        {!cat.is_default && (
          <button
            onClick={remove}
            className="p-1.5 rounded-lg text-slate-400 hover:text-expense hover:bg-expense-light transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

function AddCategoryForm({ type, onDone }: { type: 'income' | 'expense'; onDone: () => void }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const create = useCreateCategory()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await create.mutateAsync({ name: name.trim(), type, color })
    setName('')
    onDone()
  }

  return (
    <form onSubmit={submit} className="mt-3 pt-3 border-t border-slate-100">
      <div className="flex gap-1 flex-wrap mb-2">
        {COLORS.map(c => (
          <button
            type="button"
            key={c}
            className={`w-5 h-5 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-1 ring-brand' : ''}`}
            style={{ backgroundColor: c }}
            onClick={() => setColor(c)}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="input flex-1 text-sm"
          placeholder="Category name..."
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
        <button type="submit" className="btn-primary py-2" disabled={create.isPending}>
          <Plus className="w-4 h-4" />
        </button>
        <button type="button" className="btn-secondary py-2" onClick={onDone}>
          <X className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}

export default function CategoryManager({ categories, type }: Props) {
  const [adding, setAdding] = useState(false)
  const filtered = categories.filter(c => c.type === type)

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700 capitalize">{type} Categories</h3>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 text-xs text-brand hover:text-brand-dark font-medium"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        )}
      </div>
      <div>
        {filtered.map(cat => <CategoryRow key={cat.id} cat={cat} />)}
        {filtered.length === 0 && <p className="text-sm text-slate-400 py-3 text-center">No categories yet</p>}
      </div>
      {adding && <AddCategoryForm type={type} onDone={() => setAdding(false)} />}
    </div>
  )
}
