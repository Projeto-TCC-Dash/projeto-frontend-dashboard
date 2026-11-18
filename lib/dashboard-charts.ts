import type {
  Account,
  AccountType,
  CategoryMetric,
  FinancialMetrics,
  Transaction,
} from "@/src/types/api"
import { ACCOUNT_TYPE_LABELS } from "@/src/types/api"
import type {
  AccountAllocationSegment,
  BarListItem,
  CashflowPoint,
  CategoryChartDatum,
  CumulativeDailyCashflowPoint,
  MultiMonthEvolutionPoint,
  MultiMonthHorizon,
  TremorColor,
  TrendMetric,
} from "@/src/types/charts"
import {
  resolveCategoryColor,
  resolveCategoryTremorColor,
} from "@/lib/chart-utils"

const MONTH_NAMES_SHORT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
] as const

function formatYearMonthShortLabel(yearMonth: string): string {
  const parts = yearMonth.split("-")
  if (parts.length !== 2) return yearMonth
  const year = parts[0]
  const monthIdx = parseInt(parts[1], 10) - 1
  const monthName = MONTH_NAMES_SHORT[monthIdx] ?? parts[1]
  const shortYear = year.slice(-2)
  return `${monthName}/${shortYear}`
}

export function formatDayMonthLabel(isoDate: string): string {
  const datePart = isoDate.slice(0, 10)
  const parts = datePart.split("-")
  if (parts.length !== 3) return isoDate
  const [, month, day] = parts
  return `${day}/${month}`
}

function roundCents(value: number): number {
  return Math.round(value * 100) / 100
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

export function buildCumulativeDailyCashflowSeries(
  transactions: readonly Transaction[],
  metrics?: FinancialMetrics,
  month?: string
): CumulativeDailyCashflowPoint[] {
  const discretePoints = buildPeriodCashflowSeries(transactions, metrics, month)
  if (discretePoints.length === 0) return []

  let runningCumulative = 0

  return discretePoints.map((point) => {
    const dailyNet = roundCents(point.receitas - point.despesas - point.faturas)
    runningCumulative = roundCents(runningCumulative + dailyNet)

    return {
      label: point.label,
      isoDate: point.isoDate,
      receitas: point.receitas,
      despesas: point.despesas,
      faturas: point.faturas,
      dailyNet,
      cumulativeBalance: runningCumulative,
    }
  })
}

function generateContinuousMonths(
  startMonth: string,
  endMonth: string
): string[] {
  const [startYear, startM] = startMonth.split("-").map(Number)
  const [endYear, endM] = endMonth.split("-").map(Number)

  if (!startYear || !startM || !endYear || !endM) return [startMonth]

  const months: string[] = []
  let y = startYear
  let m = startM

  while (y < endYear || (y === endYear && m <= endM)) {
    const paddedM = String(m).padStart(2, "0")
    months.push(`${y}-${paddedM}`)
    m += 1
    if (m > 12) {
      m = 1
      y += 1
    }
  }

  return months
}

export function subtractMonths(yearMonth: string, count = 1): string {
  const [yearStr, monthStr] = yearMonth.split("-")
  let y = parseInt(yearStr, 10)
  let m = parseInt(monthStr, 10)

  for (let i = 0; i < count; i++) {
    m -= 1
    if (m < 1) {
      m = 12
      y -= 1
    }
  }

  return `${y}-${String(m).padStart(2, "0")}`
}

export function buildMultiMonthEvolutionSeries(
  transactions: readonly Transaction[],
  horizon: MultiMonthHorizon = "6M",
  referenceMonth?: string
): MultiMonthEvolutionPoint[] {
  if (transactions.length === 0) return []

  // Agrupar transações válidas por YYYY-MM
  const monthBuckets = new Map<
    string,
    { receitas: number; despesas: number; faturas: number }
  >()

  for (const tx of transactions) {
    if (!tx.date) continue
    const monthKey = tx.date.slice(0, 7) // 'YYYY-MM'
    const current = monthBuckets.get(monthKey) ?? {
      receitas: 0,
      despesas: 0,
      faturas: 0,
    }

    const amount = Math.abs(tx.amount)
    if (tx.category === "Receita") {
      current.receitas = roundCents(current.receitas + amount)
    } else if (tx.category === "Pagamento de Fatura") {
      current.faturas = roundCents(current.faturas + amount)
    } else {
      current.despesas = roundCents(current.despesas + amount)
    }

    monthBuckets.set(monthKey, current)
  }

  if (monthBuckets.size === 0) return []

  const allMonthsWithData = Array.from(monthBuckets.keys()).sort()
  const earliestMonth = allMonthsWithData[0]
  const latestMonth = referenceMonth || allMonthsWithData[allMonthsWithData.length - 1]

  let startMonth = earliestMonth
  if (horizon === "6M") {
    const cutoff = subtractMonths(latestMonth, 5)
    startMonth = cutoff > earliestMonth ? cutoff : earliestMonth
  } else if (horizon === "12M") {
    const cutoff = subtractMonths(latestMonth, 11)
    startMonth = cutoff > earliestMonth ? cutoff : earliestMonth
  }

  // Se startMonth for posterior a latestMonth, normaliza
  if (startMonth > latestMonth) {
    startMonth = latestMonth
  }

  const continuousMonths = generateContinuousMonths(startMonth, latestMonth)
  let cumulative = 0

  return continuousMonths.map((mKey) => {
    const data = monthBuckets.get(mKey) ?? {
      receitas: 0,
      despesas: 0,
      faturas: 0,
    }

    const netBalance = roundCents(
      data.receitas - data.despesas - data.faturas
    )
    cumulative = roundCents(cumulative + netBalance)

    return {
      month: mKey,
      label: formatYearMonthShortLabel(mKey),
      receitas: data.receitas,
      despesas: data.despesas,
      faturas: data.faturas,
      netBalance,
      cumulativeBalance: cumulative,
    }
  })
}

export function calculateMoMTrend(
  currentValue: number,
  previousValue?: number,
  isExpense = false
): TrendMetric | null {
  if (
    previousValue === undefined ||
    !Number.isFinite(previousValue) ||
    previousValue === 0
  ) {
    return null
  }

  const diff = currentValue - previousValue
  const rate = Math.round((Math.abs(diff) / Math.abs(previousValue)) * 1000) / 10

  if (diff === 0) {
    return {
      rate: 0,
      direction: "neutral",
      isPositive: true,
      label: "0,0% vs mês ant.",
    }
  }

  const direction = diff > 0 ? "up" : "down"
  // Para despesas: subir é negativo financeiramente, descer é positivo
  const isPositive = isExpense ? diff < 0 : diff > 0
  const sign = diff > 0 ? "+" : "-"
  const formattedRate = rate.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })

  return {
    rate,
    direction,
    isPositive,
    label: `${sign}${formattedRate}% vs mês ant.`,
  }
}

