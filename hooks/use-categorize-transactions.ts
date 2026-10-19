"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "./use-auth";
import { CategorizeResponse } from "@/src/types/api";

export function useCategorizeTransactions() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const hasAiKey = Boolean(user?.hasAiKey);

  const mutation = useMutation<CategorizeResponse, Error, void>({
    mutationFn: async () => {
      if (!hasAiKey) {
        throw new Error("Chave de IA não configurada. Ative sua chave do Google AI Studio para usar a categorização inteligente.");
      }

      return apiClient.post<CategorizeResponse>("/api/transactions/categorize", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  return {
    categorize: mutation.mutateAsync,
    isCategorizing: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    hasAiKey,
    reset: mutation.reset,
  };
}
