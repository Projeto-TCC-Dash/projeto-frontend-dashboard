"use client"

import * as React from "react"
import { CheckCircle2, Clock, FileCheck2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressBar } from "@/components/ui/tremor/progress-bar"
import { formatCurrencyBRL } from "@/lib/formatters"
import {
  TAX_CATEGORY_LABELS,
  type FiscalAnnualSummary,
} from "@/src/types/api"

export interface FiscalSummaryCardsProps {
  summary: FiscalAnnualSummary | null
  isLoading?: boolean
}

export function FiscalSummaryCards({
  summary,
  isLoading = false,
}: FiscalSummaryCardsProps) {
  if (isLoading) {
    return (
      <div
        data-testid="fiscal-summary-loading"
        className="space-y-4"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-32 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-7 w-28 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const totalDeductible = summary?.totalDeductibleExpenses ?? 0
  const confirmed = summary?.confirmedDeductibleExpenses ?? 0
  const pending = summary?.pendingDocumentationExpenses ?? 0
  const categories = summary?.byCategory ?? []

  return (
    <div data-testid="fiscal-summary-cards" className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Dedutível ({summary?.year ?? ""})
            </CardTitle>
            <div className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileCheck2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tracking-tight tabular-nums text-foreground">
              {formatCurrencyBRL(totalDeductible)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Base estimada de deduções para IRPF
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Comprovado Documentalmente
            </CardTitle>
            <div className="inline-flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatCurrencyBRL(confirmed)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Recibos validados ou isentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendente de Comprovação
            </CardTitle>
            <div className="inline-flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p
              className={
                pending > 0
                  ? "text-2xl font-bold tracking-tight tabular-nums text-amber-600 dark:text-amber-400"
                  : "text-2xl font-bold tracking-tight tabular-nums text-foreground"
              }
            >
              {formatCurrencyBRL(pending)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {pending > 0
                ? "Atenção: anexe recibos para evitar malha fina"
                : "Nenhuma pendência documental"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown por Categoria Fiscal */}
      {categories.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Deduções por Categoria Fiscal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.map((item) => {
              const pct =
                totalDeductible > 0
                  ? Math.round((item.totalAmount / totalDeductible) * 1000) / 10
                  : 0
              return (
                <div key={item.taxCategory} className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-foreground">
                      {TAX_CATEGORY_LABELS[item.taxCategory] ??
                        item.taxCategory}{" "}
                      <span className="text-muted-foreground">
                        ({item.count}{" "}
                        {item.count === 1 ? "lançamento" : "lançamentos"})
                      </span>
                    </span>
                    <div className="flex items-center gap-3 tabular-nums">
                      {item.pendingAmount > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400">
                          Pendente: {formatCurrencyBRL(item.pendingAmount)}
                        </span>
                      ) : null}
                      <span className="font-semibold text-foreground">
                        {formatCurrencyBRL(item.totalAmount)}
                      </span>
                    </div>
                  </div>
                  <ProgressBar
                    value={pct}
                    max={100}
                    color={item.pendingAmount > 0 ? "amber" : "emerald"}
                    aria-label={`${TAX_CATEGORY_LABELS[item.taxCategory] ?? item.taxCategory}: ${formatCurrencyBRL(item.totalAmount)}`}
                  />
                </div>
              )
            })}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
