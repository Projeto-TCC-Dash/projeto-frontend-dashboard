"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import type {
  UserProfileResponse,
  UpdateFinancialProfileDTO,
} from "@/src/types/api";

export function useUserProfile() {
  const { isAuthenticated } = useAuth();

  return useQuery<UserProfileResponse, Error>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      return await apiClient.get<UserProfileResponse>("/api/user/profile");
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
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
