"use client"

import * as React from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { cn } from "@/lib/utils"
import type { CategoryChartDatum } from "@/src/types/charts"
import { formatCurrencyBRL, formatPercentage } from "@/lib/formatters"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"

export interface DonutChartProps {
  data: readonly CategoryChartDatum[]
  activeKey?: string | null
  onActiveKeyChange?: (key: string | null) => void
  onSliceSelect?: (item: CategoryChartDatum) => void
  centerLabel?: string
  centerSubLabel?: string
  centerDetail?: string
  showTooltip?: boolean
  isAnimated?: boolean
  height?: number
  className?: string
  ariaLabel?: string
}

interface CustomDonutTooltipProps {
  active?: boolean
  payload?: ReadonlyArray<{
    payload?: CategoryChartDatum
  }>
}

function DonutChartTooltip({ active, payload }: CustomDonutTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const datum = payload[0]?.payload
  if (!datum) return null

  return (
    <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 text-xs shadow-md backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: datum.color }}
        />
        <span className="font-semibold text-popover-foreground">
          {datum.name}
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-2 tabular-nums">
        <span className="font-bold text-popover-foreground">
          {formatCurrencyBRL(datum.amount)}
        </span>
        <span className="text-muted-foreground">
          ({formatPercentage(datum.percentage)})
        </span>
      </div>
    </div>
  )
}

export function DonutChart({
  data,
  activeKey = null,
  onActiveKeyChange,
  onSliceSelect,
  centerLabel,
  centerSubLabel,
  centerDetail,
  showTooltip = true,
  isAnimated = true,
  height = 240,
  className,
  ariaLabel = "Gráfico de rosca com distribuição por categorias",
}: DonutChartProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const chartData = React.useMemo(() => [...data], [data])

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      data-testid="tremor-donut-chart"
      className={cn("relative w-full", className)}
      style={{ height }}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={200}
        minHeight={height}
        initialDimension={{ width: 260, height }}
      >
        <PieChart>
          <Pie
            data={chartData}
            dataKey="amount"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="64%"
            outerRadius="90%"
            paddingAngle={chartData.length > 1 ? 2 : 0}
            strokeWidth={1.5}
            isAnimationActive={isAnimated && !prefersReducedMotion}
            animationDuration={450}
            onMouseEnter={(_entry, index) => {
              const target = chartData[index]
              if (target) onActiveKeyChange?.(String(target.category))
            }}
            onMouseLeave={() => onActiveKeyChange?.(null)}
            onClick={(_entry, index) => {
              const target = chartData[index]
              if (target) onSliceSelect?.(target)
            }}
          >
            {chartData.map((entry) => {
              const key = String(entry.category)
              const isSelected = activeKey === key
              const isDimmed = activeKey !== null && !isSelected
              return (
                <Cell
                  key={key}
                  fill={entry.color}
                  stroke={isSelected ? "var(--background)" : "var(--card)"}
                  fillOpacity={isDimmed ? 0.35 : 1}
                  className="cursor-pointer transition-opacity duration-150 outline-none"
                />
              )
            })}
          </Pie>
          {showTooltip ? (
            <Tooltip
              content={({ active, payload }) => (
                <DonutChartTooltip
                  active={active}
                  payload={payload as CustomDonutTooltipProps["payload"]}
                />
              )}
            />
          ) : null}
        </PieChart>
      </ResponsiveContainer>

      {centerLabel || centerSubLabel || centerDetail ? (
        <div
          data-testid="donut-center-info"
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
        >
          {centerSubLabel ? (
            <span className="max-w-[9rem] truncate text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              {centerSubLabel}
            </span>
          ) : null}
          {centerLabel ? (
            <span className="mt-0.5 max-w-[10.5rem] truncate text-sm font-bold text-foreground tabular-nums sm:text-base">
              {centerLabel}
            </span>
          ) : null}
          {centerDetail ? (
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {centerDetail}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
