"use client"

import * as React from "react"
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { TrendingUp, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCurrencyBRL } from "@/lib/formatters"
import { formatCompactCurrencyBRL } from "@/lib/chart-utils"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"
import type {
  MultiMonthEvolutionPoint,
  MultiMonthHorizon,
} from "@/src/types/charts"

export interface MultiMonthEvolutionChartProps {
  data: readonly MultiMonthEvolutionPoint[]
  horizon: MultiMonthHorizon
  onHorizonChange: (horizon: MultiMonthHorizon) => void
  emergencyFundTarget?: number
  isLoading?: boolean
  height?: number
  className?: string
}

interface EvolutionTooltipProps {
  active?: boolean
  label?: string | number
  payload?: ReadonlyArray<{
    dataKey?: string | number
    name?: string | number
    value?: number | string
    color?: string
    payload?: MultiMonthEvolutionPoint
  }>
}

function MultiMonthEvolutionTooltip({
  active,
  label,
  payload,
}: EvolutionTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const point = payload[0]?.payload
  if (!point) return null

  const isNetPositive = point.netBalance >= 0

  return (
    <div className="min-w-[13rem] rounded-xl border border-border bg-popover/95 p-3 text-xs shadow-lg backdrop-blur-md">
      <div className="mb-2 border-b border-border/60 pb-1.5">
        <p className="font-semibold text-popover-foreground">{point.label}</p>
        <p className="text-[11px] text-muted-foreground">{point.month}</p>
      </div>

      <div className="space-y-1.5 tabular-nums">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-500" />
            Receitas
          </span>
          <span className="font-semibold text-popover-foreground">
            {formatCurrencyBRL(point.receitas)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 rounded-full bg-rose-500" />
            Despesas
          </span>
          <span className="font-semibold text-popover-foreground">
            {formatCurrencyBRL(point.despesas)}
          </span>
        </div>

        {point.faturas > 0 ? (
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-full bg-slate-500" />
              Faturas
            </span>
            <span className="font-semibold text-popover-foreground">
              {formatCurrencyBRL(point.faturas)}
            </span>
          </div>
        ) : null}

        <div className="my-1 border-t border-border/40 pt-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Resultado do Mês</span>
            <span
              className={cn(
                "font-bold",
                isNetPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              {(isNetPositive ? "+" : "") + formatCurrencyBRL(point.netBalance)}
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between gap-4">
            <span className="font-medium text-foreground">Saldo Acumulado</span>
            <span
              className={cn(
                "font-extrabold",
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
    </div>
  )
}

export function MultiMonthEvolutionChart({
  data,
  horizon,
  onHorizonChange,
  emergencyFundTarget,
  isLoading = false,
  height = 320,
  className,
}: MultiMonthEvolutionChartProps) {
  const prefersReducedMotion = usePrefersReducedMotion()

  const latestPoint = data.length > 0 ? data[data.length - 1] : null
  const cumulativeFinal = latestPoint?.cumulativeBalance ?? 0

  const horizonOptions: { label: string; value: MultiMonthHorizon }[] = [
    { label: "6 Meses", value: "6M" },
    { label: "12 Meses", value: "12M" },
    { label: "Tudo", value: "ALL" },
  ]

  return (
    <Card
      data-testid="multi-month-evolution-chart"
      className={cn("min-w-0 overflow-hidden", className)}
    >
      <CardHeader
        data-testid="multi-month-chart-header"
        className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base font-semibold text-foreground">
              Evolução Financeira Consolidada
            </CardTitle>
            {data.length > 0 ? (
              <Badge
                data-testid="period-growth-badge"
                variant={cumulativeFinal >= 0 ? "success" : "destructive"}
                className="gap-1 font-medium"
              >
                <TrendingUp className="size-3" />
                Saldo Acumulado: {formatCurrencyBRL(cumulativeFinal)}
              </Badge>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            Comparativo de receitas, despesas e a curva contínua de crescimento
            do patrimônio
          </p>
        </div>

        {/* Seletor de Horizonte */}
        <div
          data-testid="horizon-selector"
          className="inline-flex shrink-0 items-center rounded-lg border border-border bg-muted/40 p-0.5"
        >
          {horizonOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              data-testid={`horizon-btn-${opt.value}`}
              aria-pressed={horizon === opt.value}
              onClick={() => onHorizonChange(opt.value)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                horizon === opt.value
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div
            data-testid="multi-month-chart-loading"
            className="flex h-[320px] animate-pulse items-end gap-4 rounded-lg bg-muted/30 p-6"
          >
            <div className="h-24 flex-1 rounded bg-muted" />
            <div className="h-44 flex-1 rounded bg-muted" />
            <div className="h-32 flex-1 rounded bg-muted" />
            <div className="h-56 flex-1 rounded bg-muted" />
            <div className="h-48 flex-1 rounded bg-muted" />
            <div className="h-64 flex-1 rounded bg-muted" />
          </div>
        ) : data.length === 0 ? (
          <div
            data-testid="multi-month-chart-empty"
            className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground"
          >
            <div className="mb-3 rounded-full bg-muted/60 p-3">
              <BarChart3 className="size-7 text-muted-foreground/70" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Sem histórico de movimentações no período
            </p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Importe seus extratos ou registre transações em múltiplos meses para
              visualizar a trajetória de crescimento do seu saldo.
            </p>
          </div>
        ) : (
          <div
            data-testid="composed-chart-surface"
            className="w-full"
            style={{ height }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={200}
              minHeight={height}
              initialDimension={{ width: 640, height }}
            >
              <ComposedChart
                data={[...data]}
                margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
                barCategoryGap="20%"
              >
                <defs>
                  <linearGradient
                    id="multiMonthAccumulatedGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient
                    id="barReceitasGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.65} />
                  </linearGradient>
                  <linearGradient
                    id="barDespesasGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.88} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6} />
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
                  width={75}
                  fontSize={11}
                  tickFormatter={formatCompactCurrencyBRL}
                  tick={{ fill: "var(--muted-foreground)" }}
                />

                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.35 }}
                  content={<MultiMonthEvolutionTooltip />}
                />

                <ReferenceLine
                  y={0}
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                />

                {emergencyFundTarget && emergencyFundTarget > 0 ? (
                  <ReferenceLine
                    y={emergencyFundTarget}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{
                      value: "Meta Reserva",
                      fill: "#f59e0b",
                      fontSize: 10,
                      position: "insideTopRight",
                    }}
                  />
                ) : null}

                <Bar
                  dataKey="receitas"
                  name="Receitas"
                  fill="url(#barReceitasGrad)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                  isAnimationActive={!prefersReducedMotion}
                  animationDuration={450}
                />

                <Bar
                  dataKey="despesas"
                  name="Despesas"
                  fill="url(#barDespesasGrad)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                  isAnimationActive={!prefersReducedMotion}
                  animationDuration={450}
                />

                <Area
                  type="monotone"
                  dataKey="cumulativeBalance"
                  name="Saldo Acumulado"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#multiMonthAccumulatedGrad)"
                  isAnimationActive={!prefersReducedMotion}
                  animationDuration={500}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
