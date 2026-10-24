"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import { UploadTransactionsResponse } from "@/src/types/api";

export type UploadTransactionsInput =
  | File
  | { file: File; accountId?: string };

export function useUploadTransactions() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    UploadTransactionsResponse,
    Error,
    UploadTransactionsInput
  >({
    mutationFn: async (input: UploadTransactionsInput) => {
      const file = input instanceof File ? input : input.file;
      const accountId = input instanceof File ? undefined : input.accountId;

      const formData = new FormData();
      formData.append("file", file);

      const url = accountId
        ? `/api/transactions/upload?accountId=${encodeURIComponent(accountId)}`
        : "/api/transactions/upload";

      return apiRequest<UploadTransactionsResponse>(url, {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["analysis"] });
    },
  });

  return {
    upload: mutation.mutateAsync,
    isUploading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}
