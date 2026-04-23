import { useCategories } from '@/hooks/useCategories'
import CategoryManager from '@/components/categories/CategoryManager'
import Spinner from '@/components/shared/Spinner'

export default function Categories() {
  const { data: categories = [], isLoading } = useCategories(true)

  if (isLoading) return <Spinner />

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-800">Category Management</h2>
        <p className="text-xs text-slate-400">Organize your transactions with custom categories</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <CategoryManager categories={categories} type="income" />
        <CategoryManager categories={categories} type="expense" />
      </div>

      <div className="card bg-brand-light/40 border-brand/20">
        <p className="text-sm text-brand-dark font-medium mb-1">💡 Tip</p>
        <p className="text-xs text-slate-600">
          Categories are shared across the Telegram bot and dashboard. When your team logs transactions via the bot,
          it automatically matches to these categories using AI. Default categories cannot be deleted.
        </p>
      </div>
    </div>
  )
}
