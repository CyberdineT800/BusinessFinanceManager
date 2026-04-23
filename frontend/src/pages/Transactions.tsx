import { useState } from 'react'
import { Plus, ArrowLeftRight } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import TransactionTable from '@/components/transactions/TransactionTable'
import TransactionFilters from '@/components/transactions/TransactionFilters'
import TransactionModal from '@/components/transactions/TransactionModal'
import EmptyState from '@/components/shared/EmptyState'
import Spinner from '@/components/shared/Spinner'
import type { TransactionFilters as Filters } from '@/types'

export default function Transactions() {
  const [filters, setFilters] = useState<Filters>({ page: 1, page_size: 20 })
  const [showCreate, setShowCreate] = useState(false)
  const { data, isLoading } = useTransactions(filters)
  const { data: categories = [] } = useCategories()

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">All Transactions</h2>
          {data && <p className="text-xs text-slate-400">{data.total} total entries</p>}
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> New Transaction
        </button>
      </div>

      <div className="card">
        <TransactionFilters
          filters={filters}
          onChange={setFilters}
          categories={categories}
        />
      </div>

      {isLoading && <Spinner />}

      {!isLoading && data && data.items.length === 0 && (
        <EmptyState
          icon={ArrowLeftRight}
          title="No transactions found"
          description="Try adjusting your filters, or add your first transaction."
          action={{ label: 'Add Transaction', onClick: () => setShowCreate(true) }}
        />
      )}

      {!isLoading && data && data.items.length > 0 && (
        <TransactionTable
          data={data}
          page={filters.page || 1}
          onPageChange={p => setFilters(f => ({ ...f, page: p }))}
        />
      )}

      <TransactionModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
