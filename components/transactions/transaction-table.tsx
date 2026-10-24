"use client";

import * as React from "react";
import { Edit2, Trash2, ArrowDownRight, ArrowUpRight, Inbox, Loader2 } from "lucide-react";
import { Transaction } from "@/src/types/api";
import { formatCurrencyBRL, formatDateBR } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { TransactionDeleteDialog } from "./transaction-delete-dialog";
import { useDeleteTransaction } from "@/hooks/use-delete-transaction";

export interface TransactionTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

export function getCategoryBadgeClass(category: string): string {
  switch (category) {
    case "Alimentação":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/50";
    case "Transporte":
      return "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800/50";
    case "Moradia":
      return "bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800/50";
    case "Saúde":
      return "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800/50";
    case "Lazer":
      return "bg-pink-100 text-pink-800 dark:bg-pink-950/50 dark:text-pink-300 border-pink-200 dark:border-pink-800/50";
    case "Educação":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50";
    case "Receita":
      return "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300 border-green-200 dark:border-green-800/50";
    case "Pagamento de Fatura":
      return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700";
    case "Investimentos":
      return "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800/50";
    case "Outros":
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700";
    case "Não Categorizado":
    default:
      return "bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300 border-orange-300 dark:border-orange-800/50";
  }
}

export function TransactionTable({
  transactions,
  isLoading = false,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  const [txToDelete, setTxToDelete] = React.useState<Transaction | null>(null);
  const { deleteTransaction, isDeleting } = useDeleteTransaction();

  const handleDeleteConfirm = async (id: string) => {
    await deleteTransaction(id);
  };
  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          Carregando transações...
        </p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500">
          <Inbox className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Nenhuma transação encontrada
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Não há lançamentos para o período ou filtros selecionados. Importe um extrato ou ajuste a busca.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50/75 text-xs font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
            <tr>
              <th scope="col" className="px-4 py-3 sm:px-6">Data</th>
              <th scope="col" className="px-4 py-3 sm:px-6">Descrição</th>
              <th scope="col" className="px-4 py-3 sm:px-6">Categoria</th>
              <th scope="col" className="px-4 py-3 sm:px-6">Conta</th>
              <th scope="col" className="px-4 py-3 sm:px-6">Origem</th>
              <th scope="col" className="px-4 py-3 text-right sm:px-6">Valor</th>
              <th scope="col" className="px-4 py-3 text-center sm:px-6">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {transactions.map((tx) => {
              const isIncome = tx.amount > 0;
              return (
                <tr
                  key={tx.id}
                  className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50"
                >
                  {/* Data */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs text-zinc-500 dark:text-zinc-400 sm:px-6">
                    {formatDateBR(tx.date)}
                  </td>

                  {/* Descrição */}
                  <td className="px-4 py-3.5 sm:px-6">
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {tx.cleanDescription || tx.rawDescription}
                      </span>
                      {tx.rawDescription && tx.rawDescription !== tx.cleanDescription && (
                        <span
                          className="truncate text-[11px] text-zinc-400 dark:text-zinc-500 max-w-xs"
                          title={tx.rawDescription}
                        >
                          {tx.rawDescription}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Categoria */}
                  <td className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getCategoryBadgeClass(
                        tx.category
                      )}`}
                    >
                      {tx.category}
                    </span>
                  </td>

                  {/* Conta */}
                  <td className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    {tx.account ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                        <span
                          className="size-2 rounded-full shrink-0"
                          style={{ backgroundColor: tx.account.color || "#64748B" }}
                          aria-hidden="true"
                        />
                        <span className="truncate max-w-[120px]">
                          {tx.account.name || tx.account.institution}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400 dark:text-zinc-600">—</span>
                    )}
                  </td>

                  {/* Origem */}
                  <td className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    <span className="inline-flex items-center rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {tx.source}
                    </span>
                  </td>

                  {/* Valor */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-right font-medium sm:px-6">
                    <span
                      className={`inline-flex items-center justify-end gap-1 ${
                        isIncome
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-zinc-900 dark:text-zinc-100"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />
                      )}
                      {formatCurrencyBRL(tx.amount)}
                    </span>
                  </td>

                  {/* Ações */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-center sm:px-6">
                    <div className="flex items-center justify-center gap-1">
                      {onEdit && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Editar transação"
                          onClick={() => onEdit(tx)}
                          className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Excluir transação"
                        onClick={() => {
                          if (onDelete) {
                            onDelete(tx);
                          } else {
                            setTxToDelete(tx);
                          }
                        }}
                        className="h-8 w-8 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <TransactionDeleteDialog
        isOpen={Boolean(txToDelete)}
        transaction={txToDelete}
        onClose={() => setTxToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
