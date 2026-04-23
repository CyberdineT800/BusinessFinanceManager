import axios from 'axios'
import { getToken, clearToken } from '@/lib/auth'
import type {
  Transaction, TransactionListResponse, TransactionFilters, TransactionCreate,
  OverviewResponse, AnalyticsSummary, Category, Budget, BudgetCreate,
} from '@/types'

const api = axios.create({
  baseURL: '/financemanager/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      clearToken()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const overviewApi = {
  get: (): Promise<OverviewResponse> =>
    api.get('/overview').then(r => r.data),
}

export const transactionApi = {
  list: (filters: TransactionFilters = {}): Promise<TransactionListResponse> => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    return api.get('/transactions', { params }).then(r => r.data)
  },
  create: (data: TransactionCreate): Promise<Transaction> =>
    api.post('/transactions', data).then(r => r.data),
  update: (id: number, data: Partial<TransactionCreate>): Promise<Transaction> =>
    api.patch(`/transactions/${id}`, data).then(r => r.data),
  delete: (id: number): Promise<void> =>
    api.delete(`/transactions/${id}`).then(r => r.data),
}

export const categoryApi = {
  list: (includeStats = false): Promise<Category[]> =>
    api.get('/categories', { params: { include_stats: includeStats } }).then(r => r.data),
  create: (data: Pick<Category, 'name' | 'type' | 'color' | 'icon'>): Promise<Category> =>
    api.post('/categories', data).then(r => r.data),
  update: (id: number, data: Partial<Pick<Category, 'name' | 'color' | 'icon'>>): Promise<Category> =>
    api.patch(`/categories/${id}`, data).then(r => r.data),
  delete: (id: number): Promise<void> =>
    api.delete(`/categories/${id}`).then(r => r.data),
}

export const analyticsApi = {
  get: (dateFrom?: string, dateTo?: string): Promise<AnalyticsSummary> => {
    const params: Record<string, string> = {}
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo
    return api.get('/analytics', { params }).then(r => r.data)
  },
}

export const budgetApi = {
  list: (month?: string): Promise<Budget[]> => {
    const params = month ? { month } : {}
    return api.get('/budgets', { params }).then(r => r.data)
  },
  create: (data: BudgetCreate): Promise<Budget> =>
    api.post('/budgets', data).then(r => r.data),
  delete: (id: number): Promise<void> =>
    api.delete(`/budgets/${id}`).then(r => r.data),
}

export default api
