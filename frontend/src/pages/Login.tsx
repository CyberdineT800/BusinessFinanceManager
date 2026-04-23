import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Eye, EyeOff, Lock } from 'lucide-react'
import axios from 'axios'
import { setToken } from '@/lib/auth'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('/api/v1/auth/login', { username, password })
      setToken(res.data.access_token)
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand rounded-2xl mb-4 shadow-lg">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">FinanceManager</h1>
          <p className="text-slate-400 text-sm mt-1">Business Dashboard</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-4 h-4 text-slate-400" />
            <p className="text-sm text-slate-400">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Username</label>
              <input
                className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/50 transition-colors"
                placeholder="admin"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="w-full px-3.5 py-2.5 pr-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/50 transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  onClick={() => setShowPass(v => !v)}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand hover:bg-brand-dark text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Business Finance Manager · Secured Dashboard
        </p>
      </div>
    </div>
  )
}
