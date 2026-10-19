"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import type { SetApiKeyResponse, SetAiKeyDTO, AiKeyOperationalStatus } from "@/src/types/api";

export function useAiKey() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuth();

  const [lastStatus, setLastStatus] = React.useState<AiKeyOperationalStatus>(() => {
    return user?.hasAiKey ? "ACTIVE_VERIFIED" : "NOT_CONFIGURED";
  });

  React.useEffect(() => {
    if (!user?.hasAiKey) {
      setLastStatus("NOT_CONFIGURED");
    }
  }, [user?.hasAiKey]);

  const mutation = useMutation<SetApiKeyResponse, Error, SetAiKeyDTO>({
    mutationFn: async ({ apiKey }) => {
      return await apiClient.put<SetApiKeyResponse>("/api/user/ai-key", { apiKey });
    },
    onSuccess: (data) => {
      const operationalStatus: AiKeyOperationalStatus =
        data.status === "ACTIVE_PROVISIONAL_DEMAND"
          ? "ACTIVE_PROVISIONAL_DEMAND"
          : "ACTIVE_VERIFIED";

      setLastStatus(operationalStatus);

      // Atualiza o estado global do usuário para hasAiKey: true
      updateUser({ hasAiKey: true });

      // Invalida o cache para manter dados sincronizados
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["ai-status"] });
    },
  });

  return {
    saveAndTestKey: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    status: lastStatus,
    setStatus: setLastStatus,
  };
}
