"use client"

import * as React from "react"
import { BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  type BarChartCategory,
} from "@/components/ui/tremor/bar-chart"
import type { FinancialMetrics } from "@/src/types/api"
import { useTransactions } from "@/hooks/use-transactions"
import {
  buildPeriodCashflowSeries,
  hasInvoiceSettlementsInCashflow,
} from "@/lib/dashboard-charts"
import { cn } from "@/lib/utils"

export interface PeriodCashflowCardProps {
  metrics: FinancialMetrics | null | undefined
  month: string
  isLoading?: boolean
  className?: string
}

/**
 * Card analítico independente exibindo o comparativo de entradas, despesas
 * primárias e quitação de faturas no mês selecionado.
 */
export function PeriodCashflowCard({
  metrics,
  month,
  isLoading = false,
  className,
}: PeriodCashflowCardProps) {
  const { transactions, isLoading: isTransactionsLoading } = useTransactions({
    month,
  })

  const cashflowSeries = React.useMemo(
    () => buildPeriodCashflowSeries(transactions, metrics ?? undefined, month),
    [transactions, metrics, month]
  )

  const cashflowCategories = React.useMemo<BarChartCategory[]>(() => {
    const base: BarChartCategory[] = [
      { key: "receitas", label: "Receitas", color: "emerald" },
      { key: "despesas", label: "Despesas", color: "rose" },
    ]
    if (hasInvoiceSettlementsInCashflow(cashflowSeries)) {
      base.push({
        key: "faturas",
        label: "Faturas",
        color: "slate",
      })
    }
    return base
  }, [cashflowSeries])

  const isCashflowLoading = isLoading || isTransactionsLoading

  return (
    <Card
      data-testid="period-cashflow-card"
      className={cn("min-w-0", className)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Fluxo do Período
        </CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Comparativo de entradas, despesas primárias e quitação de faturas
        </p>
      </CardHeader>

      <CardContent>
        {isCashflowLoading ? (
          <div
            data-testid="cashflow-chart-loading"
            className="flex h-[240px] animate-pulse items-end gap-3 rounded-lg bg-muted/30 p-6"
          >
            <div className="h-28 flex-1 rounded bg-muted" />
            <div className="h-44 flex-1 rounded bg-muted" />
            <div className="h-20 flex-1 rounded bg-muted" />
            <div className="h-36 flex-1 rounded bg-muted" />
          </div>
        ) : cashflowSeries.length === 0 ? (
          <div
            data-testid="cashflow-chart-empty"
            className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground"
          >
            <div className="mb-3 rounded-full bg-muted/60 p-3">
              <BarChart3 className="size-7 text-muted-foreground/70" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Sem movimentações para o fluxo do período
            </p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Quando receitas ou despesas forem registradas neste mês, o
              comparativo do período aparecerá aqui.
            </p>
          </div>
        ) : (
          <BarChart
            data={cashflowSeries}
            index="label"
            categories={cashflowCategories}
            height={240}
            ariaLabel="Gráfico de barras do fluxo financeiro no período"
          />
        )}
      </CardContent>
    </Card>
  )
}
