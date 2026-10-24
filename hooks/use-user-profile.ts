"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, apiRequest } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import type {
  UserProfileResponse,
  UpdateFinancialProfileDTO,
  UpdateUserProfileDTO,
} from "@/src/types/api";

export function useUserProfile() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery<UserProfileResponse, Error>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      return await apiClient.get<UserProfileResponse>("/api/user/profile");
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const updateNameMutation = useMutation<
    UserProfileResponse,
    Error,
    string | UpdateUserProfileDTO
  >({
    mutationFn: async (payload) => {
      const data: UpdateUserProfileDTO =
        typeof payload === "string" ? { name: payload } : payload;
      return await apiClient.patch<UserProfileResponse>("/api/user/profile", data);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["user-profile"], (old: UserProfileResponse | undefined) =>
        old ? { ...old, ...updated } : updated
      );
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });

  const uploadAvatarMutation = useMutation<
    UserProfileResponse | { avatarUrl: string },
    Error,
    File
  >({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return await apiRequest<UserProfileResponse | { avatarUrl: string }>(
        "/api/user/avatar",
        {
          method: "POST",
          body: formData,
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });

  const deleteAvatarMutation = useMutation<
    UserProfileResponse | { success: boolean },
    Error,
    void
  >({
    mutationFn: async () => {
      return await apiClient.delete<UserProfileResponse | { success: boolean }>(
        "/api/user/avatar"
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });

  const updateIdentityMutation = useMutation<
    UserProfileResponse,
    Error,
    { name?: string; avatarFile?: File | null; removeAvatar?: boolean }
  >({
    mutationFn: async ({ name, avatarFile, removeAvatar }) => {
      if (removeAvatar) {
        await apiClient.delete<UserProfileResponse | { success: boolean }>(
          "/api/user/avatar"
        );
      } else if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        await apiRequest<UserProfileResponse | { avatarUrl: string }>(
          "/api/user/avatar",
          {
            method: "POST",
            body: formData,
          }
        );
      }

      let updatedProfile: UserProfileResponse | undefined;
      if (name !== undefined) {
        updatedProfile = await apiClient.patch<UserProfileResponse>(
          "/api/user/profile",
          { name }
        );
      }

      const finalProfile =
        updatedProfile ??
        (await apiClient.get<UserProfileResponse>("/api/user/profile"));
      return finalProfile;
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
    ...query,
    updateName: updateNameMutation.mutateAsync,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    deleteAvatar: deleteAvatarMutation.mutateAsync,
    updateIdentity: updateIdentityMutation.mutateAsync,
    isUpdatingName: updateNameMutation.isPending,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    isDeletingAvatar: deleteAvatarMutation.isPending,
    isUpdatingIdentity: updateIdentityMutation.isPending,
  };
}

export function useUpdateFinancialProfile() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    UserProfileResponse,
    Error,
    UpdateFinancialProfileDTO
  >({
    mutationFn: async (data: UpdateFinancialProfileDTO) => {
      return await apiClient.put<UserProfileResponse>("/api/user/profile", data);
    },
    onSuccess: (updatedProfile) => {
      // Atualiza o cache local imediatamente
      queryClient.setQueryData(["user-profile"], updatedProfile);

      // Invalida o cache de perfil
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });

      // Invalida o cache de análises financeiras da IA (recalibra recomendações)
      queryClient.invalidateQueries({ queryKey: ["financial-analysis"] });
    },
  });

  return {
    updateProfile: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}
