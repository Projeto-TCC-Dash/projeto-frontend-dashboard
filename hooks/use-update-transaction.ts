"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Transaction, UpdateTransactionDTO } from "@/src/types/api";

export interface UpdateTransactionParams {
  id: string;
  data: UpdateTransactionDTO;
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  const mutation = useMutation<Transaction, Error, UpdateTransactionParams>({
    mutationFn: async ({ id, data }: UpdateTransactionParams) => {
      return apiClient.patch<Transaction>(`/api/transactions/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  return {
    updateTransaction: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}
