import { clsx, type ClassValue } from 'clsx'
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatAmount(amount: number, currency = 'UZS'): string {
  const n = Math.round(amount)
  const formatted = n.toLocaleString('ru-RU').replace(/,/g, ' ')
  if (currency === 'USD') return `$${formatted}`
  if (currency === 'EUR') return `€${formatted}`
  return `${formatted} so'm`
}

export function formatAmountCompact(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`
  return String(Math.round(amount))
}

export function formatDate(dateStr: string, fmt = 'dd MMM yyyy'): string {
  try {
    return format(parseISO(dateStr), fmt)
  } catch {
    return dateStr
  }
}

export function formatMonth(monthStr: string): string {
  try {
    return format(parseISO(`${monthStr}-01`), 'MMM yyyy')
  } catch {
    return monthStr
  }
}

export function currentMonthRange(): { from: string; to: string } {
  const now = new Date()
  return {
    from: format(startOfMonth(now), 'yyyy-MM-dd'),
    to: format(endOfMonth(now), 'yyyy-MM-dd'),
  }
}

export function pctColor(pct?: number): string {
  if (pct === undefined || pct === null) return 'text-slate-400'
  if (pct > 0) return 'text-income-DEFAULT'
  if (pct < 0) return 'text-expense-DEFAULT'
  return 'text-slate-400'
}

export function pctLabel(pct?: number): string {
  if (pct === undefined || pct === null) return '—'
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct.toFixed(1)}%`
}
