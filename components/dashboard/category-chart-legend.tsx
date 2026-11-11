import * as React from "react"
import { CategoryMetric } from "@/src/types/api"
import { formatCurrencyBRL, formatPercentage } from "@/lib/formatters"
import { cn } from "@/lib/utils"

export const CATEGORY_COLORS: Record<string, string> = {
  Moradia: "#8b5cf6", // Purple
  Alimentação: "#f59e0b", // Amber
  Transporte: "#3b82f6", // Blue
  Saúde: "#ef4444", // Rose
  Lazer: "#10b981", // Emerald
  Educação: "#0284c7", // Sky Blue
  Receita: "#14b8a6", // Teal
  "Pagamento de Fatura": "#64748b", // Slate
  Investimentos: "#06b6d4", // Cyan
  Outros: "#64748b", // Slate
  "Não Categorizado": "#71717a", // Zinc
}

export const DEFAULT_CATEGORY_COLOR = "#64748b"

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || DEFAULT_CATEGORY_COLOR
}

export interface CategoryChartLegendProps {
  categories: CategoryMetric[]
  activeCategory?: string | null
  onSelectCategory?: (category: string) => void
  onHoverCategory?: (category: string | null) => void
  className?: string
}

export function CategoryChartLegend({
  categories,
  activeCategory,
  onSelectCategory,
  onHoverCategory,
  className,
}: CategoryChartLegendProps) {
  if (categories.length === 0) {
    return null
  }

  return (
    <div
      className={cn("grid grid-cols-1 gap-2.5 sm:grid-cols-2", className)}
      data-testid="category-chart-legend"
    >
      {categories.map((item) => {
        const isHovered = activeCategory === item.category
        const color = getCategoryColor(item.category)

        return (
          <button
            key={item.category}
            type="button"
            onClick={() => onSelectCategory?.(item.category)}
            onMouseEnter={() => onHoverCategory?.(item.category)}
            onMouseLeave={() => onHoverCategory?.(null)}
            className={cn(
              "flex items-center justify-between rounded-lg border border-transparent p-2 text-left text-xs transition-all",
              "cursor-pointer hover:border-border hover:bg-muted/50 focus:ring-1 focus:ring-primary focus:outline-none",
              isHovered && "border-border bg-muted/70 shadow-xs"
            )}
            title={`Clique para auditar as transações de ${item.category}`}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="truncate font-medium text-foreground">
                {item.category}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-right font-mono">
              <span className="text-muted-foreground">
                {formatPercentage(item.percentage, 1)}
              </span>
              <span className="font-semibold text-foreground">
                {formatCurrencyBRL(item.amount)}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
