"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ApiClientError, apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import type { BudgetOverview, SetBudgetPlanDTO } from "@/src/types/api"

export function useBudget(month: string) {
  const { isAuthenticated } = useAuth()

  const query = useQuery<BudgetOverview | null, Error>({
    queryKey: ["budgets", month],
    queryFn: async () => {
      try {
        return await apiClient.get<BudgetOverview>(`/api/budgets/${month}`)
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 404) {
          return null
        }
        throw err
      }
    },
    enabled: isAuthenticated && /^\d{4}-\d{2}$/.test(month),
    staleTime: 1000 * 60 * 2,
    retry: (failureCount, err) => {
      if (err instanceof ApiClientError && err.status === 404) return false
      return failureCount < 1
    },
  })

  return {
    ...query,
    budget: query.data ?? null,
  }
}

export function useUpsertBudget() {
  const queryClient = useQueryClient()

  const mutation = useMutation<
    BudgetOverview,
    Error,
    { month: string; data: SetBudgetPlanDTO }
  >({
    mutationFn: async ({ month, data }) => {
      return await apiClient.put<BudgetOverview>(`/api/budgets/${month}`, data)
    },
    onSuccess: (updatedBudget, variables) => {
      queryClient.setQueryData(["budgets", variables.month], updatedBudget)
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
    },
  })

  return {
    upsertBudget: mutation.mutateAsync,
    isSaving: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  }
}
