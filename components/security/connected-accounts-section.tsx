"use client"

import * as React from "react"
import { useGoogleLogin, useGoogleOAuth } from "@react-oauth/google"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useGoogleAuth } from "@/hooks/use-google-auth"
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Unlink,
  Link2,
  ShieldAlert,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface ConnectedAccountsSectionProps {
  googleLinked?: boolean
  googleEmail?: string
  googleLinkedAt?: string
  hasLocalPassword?: boolean
  onLink?: () => Promise<unknown>
  onUnlink?: () => Promise<unknown>
  isLinking?: boolean
  isUnlinking?: boolean
  className?: string
}

interface GoogleOAuthConnectButtonProps {
  isLinking: boolean
  onAuthorizeStart: () => void
  onAuthorizeEnd: () => void
  onTokenReceived: (token: string) => Promise<void>
  onError: (message: string) => void
}

function ConnectGoogleButtonView({
  isLinking,
  onClick,
}: {
  isLinking: boolean
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={isLinking}
      data-testid="link-google-button"
      className="w-full gap-1.5 text-xs sm:w-auto"
    >
      {isLinking ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Link2 className="size-3.5" />
      )}
      <span>Conectar Conta Google</span>
    </Button>
  )
}

/**
 * Isolates Google OAuth hooks so tests injecting `onLink` can mount without GoogleOAuthProvider.
 */
function GoogleOAuthConnectButton({
  isLinking,
  onAuthorizeStart,
  onAuthorizeEnd,
  onTokenReceived,
  onError,
}: GoogleOAuthConnectButtonProps) {
  const { scriptLoadedSuccessfully } = useGoogleOAuth()

  const triggerGooglePopup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (!tokenResponse?.access_token) {
        onAuthorizeEnd()
        onError("Não foi possível obter a credencial da conta Google.")
        return
      }
      try {
        await onTokenReceived(tokenResponse.access_token)
      } finally {
        onAuthorizeEnd()
      }
    },
    onError: (errorResponse) => {
      onAuthorizeEnd()
      onError(
        errorResponse?.error_description ||
          "Falha ao autorizar conexão com o Google."
      )
    },
    onNonOAuthError: (nonOAuthError) => {
      onAuthorizeEnd()
      if (nonOAuthError.type === "popup_failed_to_open") {
        onError(
          "O navegador bloqueou a janela popup do Google. Permita popups para este site e tente novamente."
        )
      } else if (nonOAuthError.type === "popup_closed") {
        onError("Conexão com o Google cancelada antes da conclusão.")
      } else {
        onError("Não foi possível concluir a autenticação com o Google.")
      }
    },
  })

  const handleClick = () => {
    if (!scriptLoadedSuccessfully) {
      onError(
        "Serviço de autenticação do Google ainda está carregando ou foi bloqueado. Aguarde um instante e tente novamente."
      )
      return
    }
    onAuthorizeStart()
    triggerGooglePopup()
  }

  return <ConnectGoogleButtonView isLinking={isLinking} onClick={handleClick} />
}