const ACCOUNT_ALLOCATION_COLORS: Record<
  AccountType,
  { color: string; tremorColor: TremorColor }
> = {
  CHECKING: { color: "#3b82f6", tremorColor: "blue" },
  INVESTMENT: { color: "#8b5cf6", tremorColor: "violet" },
  CASH: { color: "#10b981", tremorColor: "emerald" },
  CREDIT_CARD: { color: "#ef4444", tremorColor: "rose" },
  OTHER: { color: "#64748b", tremorColor: "slate" },
}

export function buildAccountAllocationSegments(
  accounts: readonly Account[]
): AccountAllocationSegment[] {
  if (accounts.length === 0) return []

  const balancesByType = new Map<AccountType, number>()

  for (const acc of accounts) {
    const cur = balancesByType.get(acc.type) ?? 0
    balancesByType.set(acc.type, cur + Math.max(0, acc.balance))
  }

  const totalPositiveBalance = Array.from(balancesByType.values()).reduce(
    (sum, val) => sum + val,
    0
  )

  if (totalPositiveBalance === 0) return []

  const segments: AccountAllocationSegment[] = []

  for (const [type, balance] of balancesByType.entries()) {
    if (balance <= 0) continue
    const percentage = roundCents((balance / totalPositiveBalance) * 100)
    const colorInfo = ACCOUNT_ALLOCATION_COLORS[type] ?? {
      color: "#64748b",
      tremorColor: "slate",
    }

    segments.push({
      type,
      label: ACCOUNT_TYPE_LABELS[type] ?? type,
      balance: roundCents(balance),
      percentage,
      color: colorInfo.color,
      tremorColor: colorInfo.tremorColor,
    })
  }

  return segments.sort((a, b) => b.balance - a.balance)
}

export function calculateEmergencyFundTarget(
  incomeType?: string,
  declaredIncome?: number,
  fallbackExpenses?: number
): number | undefined {
  const base =
    declaredIncome && declaredIncome > 0
      ? declaredIncome
      : fallbackExpenses && fallbackExpenses > 0
        ? fallbackExpenses
        : 0

  if (base <= 0) return undefined

  let months = 6
  if (incomeType === "PJ_AUTONOMO") months = 9
  else if (incomeType === "PUBLIC_SERVANT") months = 4
  else if (incomeType === "CLT") months = 6

  return roundCents(base * months)
}

export function calculateFinancialMetricsFromTransactions(
  transactions: readonly Transaction[]
): FinancialMetrics {
  let totalIncome = 0
  let totalExpenses = 0
  let invoiceSettlements = 0
  const catExpenses = new Map<string, number>()

  for (const tx of transactions) {
    const absVal = Math.abs(tx.amount)
    const cat = tx.category || "Outros"

    if (cat === "Receita") {
      totalIncome += absVal
    } else if (cat === "Pagamento de Fatura") {
      invoiceSettlements += absVal
    } else {
      totalExpenses += absVal
      catExpenses.set(cat, (catExpenses.get(cat) ?? 0) + absVal)
    }
  }

  const roundedIncome = roundCents(totalIncome)
  const roundedExpenses = roundCents(totalExpenses)
  const roundedInvoices = roundCents(invoiceSettlements)
  const netBalance = roundCents(roundedIncome - roundedExpenses)

  const savingsRate =
    roundedIncome > 0
      ? Math.max(
          0,
          Math.round(((roundedIncome - roundedExpenses) / roundedIncome) * 1000) /
            10
        )
      : 0

  const topCategories = Array.from(catExpenses.entries())
    .map(([category, amount]) => {
      const roundedAmount = roundCents(amount)
      const percentage =
        roundedExpenses > 0
          ? Math.round((roundedAmount / roundedExpenses) * 1000) / 10
          : 0
      return { category, amount: roundedAmount, percentage }
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  return {
    totalIncome: roundedIncome,
    totalExpenses: roundedExpenses,
    invoiceSettlements: roundedInvoices,
    netBalance,
    savingsRate,
    topCategories,
  }
}



