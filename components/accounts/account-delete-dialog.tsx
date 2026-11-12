"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { AlertTriangle, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Account } from "@/src/types/api"

export interface AccountDeleteDialogProps {
  isOpen: boolean
  account?: Account | null
  onClose: () => void
  onConfirm: (accountId: string, cascade: boolean) => Promise<void>
  isDeleting?: boolean
}

export function AccountDeleteDialog({
  isOpen,
  account,
  onClose,
  onConfirm,
  isDeleting = false,
}: AccountDeleteDialogProps) {
  const [mounted, setMounted] = React.useState(false)
  const [cascade, setCascade] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (isOpen) {
      setCascade(false)
      setErrorMsg(null)
    }
  }, [isOpen, account])

  // Tecla Escape para fechar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, isDeleting, onClose])

  if (!isOpen || !mounted || !account) return null

  const handleDelete = async () => {
    setErrorMsg(null)
    try {
      await onConfirm(account.id, cascade)
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message)
      } else {
        setErrorMsg("Não foi possível excluir a conta. Tente novamente.")
      }
    }
  }

  const dialogContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-3 backdrop-blur-sm duration-200 fade-in sm:p-4"
    >
      <div
        className="relative max-h-[90dvh] w-full max-w-md animate-in overflow-y-auto rounded-2xl border border-destructive/30 bg-card p-4 shadow-2xl duration-200 zoom-in-95 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-foreground sm:text-lg">
                Excluir Conta Financeira
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Esta ação é permanente e não poderá ser desfeita.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="size-10 shrink-0 p-0 text-muted-foreground hover:text-foreground sm:size-8"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Mensagem principal */}
        <div className="mt-4 space-y-2 text-sm text-foreground">
          <p>
            Tem certeza que deseja excluir a conta{" "}
            <strong className="font-semibold text-foreground">
              &quot;{account.name}&quot;
            </strong>
            ?
          </p>
          <p className="text-xs text-muted-foreground">
            O saldo desta conta deixará de compor seu patrimônio líquido
            consolidado.
          </p>
        </div>

        {/* Alerta de Erro Adaptativo */}
        {errorMsg && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">Aviso de Exclusão</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Opção de Exclusão em Cascata */}
        <div
          className={cn(
            "mt-4 rounded-xl border p-3.5 transition-colors",
            errorMsg
              ? "border-destructive bg-destructive/5 ring-1 ring-destructive/40"
              : "border-border/80 bg-muted/30"
          )}
        >
          <label className="flex cursor-pointer items-start gap-3 select-none">
            <input
              type="checkbox"
              checked={cascade}
              onChange={(e) =>
                setCascade(
                  e.target.value !== undefined ? e.target.checked : false
                )
              }
              disabled={isDeleting}
              className="mt-0.5 size-4 cursor-pointer rounded border-input text-destructive focus:ring-destructive"
            />
            <div className="space-y-0.5">
              <span className="block text-xs font-semibold text-foreground">
                Excluir também todas as transações associadas a esta conta
              </span>
              <span className="block text-[11px] text-muted-foreground">
                Se desmarcado, a exclusão falhará caso a conta ainda possua
                transações vinculadas.
              </span>
            </div>
          </label>
        </div>

        {/* Ações */}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="min-h-10 w-full sm:min-h-9 sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="min-h-10 w-full sm:min-h-9 sm:w-auto sm:min-w-32"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Confirmar Exclusão"
            )}
          </Button>
        </div>
      </div>
    </div>
  )

  return createPortal(dialogContent, document.body)
}
