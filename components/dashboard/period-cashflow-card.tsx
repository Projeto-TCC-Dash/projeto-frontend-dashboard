"use client"

import * as React from "react"
import { BarChart3 } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  type BarChartCategory,
} from "@/components/ui/tremor/bar-chart"
import type { FinancialMetrics } from "@/src/types/api"
import type {
  CumulativeDailyCashflowPoint,
  PeriodCashflowViewMode,
} from "@/src/types/charts"
import { useTransactions } from "@/hooks/use-transactions"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"
import {
  buildCumulativeDailyCashflowSeries,
  buildPeriodCashflowSeries,
  hasInvoiceSettlementsInCashflow,
} from "@/lib/dashboard-charts"
import { formatCompactCurrencyBRL } from "@/lib/chart-utils"
import { formatCurrencyBRL } from "@/lib/formatters"
import { cn } from "@/lib/utils"

export interface PeriodCashflowCardProps {
  metrics: FinancialMetrics | null | undefined
  month: string
  isLoading?: boolean
  initialViewMode?: PeriodCashflowViewMode
  className?: string
}

function CumulativeCashflowTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: ReadonlyArray<{
    payload?: CumulativeDailyCashflowPoint
  }>
}) {
  if (!active || !payload || payload.length === 0) return null
  const point = payload[0]?.payload
  if (!point) return null

  const isNetPositive = point.dailyNet >= 0

  return (
    <div className="min-w-[12rem] rounded-lg border border-border bg-popover/95 p-2.5 text-xs shadow-md backdrop-blur-sm">
      <p className="mb-1 border-b border-border/60 pb-1 font-semibold text-popover-foreground">
        {point.label} ({point.isoDate})
      </p>

      <div className="space-y-1 tabular-nums">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Movimento do dia:</span>
          <span
            className={cn(
              "font-semibold",
              isNetPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            )}
          >
            {(isNetPositive ? "+" : "") + formatCurrencyBRL(point.dailyNet)}
          </span>
        </div>

        <div className="mt-1 border-t border-border/40 pt-1 flex items-center justify-between gap-4">
          <span className="font-medium text-foreground">Saldo no mês:</span>
          <span
            className={cn(
              "font-bold",
              point.cumulativeBalance >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            )}
          >
            {formatCurrencyBRL(point.cumulativeBalance)}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Card analítico independente exibindo o comparativo de entradas, despesas
 * primárias e quitação de faturas no mês selecionado, com alternador
 * entre visualização diária e curva de saldo acumulado.
 */
export function PeriodCashflowCard({
  metrics,
  month,
  isLoading = false,
  initialViewMode = "daily",
  className,
}: PeriodCashflowCardProps) {
  const [viewMode, setViewMode] =
    React.useState<PeriodCashflowViewMode>(initialViewMode)
  const prefersReducedMotion = usePrefersReducedMotion()

  const { transactions, isLoading: isTransactionsLoading } = useTransactions({
    month,
  })

  const cashflowSeries = React.useMemo(
    () => buildPeriodCashflowSeries(transactions, metrics ?? undefined, month),
    [transactions, metrics, month]
  )

  const cumulativeSeries = React.useMemo(
    () =>
      buildCumulativeDailyCashflowSeries(
        transactions,
        metrics ?? undefined,
        month
      ),
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="min-w-0 space-y-0.5">
          <CardTitle className="text-base font-semibold">
            Fluxo do Período
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Comparativo de entradas, despesas primárias e quitação de faturas
          </p>
        </div>

        {/* Alternador de Modo: Diário vs Acumulado */}
        <div
          data-testid="cashflow-view-mode-toggle"
          className="inline-flex shrink-0 items-center rounded-lg border border-border bg-muted/40 p-0.5"
        >
          <button
            type="button"
            data-testid="view-mode-daily"
            aria-pressed={viewMode === "daily"}
            onClick={() => setViewMode("daily")}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
              viewMode === "daily"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Diário
          </button>
          <button
            type="button"
            data-testid="view-mode-cumulative"
            aria-pressed={viewMode === "cumulative"}
            onClick={() => setViewMode("cumulative")}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
              viewMode === "cumulative"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Acumulado
          </button>
        </div>
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
        ) : viewMode === "cumulative" ? (
          <div
            data-testid="cumulative-cashflow-area-chart"
            className="w-full"
            style={{ height: 240 }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={200}
              minHeight={240}
              initialDimension={{ width: 460, height: 240 }}
            >
              <AreaChart
                data={[...cumulativeSeries]}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="cashflowCumulativeGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-border/60"
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tick={{ fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={72}
                  fontSize={11}
                  tickFormatter={formatCompactCurrencyBRL}
                  tick={{ fill: "var(--muted-foreground)" }}
                />
                <ReferenceLine
                  y={0}
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                />
                <Tooltip content={<CumulativeCashflowTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cumulativeBalance"
                  name="Saldo no Mês"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#cashflowCumulativeGrad)"
                  isAnimationActive={!prefersReducedMotion}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <BarChart
            data={cashflowSeries}
            index="label"
            categories={cashflowCategories}
            height={240}
            maxBarSize={28}
            ariaLabel="Gráfico de barras do fluxo financeiro no período"
          />
        )}
      </CardContent>
    </Card>
  )
}

