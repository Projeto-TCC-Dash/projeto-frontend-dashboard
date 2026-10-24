"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Loader2, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrencyBRL, formatDateBR } from "@/lib/formatters";
import type { Transaction } from "@/src/types/api";

export interface TransactionDeleteDialogProps {
  isOpen: boolean;
  transaction?: Transaction | null;
  onClose: () => void;
  onConfirm: (transactionId: string) => Promise<void>;
  isDeleting?: boolean;
}

const emptySubscribe = () => () => {};

export function TransactionDeleteDialog({
  isOpen,
  transaction,
  onClose,
  onConfirm,
  isDeleting = false,
}: TransactionDeleteDialogProps) {
  const mounted = React.useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleClose = React.useCallback(() => {
    if (isDeleting) return;
    setErrorMsg(null);
    onClose();
  }, [isDeleting, onClose]);

  // Tecla Escape para fechar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, isDeleting, handleClose]);

  if (!isOpen || !mounted || !transaction) return null;

  const handleDelete = async () => {
    setErrorMsg(null);
    try {
      await onConfirm(transaction.id);
      setErrorMsg(null);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Ocorreu um erro ao excluir a transação. Tente novamente.");
      }
    }
  };

  const isIncome = transaction.amount > 0;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-transaction-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          handleClose();
        }
      }}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 sm:p-7 animate-in zoom-in-95 duration-200">
        {/* Botão fechar */}
        <button
          type="button"
          aria-label="Fechar"
          onClick={handleClose}
          disabled={isDeleting}
          className="absolute right-4 top-4 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
            <Trash2 className="h-6 w-6" />
          </div>
          <div className="flex-1 pr-6">
            <h2
              id="delete-transaction-title"
              className="text-lg font-bold text-zinc-900 dark:text-zinc-100"
            >
              Excluir Transação
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Esta ação é permanente e não poderá ser desfeita.
            </p>
          </div>
        </div>

        {/* Card com detalhes da transação */}
        <div className="mt-5 rounded-xl border border-zinc-100 bg-zinc-50/75 p-4 dark:border-zinc-850 dark:bg-zinc-900/40">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="block truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {transaction.cleanDescription || transaction.rawDescription}
              </span>
              <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                {formatDateBR(transaction.date)} • {transaction.category}
              </span>
            </div>
            <span
              className={`shrink-0 text-sm font-bold ${
                isIncome
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-900 dark:text-zinc-100"
              }`}
            >
              {formatCurrencyBRL(transaction.amount)}
            </span>
          </div>
        </div>

        {/* Alerta de erro */}
        {errorMsg && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {/* Rodapé de Ações */}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="w-full sm:w-auto text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Confirmar Exclusão"
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
