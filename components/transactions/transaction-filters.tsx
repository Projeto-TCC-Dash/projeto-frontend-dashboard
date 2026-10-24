"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { CANONICAL_CATEGORIES, TRANSACTION_SOURCES, Category, TransactionSource } from "@/src/types/api";
import { shiftYearMonth } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { useAccounts } from "@/hooks/use-accounts";

export interface TransactionFiltersProps {
  month: string;
  category?: Category;
  source?: TransactionSource;
  accountId?: string;
  onFilterChange: (filters: {
    month: string;
    category?: Category;
    source?: TransactionSource;
    accountId?: string;
  }) => void;
}

export function TransactionFilters({
  month,
  category,
  source,
  accountId,
  onFilterChange,
}: TransactionFiltersProps) {
  const { accounts } = useAccounts();

  const handlePrevMonth = () => {
    onFilterChange({
      month: shiftYearMonth(month, -1),
      category,
      source,
      accountId,
    });
  };

  const handleNextMonth = () => {
    onFilterChange({
      month: shiftYearMonth(month, 1),
      category,
      source,
      accountId,
    });
  };

  const handleMonthInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onFilterChange({
        month: e.target.value,
        category,
        source,
        accountId,
      });
    }
  };

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onFilterChange({
      month,
      category: val ? (val as Category) : undefined,
      source,
      accountId,
    });
  };

  const handleSourceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onFilterChange({
      month,
      category,
      source: val ? (val as TransactionSource) : undefined,
      accountId,
    });
  };

  const handleAccountSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onFilterChange({
      month,
      category,
      source,
      accountId: val ? val : undefined,
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      month,
      category: undefined,
      source: undefined,
      accountId: undefined,
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-wrap items-end gap-3">
        {/* Seletor de Mês */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="filter-month"
            className="text-xs font-semibold text-zinc-600 dark:text-zinc-400"
          >
            Mês de Competência
          </label>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Mês anterior"
              onClick={handlePrevMonth}
              className="h-9 w-9 shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <input
              id="filter-month"
              type="month"
              value={month}
              onChange={handleMonthInput}
              aria-label="Mês de Competência"
              className="h-9 rounded-md border border-zinc-300 bg-white px-2.5 text-sm font-medium text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Próximo mês"
              onClick={handleNextMonth}
              className="h-9 w-9 shrink-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Dropdown de Categoria */}
        <div className="flex flex-col gap-1.5 min-w-[150px]">
          <label
            htmlFor="filter-category"
            className="text-xs font-semibold text-zinc-600 dark:text-zinc-400"
          >
            Categoria
          </label>
          <select
            id="filter-category"
            value={category ?? ""}
            onChange={handleCategorySelect}
            aria-label="Categoria"
            className="h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="">Todas as categorias</option>
            {CANONICAL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown de Origem */}
        <div className="flex flex-col gap-1.5 min-w-[120px]">
          <label
            htmlFor="filter-source"
            className="text-xs font-semibold text-zinc-600 dark:text-zinc-400"
          >
            Origem
          </label>
          <select
            id="filter-source"
            value={source ?? ""}
            onChange={handleSourceSelect}
            aria-label="Origem"
            className="h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="">Todas as origens</option>
            {TRANSACTION_SOURCES.map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown de Conta Bancária */}
        <div className="flex flex-col gap-1.5 min-w-[150px]">
          <label
            htmlFor="filter-account"
            className="text-xs font-semibold text-zinc-600 dark:text-zinc-400"
          >
            Conta Bancária
          </label>
          <select
            id="filter-account"
            value={accountId ?? ""}
            onChange={handleAccountSelect}
            aria-label="Conta Bancária"
            className="h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="">Todas as contas</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.institution})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botão limpar filtros caso algum esteja ativo */}
      {(category || source || accountId) && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <Filter className="mr-1.5 h-3.5 w-3.5" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
