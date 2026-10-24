"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import type {
  Account,
  AccountsOverview,
  CreateAccountDTO,
  UpdateAccountDTO,
  DeleteAccountParams,
} from "@/src/types/api";

export function useAccounts() {
  const { isAuthenticated } = useAuth();

  const query = useQuery<AccountsOverview, Error>({
    queryKey: ["accounts"],
    queryFn: async () => {
      return await apiClient.get<AccountsOverview>("/api/accounts");
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  return {
    ...query,
    accounts: query.data?.accounts ?? [],
    netWorth: query.data?.netWorth ?? 0,
  };
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  const mutation = useMutation<Account, Error, CreateAccountDTO>({
    mutationFn: async (data: CreateAccountDTO) => {
      return await apiClient.post<Account>("/api/accounts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["financial-analysis"] });
    },
  });

  return {
    createAccount: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    Account,
    Error,
    { id: string; data: UpdateAccountDTO }
  >({
    mutationFn: async ({ id, data }) => {
      return await apiClient.patch<Account>(`/api/accounts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["financial-analysis"] });
    },
  });

  return {
    updateAccount: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    { success: boolean; message?: string },
    Error,
    DeleteAccountParams
  >({
    mutationFn: async ({ id, cascade }) => {
      const queryParam = cascade !== undefined ? `?cascade=${cascade}` : "";
      return await apiClient.delete<{ success: boolean; message?: string }>(
        `/api/accounts/${id}${queryParam}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["financial-analysis"] });
    },
  });

  return {
    deleteAccount: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}
