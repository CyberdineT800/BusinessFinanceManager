import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ArrowLeftRight, BarChart3,
  Tag, Target, TrendingUp, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { clearToken } from '@/lib/auth'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/categories', icon: Tag, label: 'Categories' },
  { to: '/budgets', icon: Target, label: 'Budgets' },
]

export default function Sidebar() {
  const navigate = useNavigate()

  function logout() {
    clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-sidebar flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border">
        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
          <TrendingUp className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">FinanceManager</p>
          <p className="text-slate-400 text-xs">Business Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-sidebar-active text-white'
                  : 'text-slate-400 hover:text-white hover:bg-sidebar-hover'
              )
            }
          >
            <Icon className="w-4.5 h-4.5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-0.5">
        <a
          href="https://t.me/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-sidebar-hover transition-all"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
          </svg>
          Telegram Bot
        </a>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-sidebar-hover transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
