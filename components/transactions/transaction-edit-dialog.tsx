"use client";

import * as React from "react";
import { Loader2, Info } from "lucide-react";
import { Transaction, Category, CANONICAL_CATEGORIES, UpdateTransactionDTO } from "@/src/types/api";
import { formatCurrencyBRL } from "@/lib/formatters";
import { updateTransactionSchema } from "@/lib/validations/transaction";
import { useAccounts } from "@/hooks/use-accounts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface TransactionEditDialogProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSave: (data: UpdateTransactionDTO) => void;
  isSaving?: boolean;
}

interface TransactionEditFormProps {
  transaction: Transaction;
  onClose: () => void;
  onSave: (data: UpdateTransactionDTO) => void;
  isSaving: boolean;
}

function TransactionEditForm({
  transaction,
  onClose,
  onSave,
  isSaving,
}: TransactionEditFormProps) {
  const [cleanDescription, setCleanDescription] = React.useState(
    transaction.cleanDescription || transaction.rawDescription
  );
  const [category, setCategory] = React.useState<Category>(transaction.category);
  const [accountId, setAccountId] = React.useState<string>(
    transaction.accountId || transaction.account?.id || ""
  );
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const { accounts } = useAccounts();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanAccountId = accountId.trim() ? accountId.trim() : null;

    const parsed = updateTransactionSchema.safeParse({
      cleanDescription,
      category,
      accountId: cleanAccountId,
    });

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      setValidationError(firstIssue ? firstIssue.message : "Dados inválidos");
      return;
    }

    onSave({
      cleanDescription: cleanDescription.trim(),
      category,
      accountId: cleanAccountId,
    });
  };

  return (
    <>
      {/* Painel de Auditoria e Referência Original */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
        <div className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
          <Info className="size-3.5" />
          <span>Referência de Auditoria Bancária</span>
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex justify-between">
            <span className="text-zinc-500">Descrição original:</span>
            <span className="font-mono text-zinc-900 dark:text-zinc-100 font-medium truncate max-w-[220px]">
              {transaction.rawDescription || "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Valor registrado:</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {formatCurrencyBRL(transaction.amount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Origem:</span>
            <span className="font-medium">{transaction.source}</span>
          </div>
        </div>
      </div>

      {/* Formulário de Edição */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="edit-clean-description"
            className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
          >
            Descrição Amigável
          </label>
          <input
            id="edit-clean-description"
            type="text"
            value={cleanDescription}
            onChange={(e) => setCleanDescription(e.target.value)}
            placeholder="Ex: Supermercado Semanal"
            disabled={isSaving}
            className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="edit-category"
            className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
          >
            Categoria Canônica
          </label>
          <select
            id="edit-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            disabled={isSaving}
            className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            {CANONICAL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="edit-account"
            className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
          >
            Conta Bancária
          </label>
          <select
            id="edit-account"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            disabled={isSaving}
            className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="">Nenhuma conta vinculada</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.institution})
              </option>
            ))}
          </select>
        </div>

        {validationError && (
          <p className="text-xs text-rose-600 dark:text-rose-400">
            {validationError}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function TransactionEditDialog({
  isOpen,
  transaction,
  onClose,
  onSave,
  isSaving = false,
}: TransactionEditDialogProps) {
  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent onClose={onClose} className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
          <DialogDescription>
            Ajuste a descrição limpa e a categoria canônica desta movimentação.
          </DialogDescription>
        </DialogHeader>

        <TransactionEditForm
          key={transaction.id}
          transaction={transaction}
          onClose={onClose}
          onSave={onSave}
          isSaving={isSaving}
        />
      </DialogContent>
    </Dialog>
  );
}
