"use client";

import * as React from "react";
import { Edit2, ArrowDownRight, ArrowUpRight, Inbox, Loader2 } from "lucide-react";
import { Transaction } from "@/src/types/api";
import { formatCurrencyBRL, formatDateBR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface TransactionTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onEdit?: (transaction: Transaction) => void;
}

export function TransactionTable({
  transactions,
  isLoading = false,
  onEdit,
}: TransactionTableProps) {
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
                    <Badge
                      variant={tx.category === "Não Categorizado" ? "outline" : "secondary"}
                      className="text-xs"
                    >
                      {tx.category}
                    </Badge>
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
