import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: "default" | "positive" | "negative" | "warning";
  badge?: {
    text: string;
    variant?: "default" | "success" | "warning" | "destructive" | "secondary" | "outline";
  };
  isLoading?: boolean;
  className?: string;
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
      <Card className={cn("overflow-hidden animate-pulse", className)} data-testid="metric-card-skeleton">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="h-4 w-28 bg-muted rounded" />
          <div className="h-5 w-5 bg-muted rounded-full" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-36 bg-muted rounded my-1" />
          <div className="h-3.5 w-24 bg-muted rounded mt-2" />
        </CardContent>
      </Card>
    );
  }

  const valueColorClass = {
    default: "text-foreground",
    positive: "text-emerald-600 dark:text-emerald-400",
    negative: "text-rose-600 dark:text-rose-400",
    warning: "text-amber-600 dark:text-amber-400",
  }[variant];

  return (
    <Card className={cn("overflow-hidden transition-all duration-200 hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent className="space-y-1.5">
        <div className={cn("text-2xl font-bold tracking-tight", valueColorClass)} data-testid="metric-value">
          {value}
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {badge && (
            <Badge variant={badge.variant ?? "default"} className="text-xs font-medium">
              {badge.text}
            </Badge>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
