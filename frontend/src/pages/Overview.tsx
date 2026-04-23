import { ArrowLeftRight, BarChart3, Bot } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useOverview } from '@/hooks/useOverview'
import MetricCards from '@/components/overview/MetricCards'
import QuickAdd from '@/components/overview/QuickAdd'
import RecentActivity from '@/components/overview/RecentActivity'
import Spinner from '@/components/shared/Spinner'
import { formatDate } from '@/lib/utils'

function OnboardingBanner() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-sidebar to-slate-800 p-6 text-white mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1">Welcome to FinanceManager 👋</h2>
          <p className="text-slate-300 text-sm max-w-md">
            Your business finance command center. Add your first transaction using the quick form below,
            or send a voice message to your Telegram bot to get started.
          </p>
        </div>
        <div className="flex-shrink-0 w-12 h-12 bg-brand rounded-xl flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <a
          href="https://t.me/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Bot className="w-4 h-4" /> Open Telegram Bot
        </a>
        <Link
          to="/transactions"
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeftRight className="w-4 h-4" /> View All Transactions
        </Link>
      </div>
    </div>
  )
}

export default function Overview() {
  const { data, isLoading } = useOverview()

  if (isLoading) return <Spinner />

  const isEmpty = !data || (data.metrics.total_income === 0 && data.metrics.total_expense === 0)

  return (
    <div className="space-y-6">
      {isEmpty && <OnboardingBanner />}

      {data && (
        <>
          <div>
            <p className="text-xs text-slate-400 mb-3">
              {formatDate(data.period_start)} — {formatDate(data.period_end)} · This month
            </p>
            <MetricCards metrics={data.metrics} />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <RecentActivity transactions={data.recent_transactions} />
            </div>
            <div>
              <QuickAdd />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
