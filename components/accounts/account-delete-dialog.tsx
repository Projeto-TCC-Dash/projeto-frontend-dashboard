"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Account } from "@/src/types/api";

export interface AccountDeleteDialogProps {
  isOpen: boolean;
  account?: Account | null;
  onClose: () => void;
  onConfirm: (accountId: string, cascade: boolean) => Promise<void>;
  isDeleting?: boolean;
}

export function AccountDeleteDialog({
  isOpen,
  account,
  onClose,
  onConfirm,
  isDeleting = false,
}: AccountDeleteDialogProps) {
  const [mounted, setMounted] = React.useState(false);
  const [cascade, setCascade] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      setCascade(false);
      setErrorMsg(null);
    }
  }, [isOpen, account]);

  // Tecla Escape para fechar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !mounted || !account) return null;

  const handleDelete = async () => {
    setErrorMsg(null);
    try {
      await onConfirm(account.id, cascade);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Não foi possível excluir a conta. Tente novamente.");
      }
    }
  };

  const dialogContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-destructive/30 bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Excluir Conta Financeira
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Esta ação é permanente e não poderá ser desfeita.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="size-8 p-0 text-muted-foreground hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Mensagem principal */}
        <div className="mt-4 text-sm text-foreground space-y-2">
          <p>
            Tem certeza que deseja excluir a conta{" "}
            <strong className="text-foreground font-semibold">
              &quot;{account.name}&quot;
            </strong>
            ?
          </p>
          <p className="text-xs text-muted-foreground">
            O saldo desta conta deixará de compor seu patrimônio líquido consolidado.
          </p>
        </div>

        {/* Alerta de Erro Adaptativo */}
        {errorMsg && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
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
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={cascade}
              onChange={(e) => setCascade(e.target.value !== undefined ? e.target.checked : false)}
              disabled={isDeleting}
              className="size-4 mt-0.5 rounded border-input text-destructive focus:ring-destructive cursor-pointer"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground block">
                Excluir também todas as transações associadas a esta conta
              </span>
              <span className="text-[11px] text-muted-foreground block">
                Se desmarcado, a exclusão falhará caso a conta ainda possua transações vinculadas.
              </span>
            </div>
          </label>
        </div>

        {/* Ações */}
        <div className="mt-6 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="min-w-32"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Confirmar Exclusão"
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
}
