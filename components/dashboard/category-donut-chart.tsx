"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PieChart, ArrowUpRight, Inbox } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryMetric } from "@/src/types/api";
import { CategoryChartLegend, getCategoryColor } from "./category-chart-legend";
import { formatCurrencyBRL, formatPercentage } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export interface CategoryDonutChartProps {
  categories: CategoryMetric[];
  month: string;
  isLoading?: boolean;
  className?: string;
}

interface SliceData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  path: string;
  startAngle: number;
  endAngle: number;
}

function computeDonutSlices(
  activeCategories: CategoryMetric[],
  totalExpenses: number,
  center: number,
  outerRadius: number,
  innerRadius: number
): SliceData[] {
  let cumulativeAngle = -Math.PI / 2; // Start from top (12 o'clock)

  return activeCategories.map((item) => {
    const proportion = totalExpenses > 0 ? item.amount / totalExpenses : 0;
    const sliceAngle = proportion * 2 * Math.PI;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sliceAngle;
    cumulativeAngle = endAngle;

    // Handle single 100% item full circle edge case
    const isFullCircle = proportion >= 0.999;
    const effectiveEndAngle = isFullCircle ? startAngle + 2 * Math.PI - 0.0001 : endAngle;

    const x1 = center + outerRadius * Math.cos(startAngle);
    const y1 = center + outerRadius * Math.sin(startAngle);
    const x2 = center + outerRadius * Math.cos(effectiveEndAngle);
    const y2 = center + outerRadius * Math.sin(effectiveEndAngle);

    const x3 = center + innerRadius * Math.cos(effectiveEndAngle);
    const y3 = center + innerRadius * Math.sin(effectiveEndAngle);
    const x4 = center + innerRadius * Math.cos(startAngle);
    const y4 = center + innerRadius * Math.sin(startAngle);

    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

    const path = [
      `M ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      "Z",
    ].join(" ");

    return {
      category: item.category,
      amount: item.amount,
      percentage: item.percentage,
      color: getCategoryColor(item.category),
      path,
      startAngle,
      endAngle,
    };
  });
}

export function CategoryDonutChart({
  categories,
  month,
  isLoading = false,
  className,
}: CategoryDonutChartProps) {
  const router = useRouter();
  const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(null);

  // Filter out zero amount categories and sort descending
  const activeCategories = React.useMemo(() => {
    return categories
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [categories]);

  const totalExpenses = React.useMemo(() => {
    return activeCategories.reduce((acc, c) => acc + c.amount, 0);
  }, [activeCategories]);

  // Handle drill-down navigation
  const handleSelectCategory = (category: string) => {
    const encodedCategory = encodeURIComponent(category);
    router.push(`/transactions?month=${month}&category=${encodedCategory}`);
  };

  if (isLoading) {
    return (
      <Card className={cn("border-border", className)} data-testid="category-donut-chart-loading">
        <CardHeader>
          <div className="h-5 w-44 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse mt-1" />
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="size-48 rounded-full border-8 border-muted border-t-muted/40 animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  // Calculate SVG Donut Slices
  const size = 260;
  const center = size / 2;
  const outerRadius = 100;
  const innerRadius = 65;

  const slices = computeDonutSlices(activeCategories, totalExpenses, center, outerRadius, innerRadius);

  const activeSliceInfo = slices.find((s) => s.category === hoveredCategory) || null;

  return (
    <Card className={cn("border-border", className)} data-testid="category-donut-chart">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <PieChart className="size-5 text-primary" />
            <CardTitle>Distribuição por Categorias</CardTitle>
          </div>
          <CardDescription>
            Visão proporcional das maiores despesas. Clique em uma categoria para auditar os lançamentos.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {activeCategories.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-border/60 bg-muted/20 my-4"
            data-testid="category-donut-chart-empty"
          >
            <div className="p-3 bg-muted rounded-full mb-3">
              <Inbox className="size-6 text-muted-foreground" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">
              Nenhuma despesa registrada neste mês
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
              Importe seus extratos bancários (.ofx ou .csv) ou adicione movimentações na tela de transações para visualizar o gráfico.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/transactions")}
              className="gap-1.5"
            >
              Ir para Transações
              <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Donut Chart SVG Container */}
            <div className="md:col-span-6 flex flex-col items-center justify-center relative">
              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="overflow-visible select-none drop-shadow-xs"
                role="img"
                aria-label="Gráfico de rosca com distribuição de despesas por categoria"
              >
                <g>
                  {slices.map((slice) => {
                    const isHovered = hoveredCategory === slice.category;
                    return (
                      <path
                        key={slice.category}
                        d={slice.path}
                        fill={slice.color}
                        className={cn(
                          "transition-all duration-200 cursor-pointer stroke-card stroke-2",
                          isHovered ? "opacity-100 scale-102 transform-origin-center filter brightness-110" : "opacity-90 hover:opacity-100"
                        )}
                        onMouseEnter={() => setHoveredCategory(slice.category)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        onClick={() => handleSelectCategory(slice.category)}
                        data-testid={`donut-slice-${slice.category}`}
                      />
                    );
                  })}
                </g>
              </svg>

              {/* Informação Central do Donut */}
              <div
                className="absolute flex flex-col items-center justify-center pointer-events-none text-center px-4 max-w-[130px]"
                data-testid="donut-center-info"
              >
                {activeSliceInfo ? (
                  <>
                    <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                      {activeSliceInfo.category}
                    </span>
                    <span className="text-sm font-bold text-primary font-mono mt-0.5">
                      {formatCurrencyBRL(activeSliceInfo.amount)}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {formatPercentage(activeSliceInfo.percentage, 1)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                      Total Despesas
                    </span>
                    <span className="text-sm font-bold text-foreground font-mono mt-0.5">
                      {formatCurrencyBRL(totalExpenses)}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      {activeCategories.length} categorias
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Legenda de Categorias com Navegação Drill-Down */}
            <div className="md:col-span-6">
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
  );
}
