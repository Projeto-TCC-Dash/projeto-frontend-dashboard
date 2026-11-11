"use client"

import * as React from "react"
import { GoogleLogin } from "@react-oauth/google"
import { useTheme } from "next-themes"
import { Loader2 } from "lucide-react"

export interface GoogleLoginButtonProps {
  onSuccess: (idToken: string) => void
  onError?: (errorMessage: string) => void
  disabled?: boolean
  isLoading?: boolean
  className?: string
}

export function GoogleLoginButton({
  onSuccess,
  onError,
  disabled = false,
  isLoading = false,
  className,
}: GoogleLoginButtonProps) {
  const { resolvedTheme } = useTheme()

  return (
    <div
      className={className}
      data-testid="google-login-button-container"
      style={{
        opacity: disabled || isLoading ? 0.6 : 1,
        pointerEvents: disabled || isLoading ? "none" : "auto",
      }}
    >
      {isLoading ? (
        <div
          data-testid="google-login-loading"
          className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-input bg-background text-sm font-medium text-foreground shadow-sm"
        >
          <Loader2 className="size-4 animate-spin text-primary" />
          <span>Conectando com o Google...</span>
        </div>
      ) : (
        <div className="flex w-full justify-center">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                onSuccess(credentialResponse.credential)
              } else {
                onError?.("Credencial do Google não retornada.")
              }
            }}
            onError={() => {
              onError?.(
                "Não foi possível autenticar com o Google. Tente novamente."
              )
            }}
            theme={resolvedTheme === "dark" ? "filled_black" : "outline"}
            shape="rectangular"
            text="signin_with"
            size="large"
            width="100%"
          />
        </div>
      )}
    </div>
  )
}
