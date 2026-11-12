"use client"

import * as React from "react"
import type { CategoryMetric } from "@/src/types/api"
import { BarList } from "@/components/ui/tremor/bar-list"
import { buildCategoryBarListItems } from "@/lib/dashboard-charts"
import { CATEGORY_HEX_COLORS, resolveCategoryColor } from "@/lib/chart-utils"

export const CATEGORY_COLORS: Record<string, string> = CATEGORY_HEX_COLORS

export function getCategoryColor(category: string): string {
  return resolveCategoryColor(category)
}

export interface CategoryChartLegendProps {
  categories: CategoryMetric[]
  activeCategory: string | null
  onHover: (category: string | null) => void
  onSelect: (category: string) => void
}

export function CategoryChartLegend({
  categories,
  activeCategory,
  onHover,
  onSelect,
}: CategoryChartLegendProps) {
  const items = React.useMemo(
    () => buildCategoryBarListItems(categories),
    [categories]
  )

  return (
    <div data-testid="category-chart-legend" className="w-full">
      <BarList
        data={items}
        activeKey={activeCategory}
        onItemHover={onHover}
        onItemSelect={(item) => onSelect(item.key)}
        ariaLabel="Legenda proporcional por categoria"
      />
    </div>
  )
}
