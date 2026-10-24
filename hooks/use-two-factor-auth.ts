"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import type {
  Request2FAResponse,
  Confirm2FADTO,
  Disable2FADTO,
  TwoFactorActionResponse,
  UserProfileResponse,
} from "@/src/types/api";

export function useTwoFactorAuth() {
  const queryClient = useQueryClient();
  const { logout } = useAuth();

  const requestEnableMutation = useMutation<Request2FAResponse, Error, void>({
    mutationFn: async () => {
      return await apiClient.post<Request2FAResponse>("/api/auth/2fa/request-enable");
    },
  });

  const confirmEnableMutation = useMutation<
    TwoFactorActionResponse,
    Error,
    Confirm2FADTO
  >({
    mutationFn: async (dto: Confirm2FADTO) => {
      return await apiClient.post<TwoFactorActionResponse>(
        "/api/auth/2fa/confirm-enable",
        dto
      );
    },
    onSuccess: (response) => {
      queryClient.setQueryData(
        ["user-profile"],
        (old: UserProfileResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            security: {
              ...(old.security || {
                hasLocalPassword: true,
                googleLinked: false,
              }),
              twoFactorEnabled: response.twoFactorEnabled,
            },
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });

  const disableMutation = useMutation<
    TwoFactorActionResponse,
    Error,
    Disable2FADTO | undefined
  >({
    mutationFn: async (dto?: Disable2FADTO) => {
      return await apiClient.post<TwoFactorActionResponse>(
        "/api/auth/2fa/disable",
        dto || {}
      );
    },
    onSuccess: (response) => {
      queryClient.setQueryData(
        ["user-profile"],
        (old: UserProfileResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            security: {
              ...(old.security || {
                hasLocalPassword: true,
                googleLinked: false,
              }),
              twoFactorEnabled: response.twoFactorEnabled,
            },
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });

  return {
    requestEnable: requestEnableMutation.mutateAsync,
    confirmEnable: confirmEnableMutation.mutateAsync,
    disable2FA: disableMutation.mutateAsync,
    logout,
    isRequesting: requestEnableMutation.isPending,
    isConfirming: confirmEnableMutation.isPending,
    isDisabling: disableMutation.isPending,
    requestError: requestEnableMutation.error,
    confirmError: confirmEnableMutation.error,
    disableError: disableMutation.error,
    resetRequest: requestEnableMutation.reset,
    resetConfirm: confirmEnableMutation.reset,
    resetDisable: disableMutation.reset,
  };
}
