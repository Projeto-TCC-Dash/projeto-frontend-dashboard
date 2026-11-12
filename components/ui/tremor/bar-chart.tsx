"use client"

import * as React from "react"
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { cn } from "@/lib/utils"
import type { TremorColor } from "@/src/types/charts"
import {
  formatCompactCurrencyBRL,
  getTremorColorTokens,
} from "@/lib/chart-utils"
import { formatCurrencyBRL } from "@/lib/formatters"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"

export interface BarChartCategory {
  key: string
  label: string
  color: TremorColor
}

export interface BarChartProps {
  data: readonly Record<string, string | number>[]
  index: string
  categories: readonly BarChartCategory[]
  valueFormatter?: (value: number) => string
  yAxisFormatter?: (value: number) => string
  showLegend?: boolean
  height?: number
  className?: string
  ariaLabel?: string
}

interface CustomBarTooltipProps {
  active?: boolean
  label?: string | number
  payload?: ReadonlyArray<{
    dataKey?: string | number
    name?: string | number
    value?: number | string
    color?: string
  }>
  categories: readonly BarChartCategory[]
  valueFormatter: (value: number) => string
}

function BarChartTooltip({
  active,
  label,
  payload,
  categories,
  valueFormatter,
}: CustomBarTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const categoryMap = new Map(categories.map((cat) => [cat.key, cat]))

  return (
    <div className="min-w-[11rem] rounded-lg border border-border bg-popover/95 px-3 py-2 text-xs shadow-md backdrop-blur-sm">
      <p className="mb-1.5 border-b border-border/60 pb-1 font-semibold text-popover-foreground">
        {String(label ?? "")}
      </p>
      <div className="space-y-1">
        {payload.map((entry) => {
          const key = String(entry.dataKey ?? entry.name ?? "")
          const meta = categoryMap.get(key)
          const numericVal =
            typeof entry.value === "number"
              ? entry.value
              : Number(entry.value ?? 0)
          const dotColor = meta
            ? getTremorColorTokens(meta.color).hex
            : (entry.color ?? "#64748b")

          return (
            <div
              key={key}
              className="flex items-center justify-between gap-4 tabular-nums"
            >
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: dotColor }}
                />
                {meta?.label ?? key}
              </span>
              <span className="font-semibold text-popover-foreground">
                {valueFormatter(numericVal)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function BarChart({
  data,
  index,
  categories,
  valueFormatter = formatCurrencyBRL,
  yAxisFormatter = formatCompactCurrencyBRL,
  showLegend = true,
  height = 260,
  className,
  ariaLabel = "Gráfico de barras comparativo do período",
}: BarChartProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [hiddenKeys, setHiddenKeys] = React.useState<Set<string>>(
    () => new Set()
  )

  const toggleCategory = (key: string) => {
    setHiddenKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else if (categories.length - next.size > 1) {
        next.add(key)
      }
      return next
    })
  }

  const chartData = React.useMemo(() => [...data], [data])

  return (
    <div
      data-testid="tremor-bar-chart"
      aria-label={ariaLabel}
      className={cn("w-full space-y-3", className)}
    >
      {showLegend && categories.length > 0 ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {categories.map((cat) => {
            const isHidden = hiddenKeys.has(cat.key)
            const tokens = getTremorColorTokens(cat.color)
            return (
              <button
                key={cat.key}
                type="button"
                aria-pressed={!isHidden}
                onClick={() => toggleCategory(cat.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border border-border/70 px-2.5 py-1 text-xs font-medium transition-opacity",
                  isHidden
                    ? "bg-transparent opacity-45"
                    : "bg-muted/40 text-foreground"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn("size-2 rounded-full", tokens.bg)}
                />
                {cat.label}
              </button>
            )
          })}
        </div>
      ) : null}

      <div className="w-full" style={{ height }}>
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={200}
          minHeight={height}
          initialDimension={{ width: 460, height }}
        >
          <RechartsBarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            barCategoryGap="22%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-border/60"
            />
            <XAxis
              dataKey={index}
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
              tickFormatter={(value: number) => yAxisFormatter(value)}
              tick={{ fill: "var(--muted-foreground)" }}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.35 }}
              content={({ active, label, payload }) => (
                <BarChartTooltip
                  active={active}
                  label={label}
                  payload={payload as CustomBarTooltipProps["payload"]}
                  categories={categories}
                  valueFormatter={valueFormatter}
                />
              )}
            />
            {categories
              .filter((cat) => !hiddenKeys.has(cat.key))
              .map((cat) => {
                const tokens = getTremorColorTokens(cat.color)
                return (
                  <Bar
                    key={cat.key}
                    dataKey={cat.key}
                    name={cat.label}
                    fill={tokens.hex}
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={!prefersReducedMotion}
                    animationDuration={400}
                  />
                )
              })}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
