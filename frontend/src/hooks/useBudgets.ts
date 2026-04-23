import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetApi } from '@/lib/api'
import type { BudgetCreate } from '@/types'

export function useBudgets(month?: string) {
  return useQuery({
    queryKey: ['budgets', month],
    queryFn: () => budgetApi.list(month),
  })
}

export function useCreateBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: budgetApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  })
}

export function useDeleteBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: budgetApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  })
}
