"use client"

import * as React from "react"
import { PieChart as PieChartIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DonutChart } from "@/components/ui/tremor/donut-chart"
import { BarList } from "@/components/ui/tremor/bar-list"
import { formatCurrencyBRL, formatPercentage } from "@/lib/formatters"
import {
  ASSET_MACRO_CLASS_LABELS,
  type AssetMacroClass,
  type InvestmentPortfolioSummary,
} from "@/src/types/api"
import type {
  BarListItem,
  CategoryChartDatum,
  TremorColor,
} from "@/src/types/charts"

export interface InvestmentAllocationDonutProps {
  portfolio: InvestmentPortfolioSummary | null
  isLoading?: boolean
}

const MACRO_CLASS_COLORS: Record<
  AssetMacroClass,
  { color: string; colorName: TremorColor }
> = {
  FIXED_INCOME: { color: "#10b981", colorName: "emerald" },
  EQUITIES: { color: "#3b82f6", colorName: "blue" },
  REAL_ESTATE: { color: "#8b5cf6", colorName: "violet" },
  INTERNATIONAL: { color: "#06b6d4", colorName: "cyan" },
  CRYPTO: { color: "#f59e0b", colorName: "amber" },
  CASH_LIQUIDITY: { color: "#14b8a6", colorName: "teal" },
}

export function InvestmentAllocationDonut({
  portfolio,
  isLoading = false,
}: InvestmentAllocationDonutProps) {
  const [activeKey, setActiveKey] = React.useState<string | null>(null)

  const aggregated = React.useMemo(() => {
    const holdings = portfolio?.holdings ?? []
    const byClass = new Map<AssetMacroClass, number>()

    for (const h of holdings) {
      if (h.amount <= 0) continue
      byClass.set(h.macroClass, (byClass.get(h.macroClass) ?? 0) + h.amount)
    }

    const total = Array.from(byClass.values()).reduce((sum, v) => sum + v, 0)
    if (total <= 0) return { chartData: [], barItems: [], total: 0 }

    const sorted = Array.from(byClass.entries()).sort((a, b) => b[1] - a[1])

    const chartData: CategoryChartDatum[] = sorted.map(
      ([macroClass, amount]) => {
        const label = ASSET_MACRO_CLASS_LABELS[macroClass] ?? macroClass
        const style = MACRO_CLASS_COLORS[macroClass] ?? {
          color: "#64748b",
          colorName: "slate" as TremorColor,
        }
        const percentage = (amount / total) * 100
        return {
          name: label,
          category: macroClass,
          amount,
          percentage,
          color: style.color,
          colorName: style.colorName,
        }
      }
    )

    const barItems: BarListItem[] = chartData.map((d) => ({
      key: String(d.category),
      name: d.name,
      value: d.amount,
      percentage: d.percentage,
      color: d.color,
      colorName: d.colorName,
    }))

    return { chartData, barItems, total }
  }, [portfolio])

  const activeDatum = React.useMemo(() => {
    if (!activeKey) return null
    return (
      aggregated.chartData.find(
        (d) => String(d.category) === activeKey || d.name === activeKey
      ) ?? null
    )
  }, [aggregated.chartData, activeKey])

  if (isLoading) {
    return (
      <Card data-testid="investment-allocation-loading">
        <CardHeader className="pb-2">
          <div className="h-5 w-48 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="flex animate-pulse flex-col items-center gap-6 py-4 sm:flex-row">
            <div className="h-[220px] w-[220px] shrink-0 rounded-full border-[24px] border-muted" />
            <div className="w-full flex-1 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-9 w-full rounded-lg bg-muted" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-testid="investment-allocation-donut">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <PieChartIcon className="size-4 text-primary" />
          Distribuição por Macroclasse
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Alocação consolidada da sua carteira entre classes de ativos
        </p>
      </CardHeader>

      <CardContent>
        {aggregated.chartData.length === 0 ? (
          <div
            data-testid="investment-allocation-empty"
            className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground"
          >
            Nenhuma posição registrada ainda. Adicione uma alocação ao lado para
            visualizar a distribuição da carteira.
          </div>
        ) : (
          <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-2 xl:grid-cols-1">
            <DonutChart
              data={aggregated.chartData}
              activeKey={activeDatum ? String(activeDatum.category) : null}
              onActiveKeyChange={setActiveKey}
              centerLabel={
                activeDatum
                  ? formatCurrencyBRL(activeDatum.amount)
                  : formatCurrencyBRL(aggregated.total)
              }
              centerSubLabel={
                activeDatum ? activeDatum.name : "Patrimônio Alocado"
              }
              centerDetail={
                activeDatum
                  ? formatPercentage(activeDatum.percentage)
                  : `${aggregated.chartData.length} classes`
              }
              height={240}
            />

            <BarList
              data={aggregated.barItems}
              activeKey={activeDatum ? String(activeDatum.category) : null}
              onItemHover={(key) => {
                setActiveKey(key)
              }}
              valueFormatter={(v) => formatCurrencyBRL(v)}
              ariaLabel="Alocação por macroclasse de investimento"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
