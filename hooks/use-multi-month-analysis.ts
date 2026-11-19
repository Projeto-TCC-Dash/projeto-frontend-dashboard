"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import type {
  MultiMonthAnalysisResponse,
  MultiMonthRange,
} from "@/src/types/api"

export function useMultiMonthAnalysis(
  range: MultiMonthRange,
  options?: { enabled?: boolean }
) {
  const { isAuthenticated } = useAuth()
  const enabled = (options?.enabled ?? true) && isAuthenticated

  const query = useQuery<MultiMonthAnalysisResponse, Error>({
    queryKey: ["analysis", "multi-month", range],
    queryFn: async () => {
      return await apiClient.get<MultiMonthAnalysisResponse>(
        "/api/analysis/multi-month",
        {
          params: { range },
        }
      )
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  })

  return {
    ...query,
    analysis: query.data ?? null,
  }
}
