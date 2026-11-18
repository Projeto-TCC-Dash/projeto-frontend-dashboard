"use client"

import * as React from "react"
import { Target, Settings2, AlertCircle, PlusCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProgressBar } from "@/components/ui/tremor/progress-bar"
import {
  formatCurrencyBRL,
  formatMonthYear,
  formatPercentage,
} from "@/lib/formatters"
import { BudgetFormDialog } from "./budget-form-dialog"
import type {
  BudgetConsumptionStatus,
  BudgetOverview,
  SetBudgetPlanDTO,
} from "@/src/types/api"
import type { TremorColor } from "@/src/types/charts"

export interface MonthlyBudgetCardProps {
  month: string
  budget: BudgetOverview | null
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  onSaveBudget: (data: SetBudgetPlanDTO) => Promise<unknown>
  isSaving?: boolean
}

const STATUS_STYLE: Record<
  BudgetConsumptionStatus,
  {
    color: TremorColor
    badgeVariant: "success" | "warning" | "destructive"
    label: string
  }
> = {
  REGULAR: {
    color: "emerald",
    badgeVariant: "success",
    label: "Regular (< 70%)",
  },
  WARNING: {
    color: "amber",
    badgeVariant: "warning",
    label: "Atenção (70–99%)",
  },
  EXCEEDED: {
    color: "rose",
    badgeVariant: "destructive",
    label: "Excedido (≥ 100%)",
  },
}

export function MonthlyBudgetCard({
  month,
  budget,
  isLoading = false,
  isError = false,
  onRetry,
  onSaveBudget,
  isSaving = false,
}: MonthlyBudgetCardProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false)

  if (isLoading) {
    return (
      <Card data-testid="monthly-budget-loading">
        <CardHeader className="pb-2">
          <div className="h-5 w-44 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card data-testid="monthly-budget-card">
        <CardHeader className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Target className="size-4 text-primary" />
              Orçamentos do Mês
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatMonthYear(month)} · Limites por categoria (sem dupla
              contagem de faturas)
            </p>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setDialogOpen(true)}
            data-testid="open-budget-dialog-btn"
            className="gap-1.5 self-start sm:self-auto"
          >
            {budget ? (
              <>
                <Settings2 className="size-3.5" />
                Ajustar Tetos
              </>
            ) : (
              <>
                <PlusCircle className="size-3.5" />
                Definir Orçamento
              </>
            )}
          </Button>
        </CardHeader>

        <CardContent>
          {isError ? (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>Não foi possível carregar o orçamento do mês.</span>
              </div>
              {onRetry && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                >
                  Tentar novamente
                </Button>
              )}
            </div>
          ) : !budget ? (
            <div
              data-testid="monthly-budget-empty"
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center"
            >
              <p className="text-sm font-medium text-foreground">
                Nenhum orçamento definido para {formatMonthYear(month)}
              </p>
              <p className="mt-1 max-w-md text-xs text-muted-foreground">
                Configure um teto global e limites por categoria para receber
                alertas visuais antes de estourar seus gastos.
              </p>
              <Button
                type="button"
                size="sm"
                className="mt-4 gap-1.5"
                onClick={() => setDialogOpen(true)}
              >
                <PlusCircle className="size-3.5" />
                Criar Planejamento de {formatMonthYear(month)}
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Resumo Global do Mês */}
              {(() => {
                const globalCfg = STATUS_STYLE[budget.globalStatus]
                return (
                  <div
                    data-testid="budget-global-summary"
                    className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-3.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs">
                        <span className="text-muted-foreground">
                          Consumo Global:{" "}
                        </span>
                        <span className="font-semibold tabular-nums text-foreground">
                          {formatCurrencyBRL(budget.totalSpentAmount)}
                        </span>
                        <span className="text-muted-foreground tabular-nums">
                          {" "}
                          de {formatCurrencyBRL(budget.totalLimitAmount)} (
                          {formatPercentage(budget.globalPercentConsumed)})
                        </span>
                      </div>
                      <Badge
                        data-testid="budget-global-status-badge"
                        variant={globalCfg.badgeVariant}
                      >
                        {globalCfg.label}
                      </Badge>
                    </div>
                    <ProgressBar
                      value={Math.min(100, budget.globalPercentConsumed)}
                      max={100}
                      color={globalCfg.color}
                      aria-label={`Consumo global do orçamento: ${formatPercentage(budget.globalPercentConsumed)}`}
                    />
                  </div>
                )
              })()}

              {/* Breakdown por Categoria */}
              <div className="space-y-3">
                {budget.categories.map((cat) => {
                  const cfg = STATUS_STYLE[cat.status]
                  return (
                    <div
                      key={cat.category}
                      data-testid={`budget-category-row-${cat.category}`}
                      className="space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {cat.category}
                          </span>
                          <Badge
                            variant={cfg.badgeVariant}
                            className="text-[10px] px-1.5 py-0"
                          >
                            {formatPercentage(cat.percentConsumed)}
                          </Badge>
                        </div>
                        <span className="tabular-nums text-muted-foreground">
                          <strong className="text-foreground">
                            {formatCurrencyBRL(cat.spentAmount)}
                          </strong>{" "}
                          / {formatCurrencyBRL(cat.limitAmount)}
                        </span>
                      </div>
                      <ProgressBar
                        value={Math.min(100, cat.percentConsumed)}
                        max={100}
                        color={cfg.color}
                        aria-label={`Orçamento de ${cat.category}: ${formatPercentage(cat.percentConsumed)}`}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <BudgetFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        month={month}
        existingBudget={budget}
        onSubmit={onSaveBudget}
        isSubmitting={isSaving}
      />
    </>
  )
}
