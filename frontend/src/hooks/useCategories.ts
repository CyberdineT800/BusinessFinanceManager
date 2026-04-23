import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryApi } from '@/lib/api'

export function useCategories(includeStats = false) {
  return useQuery({
    queryKey: ['categories', includeStats],
    queryFn: () => categoryApi.list(includeStats),
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: categoryApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof categoryApi.update>[1] }) =>
      categoryApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: categoryApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}
