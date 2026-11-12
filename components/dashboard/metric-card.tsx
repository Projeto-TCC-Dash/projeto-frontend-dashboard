import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ProgressBar,
  type ProgressBarProps,
} from "@/components/ui/tremor/progress-bar"
import { AnimatedNumberValue } from "@/components/ui/animated-number-value"
import type { Format } from "@number-flow/react"
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
  isLoading?: boolean
  className?: string
  progressBar?: ProgressBarProps
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
      </CardContent>
    </Card>
  )
}
