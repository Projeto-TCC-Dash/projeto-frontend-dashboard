import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface MetricCardProps {
  title: string
  value: string
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
}

export function MetricCard({
  title,
  value,
  description,
  icon,
  variant = "default",
  badge,
  isLoading = false,
  className,
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
        {icon && <div className="shrink-0 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent className="min-w-0 space-y-1.5">
        <div
          className={cn(
            "text-xl font-bold tracking-tight break-words tabular-nums sm:text-2xl",
            valueColorClass
          )}
          data-testid="metric-value"
        >
          {value}
        </div>
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
