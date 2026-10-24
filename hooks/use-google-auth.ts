"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { UserProfileResponse } from "@/src/types/api";

export interface LinkGoogleDTO {
  code?: string;
  idToken?: string;
}

export function useGoogleAuth() {
  const queryClient = useQueryClient();

  const linkMutation = useMutation<UserProfileResponse, Error, LinkGoogleDTO | undefined>({
    mutationFn: async (dto) => {
      return await apiClient.post<UserProfileResponse>(
        "/api/auth/google/link",
        dto || {}
      );
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(
        ["user-profile"],
        (old: UserProfileResponse | undefined) =>
          old ? { ...old, ...updated } : updated
      );
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });

  const unlinkMutation = useMutation<UserProfileResponse, Error, void>({
    mutationFn: async () => {
      return await apiClient.delete<UserProfileResponse>("/api/auth/google/unlink");
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(
        ["user-profile"],
        (old: UserProfileResponse | undefined) =>
          old ? { ...old, ...updated } : updated
      );
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });

  return {
    linkGoogle: linkMutation.mutateAsync,
    unlinkGoogle: unlinkMutation.mutateAsync,
    isLinking: linkMutation.isPending,
    isUnlinking: unlinkMutation.isPending,
    linkError: linkMutation.error,
    unlinkError: unlinkMutation.error,
  };
}
