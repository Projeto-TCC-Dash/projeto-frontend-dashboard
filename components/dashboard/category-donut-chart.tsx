"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { PieChart, ArrowUpRight, Inbox } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CategoryMetric } from "@/src/types/api"
import { CategoryChartLegend, getCategoryColor } from "./category-chart-legend"
import { formatCurrencyBRL, formatPercentage } from "@/lib/formatters"
import { cn } from "@/lib/utils"

export interface CategoryDonutChartProps {
  categories: CategoryMetric[]
  month: string
  isLoading?: boolean
  className?: string
}

interface SliceData {
  category: string
  amount: number
  percentage: number
  color: string
  path: string
  startAngle: number
  endAngle: number
}

function computeDonutSlices(
  activeCategories: CategoryMetric[],
  totalExpenses: number,
  center: number,
  outerRadius: number,
  innerRadius: number
): SliceData[] {
  let cumulativeAngle = -Math.PI / 2 // Start from top (12 o'clock)

  return activeCategories.map((item) => {
    const proportion = totalExpenses > 0 ? item.amount / totalExpenses : 0
    const sliceAngle = proportion * 2 * Math.PI
    const startAngle = cumulativeAngle
    const endAngle = cumulativeAngle + sliceAngle
    cumulativeAngle = endAngle

    // Handle single 100% item full circle edge case
    const isFullCircle = proportion >= 0.999
    const effectiveEndAngle = isFullCircle
      ? startAngle + 2 * Math.PI - 0.0001
      : endAngle

    const x1 = center + outerRadius * Math.cos(startAngle)
    const y1 = center + outerRadius * Math.sin(startAngle)
    const x2 = center + outerRadius * Math.cos(effectiveEndAngle)
    const y2 = center + outerRadius * Math.sin(effectiveEndAngle)

    const x3 = center + innerRadius * Math.cos(effectiveEndAngle)
    const y3 = center + innerRadius * Math.sin(effectiveEndAngle)
    const x4 = center + innerRadius * Math.cos(startAngle)
    const y4 = center + innerRadius * Math.sin(startAngle)

    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0

    const path = [
      `M ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      "Z",
    ].join(" ")

    return {
      category: item.category,
      amount: item.amount,
      percentage: item.percentage,
      color: getCategoryColor(item.category),
      path,
      startAngle,
      endAngle,
    }
  })
}

export function CategoryDonutChart({
  categories,
  month,
  isLoading = false,
  className,
}: CategoryDonutChartProps) {
  const router = useRouter()
  const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(
    null
  )

  // Filter out zero amount categories and sort descending
  const activeCategories = React.useMemo(() => {
    return categories
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount)
  }, [categories])

  const totalExpenses = React.useMemo(() => {
    return activeCategories.reduce((acc, c) => acc + c.amount, 0)
  }, [activeCategories])

  // Handle drill-down navigation
  const handleSelectCategory = (category: string) => {
    const encodedCategory = encodeURIComponent(category)
    router.push(`/transactions?month=${month}&category=${encodedCategory}`)
  }

  if (isLoading) {
    return (
      <Card
        className={cn("min-w-0 border-border", className)}
        data-testid="category-donut-chart-loading"
      >
        <CardHeader>
          <div className="h-5 w-44 max-w-full animate-pulse rounded bg-muted" />
          <div className="mt-1 h-4 w-64 max-w-full animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="size-44 animate-pulse rounded-full border-8 border-muted border-t-muted/40 sm:size-48" />
        </CardContent>
      </Card>
    )
  }

  // Calculate SVG Donut Slices
  const size = 260
  const center = size / 2
  const outerRadius = 100
  const innerRadius = 65

  const slices = computeDonutSlices(
    activeCategories,
    totalExpenses,
    center,
    outerRadius,
    innerRadius
  )

  const activeSliceInfo =
    slices.find((s) => s.category === hoveredCategory) || null

  return (
    <Card
      className={cn("min-w-0 border-border", className)}
      data-testid="category-donut-chart"
    >
      <CardHeader className="flex flex-col pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <PieChart className="size-5 shrink-0 text-primary" />
            <CardTitle>Distribuição por Categorias</CardTitle>
          </div>
          <CardDescription>
            Visão proporcional das maiores despesas. Clique em uma categoria
            para auditar os lançamentos.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {activeCategories.length === 0 ? (
          <div
            className="my-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 p-5 text-center sm:p-8"
            data-testid="category-donut-chart-empty"
          >
            <div className="mb-3 rounded-full bg-muted p-3">
              <Inbox className="size-6 text-muted-foreground" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">
              Nenhuma despesa registrada neste mês
            </h4>
            <p className="mt-1 mb-4 max-w-sm text-xs text-muted-foreground">
              Importe seus extratos bancários (.ofx ou .csv) ou adicione
              movimentações na tela de transações para visualizar o gráfico.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/transactions")}
              className="min-h-10 w-full gap-1.5 sm:min-h-8 sm:w-auto"
            >
              Ir para Transações
              <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
            {/* Donut Chart SVG Container */}
            <div className="relative flex min-w-0 flex-col items-center justify-center md:col-span-6">
              <svg
                viewBox={`0 0 ${size} ${size}`}
                className="h-auto w-full max-w-[220px] overflow-visible drop-shadow-xs select-none sm:max-w-[260px]"
                role="img"
                aria-label="Gráfico de rosca com distribuição de despesas por categoria"
              >
                <g>
                  {slices.map((slice) => {
                    const isHovered = hoveredCategory === slice.category
                    return (
                      <path
                        key={slice.category}
                        d={slice.path}
                        fill={slice.color}
                        className={cn(
                          "cursor-pointer stroke-card stroke-2 transition-all duration-200",
                          isHovered
                            ? "transform-origin-center scale-102 opacity-100 brightness-110 filter"
                            : "opacity-90 hover:opacity-100"
                        )}
                        onMouseEnter={() => setHoveredCategory(slice.category)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        onClick={() => handleSelectCategory(slice.category)}
                        data-testid={`donut-slice-${slice.category}`}
                      />
                    )
                  })}
                </g>
              </svg>

              {/* Informação Central do Donut */}
              <div
                className="pointer-events-none absolute flex max-w-[104px] flex-col items-center justify-center px-2 text-center sm:max-w-[130px] sm:px-4"
                data-testid="donut-center-info"
              >
                {activeSliceInfo ? (
                  <>
                    <span className="max-w-full truncate text-[11px] font-semibold text-foreground sm:text-xs">
                      {activeSliceInfo.category}
                    </span>
                    <span className="mt-0.5 font-mono text-xs font-bold break-words text-primary sm:text-sm">
                      {formatCurrencyBRL(activeSliceInfo.amount)}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground sm:text-[11px]">
                      {formatPercentage(activeSliceInfo.percentage, 1)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase sm:text-[11px]">
                      Total Despesas
                    </span>
                    <span className="mt-0.5 font-mono text-xs font-bold break-words text-foreground sm:text-sm">
                      {formatCurrencyBRL(totalExpenses)}
                    </span>
                    <span className="mt-0.5 text-[10px] text-muted-foreground">
                      {activeCategories.length} categorias
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Legenda de Categorias com Navegação Drill-Down */}
            <div className="min-w-0 md:col-span-6">
              <CategoryChartLegend
                categories={activeCategories}
                activeCategory={hoveredCategory}
                onSelectCategory={handleSelectCategory}
                onHoverCategory={setHoveredCategory}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
