import * as React from "react"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ProgressBar,
  type ProgressBarProps,
} from "@/components/ui/tremor/progress-bar"
import { AnimatedNumberValue } from "@/components/ui/animated-number-value"
import type { Format } from "@number-flow/react"
import type { TrendMetric } from "@/src/types/charts"
import { cn } from "@/lib/utils"

export interface MetricCardProps {
  title: string
  value: string
  numericValue?: number
  numberFormat?: Format
  numberPrefix?: string
  numberSuffix?: string
  description?: string
  icon?: React.ReactNode
  variant?: "default" | "positive" | "negative" | "warning"
  badge?: {
    text: string
    variant?:
      | "default"
      | "success"
      | "warning"
      | "destructive"
      | "secondary"
      | "outline"
  }
  trend?: TrendMetric | null
  sparklineData?: number[]
  isLoading?: boolean
  className?: string
  progressBar?: ProgressBarProps
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const width = 120
  const height = 24

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((val - min) / range) * (height - 4) - 2
    return { x, y }
  })

  const pathD = points.reduce(
    (acc, p, i) =>
      `${acc} ${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`,
    ""
  )

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`
  const gradId = `sparkline-${color.replace(/[^a-zA-Z0-9]/g, "")}`

  return (
    <div data-testid="metric-sparkline" className="w-full pt-1">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-6 w-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#${gradId})`} />
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

export function MetricCard({
  title,
  value,
  numericValue,
  numberFormat,
  numberPrefix,
  numberSuffix,
  description,
  icon,
  variant = "default",
  badge,
  trend,
  sparklineData,
  isLoading = false,
  className,
  progressBar,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <Card
        className={cn("min-w-0 animate-pulse overflow-hidden", className)}
        data-testid="metric-card-skeleton"
      >
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <div className="h-4 w-28 max-w-full rounded bg-muted" />
          <div className="h-5 w-5 shrink-0 rounded-full bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="my-1 h-8 w-36 max-w-full rounded bg-muted" />
          <div className="mt-2 h-3.5 w-24 max-w-full rounded bg-muted" />
        </CardContent>
      </Card>
    )
  }

  const valueColorClass = {
    default: "text-foreground",
    positive: "text-emerald-600 dark:text-emerald-400",
    negative: "text-rose-600 dark:text-rose-400",
    warning: "text-amber-600 dark:text-amber-400",
  }[variant]

  const iconBadgeClass = {
    default: "bg-muted/80 text-muted-foreground",
    positive: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    negative: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  }[variant]

  const sparklineColor =
    variant === "positive"
      ? "#10b981"
      : variant === "negative"
        ? "#ef4444"
        : variant === "warning"
          ? "#f59e0b"
          : "#3b82f6"

  return (
    <Card
      className={cn(
        "min-w-0 overflow-hidden transition-all duration-200 hover:shadow-md",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="min-w-0 text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div
            data-testid="metric-icon-badge"
            className={cn(
              "inline-flex size-8 shrink-0 items-center justify-center rounded-lg",
              iconBadgeClass
            )}
          >
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="min-w-0 space-y-1.5">
        <div
          className={cn(
            "text-xl font-bold tracking-tight break-words tabular-nums sm:text-2xl",
            valueColorClass
          )}
          data-testid="metric-value"
        >
          {typeof numericValue === "number" ? (
            <AnimatedNumberValue
              value={numericValue}
              fallbackText={value}
              format={numberFormat}
              prefix={numberPrefix}
              suffix={numberSuffix}
            />
          ) : (
            value
          )}
        </div>
        {progressBar ? (
          <ProgressBar
            {...progressBar}
            className={cn("pt-1", progressBar.className)}
          />
        ) : null}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {trend && (
            <Badge
              data-testid="metric-trend-badge"
              variant="outline"
              className={cn(
                "gap-0.5 border-0 px-2 py-0.5 text-[11px] font-semibold",
                trend.isPositive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              )}
            >
              {trend.direction === "up" ? (
                <ArrowUpRight className="size-3" />
              ) : trend.direction === "down" ? (
                <ArrowDownRight className="size-3" />
              ) : null}
              {trend.label}
            </Badge>
          )}
          {badge && (
            <Badge
              variant={badge.variant ?? "default"}
              className="text-xs font-medium"
            >
              {badge.text}
            </Badge>
          )}
          {description && (
            <p className="min-w-0 text-xs break-words text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {sparklineData && sparklineData.length > 1 ? (
          <MiniSparkline data={sparklineData} color={sparklineColor} />
        ) : null}
      </CardContent>
    </Card>
  )
}
