"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface DeleteTransactionResponse {
  success: boolean;
  message: string;
  deletedId?: string;
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  const mutation = useMutation<DeleteTransactionResponse, Error, string>({
    mutationFn: async (id: string) => {
      return apiClient.delete<DeleteTransactionResponse>(`/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["analysis"] });
    },
  });

  return {
    deleteTransaction: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}
