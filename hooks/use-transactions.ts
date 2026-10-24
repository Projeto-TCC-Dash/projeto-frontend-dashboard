"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Transaction, Category, TransactionSource } from "@/src/types/api";

export interface TransactionFilters {
  month: string;
  category?: Category;
  source?: TransactionSource;
  accountId?: string;
}

export function useTransactions(filters: TransactionFilters) {
  const queryKey = [
    "transactions",
    {
      month: filters.month,
      category: filters.category,
      source: filters.source,
      accountId: filters.accountId,
    },
  ] as const;

  const query = useQuery<Transaction[], Error>({
    queryKey,
    queryFn: async () => {
      const params: Record<string, string | undefined> = {
        month: filters.month,
        category: filters.category,
        source: filters.source,
        accountId: filters.accountId,
      };

      return apiClient.get<Transaction[]>("/api/transactions", { params });
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: Boolean(filters.month),
  });

  return {
    transactions: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
