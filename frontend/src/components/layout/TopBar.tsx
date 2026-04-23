import { useLocation } from 'react-router-dom'
import { format } from 'date-fns'
import { RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

const TITLES: Record<string, string> = {
  '/': 'Overview',
  '/transactions': 'Transactions',
  '/analytics': 'Analytics',
  '/categories': 'Categories',
  '/budgets': 'Budget Planning',
}

export default function TopBar() {
  const { pathname } = useLocation()
  const qc = useQueryClient()
  const title = TITLES[pathname] || 'Overview'
  const today = format(new Date(), 'EEEE, d MMMM yyyy')

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between flex-shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        <p className="text-xs text-slate-400">{today}</p>
      </div>
      <button
        onClick={() => qc.invalidateQueries()}
        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        title="Refresh data"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </header>
  )
}
