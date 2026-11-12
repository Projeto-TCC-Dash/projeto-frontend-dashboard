import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import * as React from "react"
import { PeriodCashflowCard } from "./period-cashflow-card"
import type { FinancialMetrics, Transaction } from "@/src/types/api"

let mockTransactions: Transaction[] = []
let mockTransactionsLoading = false

vi.mock("@/hooks/use-transactions", () => ({
  useTransactions: () => ({
    transactions: mockTransactions,
    isLoading: mockTransactionsLoading,
    isFetching: false,
    isSuccess: !mockTransactionsLoading,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}))

describe("PeriodCashflowCard", () => {
  const sampleMetrics: FinancialMetrics = {
    totalIncome: 10000,
    totalExpenses: 4000,
    invoiceSettlements: 2000,
    netBalance: 4000,
    savingsRate: 60,
    topCategories: [
      { category: "Moradia", amount: 2500, percentage: 62.5 },
      { category: "Alimentação", amount: 1500, percentage: 37.5 },
    ],
  }

  beforeEach(() => {
    mockTransactionsLoading = false
    mockTransactions = [
      {
        id: "t1",
        externalId: "ext-t1",
        rawDescription: "SALARIO MENSAL",
        cleanDescription: "Salário Mensal",
        amount: 10000,
        date: "2026-10-05T10:00:00Z",
        category: "Receita",
        source: "OFX",
      },
      {
        id: "t2",
        externalId: "ext-t2",
        rawDescription: "ALUGUEL RESIDENCIAL",
        cleanDescription: "Aluguel",
        amount: 2500,
        date: "2026-10-08T10:00:00Z",
        category: "Moradia",
        source: "OFX",
      },
      {
        id: "t3",
        externalId: "ext-t3",
        rawDescription: "PAGAMENTO FATURA CARTAO",
        cleanDescription: "Fatura Cartão",
        amount: 2000,
        date: "2026-10-12T10:00:00Z",
        category: "Pagamento de Fatura",
        source: "CSV",
      },
    ]
  })

  it("renders standalone Fluxo do Período card without tabs showing Receitas, Despesas, and Faturas", () => {
    render(<PeriodCashflowCard metrics={sampleMetrics} month="2026-10" />)

    expect(screen.getByTestId("period-cashflow-card")).toBeInTheDocument()
    expect(screen.getByText("Fluxo do Período")).toBeInTheDocument()
    expect(screen.queryByRole("tab")).toBeNull()
    expect(screen.getByTestId("tremor-bar-chart")).toBeInTheDocument()
    expect(screen.getByText("Receitas")).toBeInTheDocument()
    expect(screen.getByText("Despesas")).toBeInTheDocument()
    expect(screen.getByText("Faturas")).toBeInTheDocument()
  })

  it("omits Faturas series when invoice settlements are zero", () => {
    mockTransactions = mockTransactions.filter(
      (tx) => tx.category !== "Pagamento de Fatura"
    )

    render(
      <PeriodCashflowCard
        metrics={{ ...sampleMetrics, invoiceSettlements: 0 }}
        month="2026-10"
      />
    )

    expect(screen.getByTestId("tremor-bar-chart")).toBeInTheDocument()
    expect(screen.getByText("Receitas")).toBeInTheDocument()
    expect(screen.getByText("Despesas")).toBeInTheDocument()
    expect(screen.queryByText("Faturas")).toBeNull()
  })

  it("renders empty cashflow state when transactions and metrics are empty", () => {
    mockTransactions = []
    render(
      <PeriodCashflowCard
        metrics={{
          totalIncome: 0,
          totalExpenses: 0,
          invoiceSettlements: 0,
          netBalance: 0,
          savingsRate: 0,
          topCategories: [],
        }}
        month="2026-10"
      />
    )

    expect(screen.getByTestId("cashflow-chart-empty")).toBeInTheDocument()
  })

  it("renders cashflow loading state when transactions or metrics are loading", () => {
    mockTransactionsLoading = true
    render(<PeriodCashflowCard metrics={sampleMetrics} month="2026-10" />)

    expect(screen.getByTestId("cashflow-chart-loading")).toBeInTheDocument()
  })
})
