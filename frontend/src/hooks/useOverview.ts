import { useQuery } from '@tanstack/react-query'
import { overviewApi } from '@/lib/api'

export function useOverview() {
  return useQuery({
    queryKey: ['overview'],
    queryFn: overviewApi.get,
  })
}
