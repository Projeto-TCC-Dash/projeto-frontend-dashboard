"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PieChart as PieChartIcon, ArrowUpRight } from "lucide-react"
import type { CategoryMetric } from "@/src/types/api"
import { formatCurrencyBRL, formatPercentage } from "@/lib/formatters"
import { DonutChart } from "@/components/ui/tremor/donut-chart"
import {
  buildCategoryChartData,
  buildCategoryDrillDownHref,
} from "@/lib/dashboard-charts"
import { CategoryChartLegend } from "./category-chart-legend"

export interface CategoryDonutChartProps {
  categories: CategoryMetric[]
  month: string
  isLoading?: boolean
}

export function CategoryDonutChart({
  categories,
  month,
  isLoading = false,
}: CategoryDonutChartProps) {
  const router = useRouter()
  const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(
    null
  )

  const validCategories = React.useMemo(
    () =>
      [...categories]
        .filter((cat) => cat.amount > 0)
        .sort((a, b) => b.amount - a.amount),
    [categories]
  )

  const totalAmount = React.useMemo(
    () => validCategories.reduce((sum, cat) => sum + cat.amount, 0),
    [validCategories]
  )

  const chartData = React.useMemo(
    () => buildCategoryChartData(validCategories, month),
    [validCategories, month]
  )

  const activeItem = React.useMemo(
    () =>
      chartData.find((item) => String(item.category) === hoveredCategory) ??
      null,
    [chartData, hoveredCategory]
  )

  const handleSelectCategory = (category: string) => {
    router.push(buildCategoryDrillDownHref(month, category))
  }

  const loadingContent = (
    <div
      data-testid="category-donut-chart-loading"
      className="flex animate-pulse flex-col items-center gap-6 py-4 sm:flex-row"
    >
      <div className="h-[220px] w-[220px] shrink-0 rounded-full border-[24px] border-muted" />
      <div className="w-full flex-1 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-full rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="h-5 w-48 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>{loadingContent}</CardContent>
      </Card>
    )
  }

  const bodyContent =
    validCategories.length === 0 ? (
      <div
        data-testid="category-donut-chart-empty"
        className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground"
      >
        <div className="mb-3 rounded-full bg-muted/60 p-3">
          <PieChartIcon className="size-7 text-muted-foreground/70" />
        </div>
        <p className="text-sm font-medium text-foreground">
          Sem movimentações registradas neste mês
        </p>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
          Adicione receitas ou despesas para visualizar a distribuição
          interativa por categoria.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 gap-1.5"
          onClick={() => router.push("/transactions")}
        >
          Explorar Transações <ArrowUpRight className="size-3.5" />
        </Button>
      </div>
    ) : (
      <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
        <div className="flex flex-col items-center justify-center md:col-span-5">
          <DonutChart
            data={chartData}
            activeKey={hoveredCategory}
            onActiveKeyChange={setHoveredCategory}
            onSliceSelect={(item) =>
              handleSelectCategory(String(item.category))
            }
            centerSubLabel={activeItem ? activeItem.name : "Total Despesas"}
            centerLabel={
              activeItem
                ? formatCurrencyBRL(activeItem.amount)
                : formatCurrencyBRL(totalAmount)
            }
            centerDetail={
              activeItem ? formatPercentage(activeItem.percentage) : undefined
            }
            height={230}
            ariaLabel="Gráfico de rosca com distribuição de despesas por categoria"
          />
        </div>

        <div className="min-w-0 md:col-span-7">
          <CategoryChartLegend
            categories={validCategories}
            activeCategory={hoveredCategory}
            onHover={setHoveredCategory}
            onSelect={handleSelectCategory}
          />
        </div>
      </div>
    )

  return (
    <Card data-testid="category-donut-chart">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-semibold">
            Distribuição por Categorias
          </CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Clique em uma categoria para abrir o extrato detalhado
          </p>
        </div>
      </CardHeader>
      <CardContent>{bodyContent}</CardContent>
    </Card>
  )
}