export function ConnectedAccountsSection({
  googleLinked = false,
  googleEmail,
  googleLinkedAt,
  hasLocalPassword = true,
  onLink,
  onUnlink,
  isLinking: propIsLinking,
  isUnlinking: propIsUnlinking,
  className,
}: ConnectedAccountsSectionProps) {
  const hook = useGoogleAuth()
  const unlinkAction = onUnlink || hook.unlinkGoogle
  const [isAuthorizingGoogle, setIsAuthorizingGoogle] = React.useState(false)
  const isLinking = propIsLinking ?? (hook.isLinking || isAuthorizingGoogle)
  const isUnlinking = propIsUnlinking ?? hook.isUnlinking

  const [blockedDialogOpen, setBlockedDialogOpen] = React.useState(false)
  const [confirmUnlinkDialogOpen, setConfirmUnlinkDialogOpen] =
    React.useState(false)
  const [feedbackError, setFeedbackError] = React.useState<string | null>(null)

  const handleUnlinkClick = () => {
    setFeedbackError(null)
    if (!hasLocalPassword) {
      setBlockedDialogOpen(true)
    } else {
      setConfirmUnlinkDialogOpen(true)
    }
  }

  const handleConfirmUnlink = async () => {
    setFeedbackError(null)
    try {
      await unlinkAction()
      setConfirmUnlinkDialogOpen(false)
    } catch (err: unknown) {
      setFeedbackError(
        err instanceof Error ? err.message : "Erro ao desvincular conta Google"
      )
    }
  }

  const handleLinkClick = async () => {
    if (!onLink) return
    setFeedbackError(null)
    try {
      await onLink()
    } catch (err: unknown) {
      setFeedbackError(
        err instanceof Error ? err.message : "Erro ao vincular conta Google"
      )
    }
  }

  const handleGoogleTokenReceived = async (token: string) => {
    setFeedbackError(null)
    try {
      await hook.linkGoogle({ idToken: token })
    } catch (err: unknown) {
      setFeedbackError(
        err instanceof Error ? err.message : "Erro ao vincular conta Google"
      )
    }
  }

  const formattedLinkedAt = React.useMemo(() => {
    if (!googleLinkedAt) return null
    try {
      return new Date(googleLinkedAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    } catch {
      return null
    }
  }, [googleLinkedAt])

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="size-5 text-primary" />
          <span>Contas Conectadas & Identidade Externa</span>
        </CardTitle>
        <CardDescription>
          Vincule serviços externos para agilizar o login ou use como método de
          autenticação secundário.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedbackError && (
          <div
            data-testid="google-auth-error"
            className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive"
          >
            <AlertTriangle className="size-4 shrink-0" />
            <span>{feedbackError}</span>
          </div>
        )}

        {/* Linha Google */}
        <div className="flex flex-col justify-between gap-4 rounded-lg border border-border/70 bg-card/50 p-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3.5 sm:items-center">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-sm font-bold">
              {/* Ícone de Google SVG */}
              <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  Google
                </span>
                {googleLinked ? (
                  <Badge
                    variant="default"
                    className="gap-1 border border-emerald-500/20 bg-emerald-500/10 text-[11px] text-emerald-600 dark:text-emerald-400"
                  >
                    <CheckCircle2 className="size-3" />
                    <span>Conectado</span>
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[11px]">
                    Não vinculado
                  </Badge>
                )}
              </div>

              {googleLinked ? (
                <p className="text-xs text-muted-foreground">
                  Vinculado a{" "}
                  <strong className="text-foreground">
                    {googleEmail || "sua conta Google"}
                  </strong>
                  {formattedLinkedAt && ` desde ${formattedLinkedAt}`}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Use sua conta Google para entrar sem precisar digitar a senha.
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0 sm:self-center">
            {googleLinked ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUnlinkClick}
                disabled={isUnlinking}
                data-testid="unlink-google-button"
                className="w-full gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
              >
                {isUnlinking ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Unlink className="size-3.5" />
                )}
                <span>Desvincular Google</span>
              </Button>
            ) : onLink ? (
              <ConnectGoogleButtonView
                isLinking={isLinking}
                onClick={handleLinkClick}
              />
            ) : (
              <GoogleOAuthConnectButton
                isLinking={isLinking}
                onAuthorizeStart={() => {
                  setFeedbackError(null)
                  setIsAuthorizingGoogle(true)
                }}
                onAuthorizeEnd={() => setIsAuthorizingGoogle(false)}
                onTokenReceived={handleGoogleTokenReceived}
                onError={(message) => setFeedbackError(message)}
              />
            )}
          </div>
        </div>
      </CardContent>

      {/* Diálogo de Bloqueio se não possui senha local cadastrada */}
      <Dialog open={blockedDialogOpen} onOpenChange={setBlockedDialogOpen}>
        <DialogContent
          data-testid="unlink-blocked-dialog"
          onClose={() => setBlockedDialogOpen(false)}
        >
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="size-6" />
            </div>
            <DialogTitle className="text-center text-lg font-bold">
              Desvinculação Bloqueada
            </DialogTitle>
            <DialogDescription className="pt-2 text-center text-sm text-muted-foreground">
              A conta Google é atualmente sua{" "}
              <strong>única forma de acesso</strong> à plataforma, e você ainda
              não configurou uma senha local. Para sua proteção e para evitar a
              perda de acesso à sua conta, cadastre uma senha antes de
              desvincular o Google.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              onClick={() => setBlockedDialogOpen(false)}
              data-testid="close-blocked-dialog-button"
            >
              Compreendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmação de Desvinculação */}
      <Dialog
        open={confirmUnlinkDialogOpen}
        onOpenChange={setConfirmUnlinkDialogOpen}
      >
        <DialogContent
          data-testid="unlink-confirm-dialog"
          onClose={() => setConfirmUnlinkDialogOpen(false)}
        >
          <DialogHeader>
            <DialogTitle>Desvincular conta Google?</DialogTitle>
            <DialogDescription>
              Você não poderá mais usar o login rápido do Google para acessar a
              plataforma com este e-mail. Para entrar, será necessário utilizar
              sua senha cadastrada.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmUnlinkDialogOpen(false)}
              disabled={isUnlinking}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmUnlink}
              disabled={isUnlinking}
              data-testid="confirm-unlink-button"
              className="gap-2"
            >
              {isUnlinking && <Loader2 className="size-4 animate-spin" />}
              <span>Sim, desvincular</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
