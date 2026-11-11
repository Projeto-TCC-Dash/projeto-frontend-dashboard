"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api-client"
import type { GoogleAuthResponse } from "@/src/types/api"

export function useGoogleLogin() {
  const router = useRouter()
  const { setSession } = useAuth()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)

  const loginWithGoogle = React.useCallback(
    async (idToken: string): Promise<GoogleAuthResponse> => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await apiClient.post<GoogleAuthResponse>(
          "/api/auth/google",
          {
            idToken,
          }
        )

        setSession(data.token, data.user)

        if (!data.user.hasAiKey) {
          router.push("/onboarding")
        } else {
          router.push("/")
        }

        return data
      } catch (err: unknown) {
        let message =
          "Não foi possível autenticar com o Google. Tente novamente."

        if (err instanceof Error) {
          if (
            err.message.includes("Nenhuma conta vinculada") ||
            err.message.includes("401") ||
            err.message.includes("404")
          ) {
            message =
              "Nenhuma conta vinculada a este perfil Google. Faça login com seu e-mail e senha tradicionais e conecte sua conta Google na aba Configurações > Segurança."
          } else {
            message = err.message
          }
        }

        setError(message)
        throw new Error(message)
      } finally {
        setIsLoading(false)
      }
    },
    [router, setSession]
  )

  return {
    loginWithGoogle,
    isLoading,
    error,
    setError,
    clearError: () => setError(null),
  }
}
