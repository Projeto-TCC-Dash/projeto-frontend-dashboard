"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { FinancialAnalysis } from "@/src/types/api";

export interface UseFinancialAnalysisOptions {
  enabled?: boolean;
  retry?: boolean | ((failureCount: number, error: Error) => boolean);
}

export function useFinancialAnalysis(
  month: string,
  options?: UseFinancialAnalysisOptions
) {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryKey = ["analysis", month] as const;

  const query = useQuery<FinancialAnalysis, Error>({
    queryKey,
    queryFn: async () => {
      return apiClient.get<FinancialAnalysis>(`/api/analysis/${month}`);
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    enabled: options?.enabled ?? Boolean(month),
    retry:
      options?.retry !== undefined
        ? options.retry
        : (failureCount, error) => {
            if (
              error instanceof ApiClientError &&
              (error.status === 401 || error.status === 403)
            ) {
              return false;
            }
            return failureCount < 2;
          },
  });

  const refreshAnalysis = async (): Promise<FinancialAnalysis | null> => {
    if (!month) return null;
    setIsRefreshing(true);
    try {
      const freshData = await apiClient.get<FinancialAnalysis>(`/api/analysis/${month}`, {
        params: { forceRefresh: true },
      });
      queryClient.setQueryData(queryKey, freshData);
      return freshData;
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    analysis: query.data ?? null,
    metrics: query.data?.metrics ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isRefreshing,
    isSuccess: query.isSuccess,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    refreshAnalysis,
  };
}
