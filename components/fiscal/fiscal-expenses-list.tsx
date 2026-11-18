"use client"

import * as React from "react"
import { Edit3, FileText, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { formatCurrencyBRL, formatDateBR } from "@/lib/formatters"
import {
  FISCAL_STATUS_LABELS,
  TAX_CATEGORY_LABELS,
  type FiscalVerificationStatus,
  type Transaction,
} from "@/src/types/api"

export interface FiscalExpensesListProps {
  transactions: readonly Transaction[]
  year: string
  isLoading?: boolean
  onEditTransaction: (transaction: Transaction) => void
}

type FilterMode = "ALL" | "DEDUCTIBLE" | "PENDING"

const STATUS_BADGE_VARIANT: Record<
  FiscalVerificationStatus,
  "success" | "warning" | "secondary"
> = {
  CONFIRMED: "success",
  PENDING: "warning",
  EXEMPT: "secondary",
}

export function FiscalExpensesList({
  transactions,
  year,
  isLoading = false,
  onEditTransaction,
}: FiscalExpensesListProps) {
  const [search, setSearch] = React.useState("")
  const [filterMode, setFilterMode] = React.useState<FilterMode>("ALL")

  const eligibleExpenses = React.useMemo(() => {
    const query = search.trim().toLowerCase()

    return transactions
      .filter((tx) => {
        if (
          tx.category === "Receita" ||
          tx.category === "Pagamento de Fatura"
        ) {
          return false
        }
        const txYear = tx.date.slice(0, 4)
        if (/^\d{4}$/.test(year) && txYear !== year) {
          return false
        }
        if (filterMode === "DEDUCTIBLE" && !tx.fiscal?.isTaxDeductible) {
          return false
        }
        if (
          filterMode === "PENDING" &&
          (!tx.fiscal?.isTaxDeductible || tx.fiscal.status !== "PENDING")
        ) {
          return false
        }
        if (query) {
          const descMatch = tx.cleanDescription.toLowerCase().includes(query)
          const providerMatch =
            tx.fiscal?.providerName?.toLowerCase().includes(query) ?? false
          const catMatch = tx.category.toLowerCase().includes(query)
          return descMatch || providerMatch || catMatch
        }
        return true
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, year, search, filterMode])

  return (
    <Card data-testid="fiscal-expenses-list">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            Despesas do Exercício ({year})
          </CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Classifique despesas elegíveis para dedução e acompanhe a
            comprovação documental.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-border/70 bg-muted/30 p-0.5">
            {(
              [
                { value: "ALL", label: "Todas" },
                { value: "DEDUCTIBLE", label: "Dedutíveis" },
                { value: "PENDING", label: "Pendentes" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFilterMode(opt.value)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  filterMode === opt.value
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label="Buscar despesas fiscais"
            placeholder="Buscar por descrição, prestador ou categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-muted/50"
              />
            ))}
          </div>
        ) : eligibleExpenses.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nenhuma despesa encontrada para os filtros selecionados em {year}.
          </div>
        ) : (
          <ul className="divide-y divide-border/60 rounded-lg border border-border/70">
            {eligibleExpenses.map((tx) => {
              const fiscal = tx.fiscal
              const isDeductible = Boolean(fiscal?.isTaxDeductible)
              const statusVariant = fiscal?.status
                ? STATUS_BADGE_VARIANT[fiscal.status]
                : "secondary"

              return (
                <li
                  key={tx.id}
                  className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-medium text-sm text-foreground">
                        {tx.cleanDescription}
                      </span>
                      {isDeductible && fiscal?.taxCategory ? (
                        <Badge variant="outline" className="text-[11px]">
                          {TAX_CATEGORY_LABELS[fiscal.taxCategory]}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[11px]">
                          {tx.category}
                        </Badge>
                      )}
                      {isDeductible && fiscal?.status && (
                        <Badge variant={statusVariant} className="text-[11px]">
                          {FISCAL_STATUS_LABELS[fiscal.status]}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span>{formatDateBR(tx.date)}</span>
                      {fiscal?.providerName && (
                        <span>Prestador: {fiscal.providerName}</span>
                      )}
                      {fiscal?.providerDocument && (
                        <span>Doc: {fiscal.providerDocument}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span className="text-sm font-semibold tabular-nums text-foreground">
                      {formatCurrencyBRL(
                        fiscal?.deductibleAmount ?? Math.abs(tx.amount)
                      )}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant={isDeductible ? "outline" : "secondary"}
                      onClick={() => onEditTransaction(tx)}
                    >
                      <Edit3 className="mr-1.5 size-3.5" />
                      {isDeductible ? "Editar Fiscal" : "Classificar IRPF"}
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
