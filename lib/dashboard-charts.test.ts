import { describe, expect, it } from "vitest"
import {
  buildCategoryBarListItems,
  buildCategoryChartData,
  buildCategoryDrillDownHref,
  buildPeriodCashflowSeries,
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
})
