export interface Category {
  id: number
  name: string
  type: 'income' | 'expense'
  is_default: boolean
  color: string
  icon?: string
  created_at: string
  transaction_count?: number
  total_amount?: number
}

export interface Transaction {
  id: number
  amount: number
  type: 'income' | 'expense'
  category_id?: number
  category?: {
    id: number
    name: string
    color: string
    icon?: string
    type: string
  }
  date: string
  note?: string
  source: string
  created_at: string
  updated_at: string
}

export interface TransactionListResponse {
  items: Transaction[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface TransactionFilters {
  type?: 'income' | 'expense'
  category_id?: number
  date_from?: string
  date_to?: string
  search?: string
  page?: number
  page_size?: number
}

export interface TransactionCreate {
  amount: number
  type: 'income' | 'expense'
  category_id?: number
  date: string
  note?: string
  source?: string
}

export interface MetricCard {
  total_income: number
  total_expense: number
  net: number
  income_change_pct?: number
  expense_change_pct?: number
  net_change_pct?: number
}

export interface OverviewResponse {
  metrics: MetricCard
  recent_transactions: Transaction[]
  period_start: string
  period_end: string
}

export interface PeriodSummary {
  total_income: number
  total_expense: number
  net: number
  transaction_count: number
}

export interface PeriodComparison {
  current: PeriodSummary
  previous: PeriodSummary
  income_change_pct?: number
  expense_change_pct?: number
  net_change_pct?: number
}

export interface CategoryBreakdown {
  category_id?: number
  category_name: string
  color: string
  type: string
  total: number
  percentage: number
  transaction_count: number
}

export interface MonthlyTrend {
  month: string
  income: number
  expense: number
  net: number
}

export interface DailyTrend {
  date: string
  income: number
  expense: number
}

export interface ForecastMonth {
  month: string
  predicted_income: number
  predicted_expense: number
  predicted_net: number
  confidence: number
}

export interface InsightItem {
  type: string
  title: string
  description: string
  value?: string
  trend?: 'up' | 'down' | 'neutral'
}

export interface AnalyticsSummary {
  period_comparison: PeriodComparison
  category_breakdown: CategoryBreakdown[]
  monthly_trends: MonthlyTrend[]
  daily_trends: DailyTrend[]
  forecast: ForecastMonth[]
  insights: InsightItem[]
}

export interface Budget {
  id: number
  category_id: number
  category_name: string
  category_color: string
  amount: number
  month: string
  spent: number
  remaining: number
  utilization_pct: number
  created_at: string
}

export interface BudgetCreate {
  category_id: number
  amount: number
  month: string
}
