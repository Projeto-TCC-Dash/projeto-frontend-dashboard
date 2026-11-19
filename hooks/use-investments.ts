"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import type {
  InvestmentPortfolioSummary,
  UpsertInvestmentHoldingDTO,
} from "@/src/types/api"

export function useInvestmentPortfolio() {
  const { isAuthenticated } = useAuth()

  const query = useQuery<InvestmentPortfolioSummary, Error>({
    queryKey: ["investments", "holdings"],
    queryFn: async () => {
      return await apiClient.get<InvestmentPortfolioSummary>(
        "/api/investments/holdings"
      )
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutos
  })

  return {
    ...query,
    portfolio: query.data ?? null,
    totalInvested: query.data?.totalInvested ?? 0,
    holdings: query.data?.holdings ?? [],
    allocationDiagnosis: query.data?.allocationDiagnosis ?? null,
  }
}

export function useUpsertInvestmentHolding() {
  const queryClient = useQueryClient()

  const mutation = useMutation<
    InvestmentPortfolioSummary,
    Error,
    UpsertInvestmentHoldingDTO
  >({
    mutationFn: async (data) => {
      return await apiClient.put<InvestmentPortfolioSummary>(
        "/api/investments/holdings",
        data
      )
    },
    onSuccess: (updatedSummary) => {
      queryClient.setQueryData(["investments", "holdings"], updatedSummary)
      queryClient.invalidateQueries({ queryKey: ["investments"] })
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
    },
  })

  return {
    upsertHolding: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  }
}
