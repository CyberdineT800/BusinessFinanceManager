import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/lib/api'

export function useAnalytics(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['analytics', dateFrom, dateTo],
    queryFn: () => analyticsApi.get(dateFrom, dateTo),
  })
}
