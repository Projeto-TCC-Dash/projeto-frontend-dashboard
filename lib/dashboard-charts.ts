import type {
  CategoryMetric,
  FinancialMetrics,
  Transaction,
} from "@/src/types/api"
import type {
  BarListItem,
  CashflowPoint,
  CategoryChartDatum,
} from "@/src/types/charts"
import {
  resolveCategoryColor,
  resolveCategoryTremorColor,
} from "@/lib/chart-utils"

function roundCents(value: number): number {
  return Math.round(value * 100) / 100
}

function formatDayMonthLabel(isoDate: string): string {
  const datePart = isoDate.slice(0, 10)
  const parts = datePart.split("-")
  if (parts.length !== 3) return isoDate
  const [, month, day] = parts
  return `${day}/${month}`
}

export function buildCategoryDrillDownHref(
  month: string,
  category: string
): string {
  const params = new URLSearchParams({ month, category })
  return `/transactions?${params.toString()}`
}

export function buildCategoryChartData(
  categories: readonly CategoryMetric[],
  month?: string
): CategoryChartDatum[] {
  return categories.map((cat) => ({
    category: cat.category,
    name: cat.category,
    amount: roundCents(cat.amount),
    percentage: cat.percentage,
    color: resolveCategoryColor(cat.category),
    colorName: resolveCategoryTremorColor(cat.category),
    href: month ? buildCategoryDrillDownHref(month, cat.category) : undefined,
  }))
}

export function buildCategoryBarListItems(
  categories: readonly CategoryMetric[],
  month?: string
): BarListItem[] {
  return categories.map((cat) => ({
    key: cat.category,
    name: cat.category,
    value: roundCents(cat.amount),
    color: resolveCategoryColor(cat.category),
    colorName: resolveCategoryTremorColor(cat.category),
    percentage: cat.percentage,
    href: month ? buildCategoryDrillDownHref(month, cat.category) : undefined,
  }))
}

export function buildPeriodCashflowSeries(
  transactions: readonly Transaction[],
  metrics?: FinancialMetrics,
  month?: string
): CashflowPoint[] {
  if (transactions.length === 0) {
    if (!metrics) return []

    const invoiceSettlements = metrics.invoiceSettlements ?? 0
    const hasValues =
      metrics.totalIncome > 0 ||
      metrics.totalExpenses > 0 ||
      invoiceSettlements > 0

    if (!hasValues) return []

    return [
      {
        label: "Resumo",
        isoDate: month ?? "summary",
        receitas: roundCents(metrics.totalIncome),
        despesas: roundCents(metrics.totalExpenses),
        faturas: roundCents(invoiceSettlements),
      },
    ]
  }

  const buckets = new Map<string, CashflowPoint>()

  for (const tx of transactions) {
    const isoDate = tx.date ? tx.date.slice(0, 10) : "sem-data"
    const existing = buckets.get(isoDate) ?? {
      label: isoDate === "sem-data" ? "Sem data" : formatDayMonthLabel(isoDate),
      isoDate,
      receitas: 0,
      despesas: 0,
      faturas: 0,
    }

    const amount = Math.abs(tx.amount)

    if (tx.category === "Receita") {
      existing.receitas = roundCents(existing.receitas + amount)
    } else if (tx.category === "Pagamento de Fatura") {
      existing.faturas = roundCents(existing.faturas + amount)
    } else {
      existing.despesas = roundCents(existing.despesas + amount)
    }

    buckets.set(isoDate, existing)
  }

  return Array.from(buckets.values()).sort((a, b) =>
    a.isoDate.localeCompare(b.isoDate)
  )
}

export function hasInvoiceSettlementsInCashflow(
  points: readonly CashflowPoint[]
): boolean {
  return points.some((point) => point.faturas > 0)
}
