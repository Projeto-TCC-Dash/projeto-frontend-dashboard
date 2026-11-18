import { describe, expect, it } from "vitest"
import {
  buildAccountAllocationSegments,
  buildCategoryBarListItems,
  buildCategoryChartData,
  buildCategoryDrillDownHref,
  buildCumulativeDailyCashflowSeries,
  buildMultiMonthEvolutionSeries,
  buildPeriodCashflowSeries,
  calculateFinancialMetricsFromTransactions,
  calculateMoMTrend,
  hasInvoiceSettlementsInCashflow,
} from "@/lib/dashboard-charts"
import {
  formatCompactCurrencyBRL,
  resolveCategoryColor,
  resolveCategoryTremorColor,
} from "@/lib/chart-utils"
import type {
  CategoryMetric,
  FinancialMetrics,
  Transaction,
} from "@/src/types/api"

describe("lib/dashboard-charts", () => {
  it("builds category drill-down URL with encoded month and category", () => {
    expect(buildCategoryDrillDownHref("2026-11", "Moradia")).toBe(
      "/transactions?month=2026-11&category=Moradia"
    )
    expect(buildCategoryDrillDownHref("2026-11", "Pagamento de Fatura")).toBe(
      "/transactions?month=2026-11&category=Pagamento+de+Fatura"
    )
  })

  it("maps category metrics to chart data and bar list items with canonical colors", () => {
    const categories: CategoryMetric[] = [
      { category: "Moradia", amount: 2500.456, percentage: 62.5 },
      { category: "Alimentação", amount: 1500, percentage: 37.5 },
    ]

    const chartData = buildCategoryChartData(categories, "2026-11")
    expect(chartData).toEqual([
      {
        category: "Moradia",
        name: "Moradia",
        amount: 2500.46,
        percentage: 62.5,
        color: "#8b5cf6",
        colorName: "violet",
        href: "/transactions?month=2026-11&category=Moradia",
      },
      {
        category: "Alimentação",
        name: "Alimentação",
        amount: 1500,
        percentage: 37.5,
        color: "#f59e0b",
        colorName: "amber",
        href: "/transactions?month=2026-11&category=Alimenta%C3%A7%C3%A3o",
      },
    ])

    const barItems = buildCategoryBarListItems(categories, "2026-11")
    expect(barItems[0]).toMatchObject({
      key: "Moradia",
      name: "Moradia",
      value: 2500.46,
      percentage: 62.5,
      color: "#8b5cf6",
      colorName: "violet",
      href: "/transactions?month=2026-11&category=Moradia",
    })
  })

  it("groups transactions chronologically while isolating Pagamento de Fatura from primary expenses", () => {
    const transactions: Transaction[] = [
      {
        id: "t1",
        externalId: "ext-1",
        rawDescription: "PGTO FATURA ITAU",
        cleanDescription: "Pagamento Fatura Itaú",
        amount: 2000,
        date: "2026-11-10T12:00:00Z",
        category: "Pagamento de Fatura",
        source: "OFX",
      },
      {
        id: "t2",
        externalId: "ext-2",
        rawDescription: "SUPERMERCADO EXTRA",
        cleanDescription: "Supermercado",
        amount: 450.25,
        date: "2026-11-05T10:00:00Z",
        category: "Alimentação",
        source: "CSV",
      },
      {
        id: "t3",
        externalId: "ext-3",
        rawDescription: "SALARIO",
        cleanDescription: "Salário",
        amount: 8000,
        date: "2026-11-05T08:00:00Z",
        category: "Receita",
        source: "SEED",
      },
      {
        id: "t4",
        externalId: "ext-4",
        rawDescription: "CONDOMINIO EDIF",
        cleanDescription: "Condomínio",
        amount: 1549.75,
        date: "2026-11-10T15:00:00Z",
        category: "Moradia",
        source: "OFX",
      },
    ]

    const series = buildPeriodCashflowSeries(transactions)

    expect(series).toEqual([
      {
        label: "05/11",
        isoDate: "2026-11-05",
        receitas: 8000,
        despesas: 450.25,
        faturas: 0,
      },
      {
        label: "10/11",
        isoDate: "2026-11-10",
        receitas: 0,
        despesas: 1549.75,
        faturas: 2000,
      },
    ])

    expect(hasInvoiceSettlementsInCashflow(series)).toBe(true)
  })

  it("falls back to consolidated monthly totals when transactions list is empty and metrics exist", () => {
    const metrics: FinancialMetrics = {
      totalIncome: 10000,
      totalExpenses: 4000,
      invoiceSettlements: 2000,
      netBalance: 4000,
      savingsRate: 60,
      topCategories: [],
    }

    expect(buildPeriodCashflowSeries([], metrics, "2026-11")).toEqual([
      {
        label: "Resumo",
        isoDate: "2026-11",
        receitas: 10000,
        despesas: 4000,
        faturas: 2000,
      },
    ])
  })

  it("returns empty array when both transactions and metrics have zero values", () => {
    const emptyMetrics: FinancialMetrics = {
      totalIncome: 0,
      totalExpenses: 0,
      invoiceSettlements: 0,
      netBalance: 0,
      savingsRate: 0,
      topCategories: [],
    }

    expect(buildPeriodCashflowSeries([], emptyMetrics)).toEqual([])
    expect(buildPeriodCashflowSeries([])).toEqual([])
  })

  it("resolves fallback colors and compact BRL labels safely", () => {
    expect(resolveCategoryColor("Categoria Desconhecida")).toBe("#64748b")
    expect(resolveCategoryTremorColor("Categoria Desconhecida")).toBe("slate")
    expect(formatCompactCurrencyBRL(12500)).toBe("R$ 12,5 mil")
    expect(formatCompactCurrencyBRL(1500000)).toBe("R$ 1,5 mi")
    expect(formatCompactCurrencyBRL(250)).toContain("250,00")
  })

  describe("buildCumulativeDailyCashflowSeries", () => {
    it("accumulates daily net balances throughout the month in chronological order", () => {
      const transactions: Transaction[] = [
        {
          id: "t1",
          externalId: "ext-1",
          rawDescription: "SALARIO",
          cleanDescription: "Salário",
          amount: 5000,
          date: "2026-11-05T08:00:00Z",
          category: "Receita",
          source: "SEED",
        },
        {
          id: "t2",
          externalId: "ext-2",
          rawDescription: "MERCADO",
          cleanDescription: "Mercado",
          amount: 500,
          date: "2026-11-06T10:00:00Z",
          category: "Alimentação",
          source: "CSV",
        },
        {
          id: "t3",
          externalId: "ext-3",
          rawDescription: "FATURA",
          cleanDescription: "Fatura",
          amount: 1000,
          date: "2026-11-10T12:00:00Z",
          category: "Pagamento de Fatura",
          source: "OFX",
        },
      ]

      const cumulative = buildCumulativeDailyCashflowSeries(transactions)
      expect(cumulative).toHaveLength(3)

      expect(cumulative[0]).toMatchObject({
        isoDate: "2026-11-05",
        receitas: 5000,
        despesas: 0,
        faturas: 0,
        dailyNet: 5000,
        cumulativeBalance: 5000,
      })

      expect(cumulative[1]).toMatchObject({
        isoDate: "2026-11-06",
        receitas: 0,
        despesas: 500,
        faturas: 0,
        dailyNet: -500,
        cumulativeBalance: 4500,
      })

      expect(cumulative[2]).toMatchObject({
        isoDate: "2026-11-10",
        receitas: 0,
        despesas: 0,
        faturas: 1000,
        dailyNet: -1000,
        cumulativeBalance: 3500,
      })
    })

    it("returns empty array when transactions is empty", () => {
      expect(buildCumulativeDailyCashflowSeries([])).toEqual([])
    })
  })

  describe("buildMultiMonthEvolutionSeries", () => {
    it("aggregates transactions across multiple months and computes ascending cumulative balance", () => {
      const transactions: Transaction[] = [
        {
          id: "t1",
          externalId: "ext-1",
          rawDescription: "SALARIO SET",
          cleanDescription: "Salário Setembro",
          amount: 6000,
          date: "2026-09-05T08:00:00Z",
          category: "Receita",
          source: "SEED",
        },
        {
          id: "t2",
          externalId: "ext-2",
          rawDescription: "ALUGUEL SET",
          cleanDescription: "Aluguel Setembro",
          amount: 2000,
          date: "2026-09-10T10:00:00Z",
          category: "Moradia",
          source: "OFX",
        },
        {
          id: "t3",
          externalId: "ext-3",
          rawDescription: "SALARIO OUT",
          cleanDescription: "Salário Outubro",
          amount: 6000,
          date: "2026-10-05T08:00:00Z",
          category: "Receita",
          source: "SEED",
        },
        {
          id: "t4",
          externalId: "ext-4",
          rawDescription: "GASTOS OUT",
          cleanDescription: "Gastos Outubro",
          amount: 3000,
          date: "2026-10-12T10:00:00Z",
          category: "Alimentação",
          source: "CSV",
        },
      ]

      const series = buildMultiMonthEvolutionSeries(
        transactions,
        "6M",
        "2026-10"
      )

      // Setembro net: 6000 - 2000 = 4000 (cumulativo: 4000)
      // Outubro net: 6000 - 3000 = 3000 (cumulativo: 7000)
      const sep = series.find((p) => p.month === "2026-09")
      const oct = series.find((p) => p.month === "2026-10")

      expect(sep).toBeDefined()
      expect(sep?.receitas).toBe(6000)
      expect(sep?.despesas).toBe(2000)
      expect(sep?.netBalance).toBe(4000)
      expect(sep?.cumulativeBalance).toBe(4000)

      expect(oct).toBeDefined()
      expect(oct?.receitas).toBe(6000)
      expect(oct?.despesas).toBe(3000)
      expect(oct?.netBalance).toBe(3000)
      expect(oct?.cumulativeBalance).toBe(7000)
    })

    it("fills gap months maintaining cumulative balance flatline without drop to zero", () => {
      const transactions: Transaction[] = [
        {
          id: "t1",
          externalId: "ext-1",
          rawDescription: "SALARIO JAN",
          cleanDescription: "Salário Janeiro",
          amount: 5000,
          date: "2026-01-05T08:00:00Z",
          category: "Receita",
          source: "SEED",
        },
        {
          id: "t2",
          externalId: "ext-2",
          rawDescription: "SALARIO MAR",
          cleanDescription: "Salário Março",
          amount: 5000,
          date: "2026-03-05T08:00:00Z",
          category: "Receita",
          source: "SEED",
        },
      ]

      const series = buildMultiMonthEvolutionSeries(
        transactions,
        "ALL",
        "2026-03"
      )

      const jan = series.find((p) => p.month === "2026-01")
      const feb = series.find((p) => p.month === "2026-02")
      const mar = series.find((p) => p.month === "2026-03")

      expect(jan?.cumulativeBalance).toBe(5000)
      expect(feb).toBeDefined()
      expect(feb?.receitas).toBe(0)
      expect(feb?.despesas).toBe(0)
      expect(feb?.cumulativeBalance).toBe(5000) // Sustained
      expect(mar?.cumulativeBalance).toBe(10000)
    })
  })

  describe("calculateMoMTrend", () => {
    it("computes positive trend for revenue increase and negative for expense increase", () => {
      const incomeTrend = calculateMoMTrend(11000, 10000, false)
      expect(incomeTrend).toMatchObject({
        rate: 10,
        direction: "up",
        isPositive: true,
      })
      expect(incomeTrend?.label).toContain("+10")

      const expenseTrend = calculateMoMTrend(6000, 5000, true)
      expect(expenseTrend).toMatchObject({
        rate: 20,
        direction: "up",
        isPositive: false, // More expenses is financially negative
      })

      const expenseReduction = calculateMoMTrend(4000, 5000, true)
      expect(expenseReduction).toMatchObject({
        rate: 20,
        direction: "down",
        isPositive: true, // Lower expenses is financially positive
      })
    })

    it("returns null when previous value is zero or undefined", () => {
      expect(calculateMoMTrend(5000, 0, false)).toBeNull()
      expect(calculateMoMTrend(5000, undefined, false)).toBeNull()
    })
  })

  describe("buildAccountAllocationSegments", () => {
    it("calculates allocation segments with percentages and colors", () => {
      const accounts = [
        {
          id: "1",
          name: "Itaú",
          type: "CHECKING" as const,
          balance: 3000,
          initialBalance: 0,
          color: "#3b82f6",
          createdAt: "",
          updatedAt: "",
        },
        {
          id: "2",
          name: "Nubank Invest",
          type: "INVESTMENT" as const,
          balance: 7000,
          initialBalance: 0,
          color: "#8b5cf6",
          createdAt: "",
          updatedAt: "",
        },
      ]

      const segments = buildAccountAllocationSegments(accounts)
      expect(segments).toHaveLength(2)

      const checking = segments.find((s) => s.type === "CHECKING")
      const investment = segments.find((s) => s.type === "INVESTMENT")

      expect(checking?.percentage).toBe(30)
      expect(investment?.percentage).toBe(70)
    })
  })

  describe("calculateFinancialMetricsFromTransactions", () => {
    it("computes totals, invoice settlements, savings rate and top 5 categories matching backend rules", () => {
      const transactions: Transaction[] = [
        {
          id: "1",
          externalId: "e1",
          rawDescription: "SALARIO",
          cleanDescription: "Salário",
          amount: 10000,
          date: "2026-11-05T10:00:00Z",
          category: "Receita",
          source: "SEED",
        },
        {
          id: "2",
          externalId: "e2",
          rawDescription: "ALUGUEL",
          cleanDescription: "Aluguel",
          amount: -2500,
          date: "2026-11-06T10:00:00Z",
          category: "Moradia",
          source: "SEED",
        },
        {
          id: "3",
          externalId: "e3",
          rawDescription: "SUSHI",
          cleanDescription: "Restaurante",
          amount: -500,
          date: "2026-11-07T10:00:00Z",
          category: "Alimentação",
          source: "SEED",
        },
        {
          id: "4",
          externalId: "e4",
          rawDescription: "FATURA",
          cleanDescription: "Pagamento de Fatura",
          amount: -1500,
          date: "2026-11-08T10:00:00Z",
          category: "Pagamento de Fatura",
          source: "SEED",
        },
      ]

      const result = calculateFinancialMetricsFromTransactions(transactions)
      expect(result.totalIncome).toBe(10000)
      expect(result.totalExpenses).toBe(3000)
      expect(result.invoiceSettlements).toBe(1500)
      expect(result.netBalance).toBe(7000)
      expect(result.savingsRate).toBe(70)
      expect(result.topCategories).toEqual([
        { category: "Moradia", amount: 2500, percentage: 83.3 },
        { category: "Alimentação", amount: 500, percentage: 16.7 },
      ])
    })

    it("returns zeroed metrics for empty transaction list", () => {
      expect(calculateFinancialMetricsFromTransactions([])).toEqual({
        totalIncome: 0,
        totalExpenses: 0,
        invoiceSettlements: 0,
        netBalance: 0,
        savingsRate: 0,
        topCategories: [],
      })
    })
  })
})
