import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import * as React from "react"
import DashboardPage from "./page"
import { FinancialAnalysis, UserProfileResponse } from "@/src/types/api"

const mockAnalysis: FinancialAnalysis = {
  cached: true,
  month: "2026-10",
  diagnosis: "Parabéns pela gestão equilibrada do orçamento.",
  recommendations: ["Mantenha a reserva de emergência."],
  metrics: {
    totalIncome: 10000,
    totalExpenses: 4000,
    invoiceSettlements: 2000,
    netBalance: 6000,
    savingsRate: 60,
    topCategories: [{ category: "Alimentação", amount: 2000, percentage: 50 }],
  },
  generatedAt: "2026-10-19T10:00:00Z",
  expiresAt: "2026-10-20T10:00:00Z",
}

const mockUserProfile: UserProfileResponse = {
  id: "user-1",
  email: "teste@exemplo.com",
  hasAiKey: true,
  financialProfile: {
    incomeType: "CLT",
    declaredMonthlyIncome: 10000,
    goals: ["RESERVA_EMERGENCIA"],
  },
}

let mockAnalysisHookReturn = {
  analysis: mockAnalysis as FinancialAnalysis | null,
  metrics: mockAnalysis.metrics as FinancialAnalysis["metrics"] | null,
  isLoading: false,
  isRefreshing: false,
  error: null as Error | null,
  refreshAnalysis: vi.fn(),
}

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "user-1", email: "teste@exemplo.com", hasAiKey: true },
  }),
}))

vi.mock("@/hooks/use-user-profile", () => ({
  useUserProfile: () => ({
    data: mockUserProfile,
    isLoading: false,
  }),
}))

vi.mock("@/hooks/use-financial-analysis", () => ({
  useFinancialAnalysis: () => mockAnalysisHookReturn,
}))

vi.mock("@/hooks/use-budgets", () => ({
  useBudget: () => ({
    budget: {
      month: "2026-10",
      totalLimitAmount: 6500,
      totalSpentAmount: 4200,
      totalRemainingAmount: 2300,
      globalPercentConsumed: 64.6,
      globalStatus: "REGULAR",
      categories: [
        {
          category: "Alimentação",
          limitAmount: 2500,
          spentAmount: 1850,
          remainingAmount: 650,
          percentConsumed: 74,
          status: "WARNING",
        },
      ],
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useUpsertBudget: () => ({
    upsertBudget: vi.fn(),
    isSaving: false,
  }),
}))

vi.mock("@/hooks/use-multi-month-analysis", () => ({
  useMultiMonthAnalysis: () => ({
    analysis: {
      rangeMonths: 6,
      averageSavingsRate: 28.4,
      averageMonthlyExpenses: 4250,
      averageMonthlyIncome: 9500,
      fixedCostTrend: {
        status: "STABLE",
        percentageChange: 1.5,
      },
      monthlyHistory: [],
    },
    isLoading: false,
  }),
}))

vi.mock("@/hooks/use-transactions", () => ({
  useTransactions: () => ({
    transactions: [
      {
        id: "tx-1",
        amount: 10000,
        date: "2026-10-05T10:00:00Z",
        category: "Receita",
        source: "OFX",
      },
      {
        id: "tx-2",
        amount: 2000,
        date: "2026-10-08T10:00:00Z",
        category: "Alimentação",
        source: "CSV",
      },
    ],
    isLoading: false,
    isFetching: false,
    isSuccess: true,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe("DashboardPage Integration", () => {
  beforeEach(() => {
    mockAnalysisHookReturn = {
      analysis: mockAnalysis,
      metrics: mockAnalysis.metrics,
      isLoading: false,
      isRefreshing: false,
      error: null,
      refreshAnalysis: vi.fn(),
    }
  })

  it("renders header, kpi cards with invoice settlements, donut chart and ai diagnosis card with calibrated guideline", () => {
    render(<DashboardPage />)

    // Header & KPIs
    expect(screen.getByText("Receitas Totais")).toBeInTheDocument()
    expect(screen.getByText("Despesas Primárias")).toBeInTheDocument()
    expect(screen.getByText("Quitação de Faturas")).toBeInTheDocument()
    expect(screen.getByText("Saldo Líquido")).toBeInTheDocument()

    // Values: 10000 - 4000 - 2000 = +4000
    expect(screen.getByText("R$ 10.000,00")).toBeInTheDocument()
    expect(screen.getByText("R$ 4.000,00")).toBeInTheDocument()
    expect(screen.getAllByText("R$ 2.000,00").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("+R$ 4.000,00")).toBeInTheDocument()

    // Calibrated reserve guideline
    expect(
      screen.getByTestId("emergency-reserve-guideline")
    ).toBeInTheDocument()
    expect(screen.getByText("CLT • Meta: 3 a 6 meses")).toBeInTheDocument()

    // AI diagnosis content
    expect(
      screen.getByText("Parabéns pela gestão equilibrada do orçamento.")
    ).toBeInTheDocument()

    // Bento Grid 7/5 layout with stacked left analytics cards and matched-height right card
    const bentoGrid = screen.getByTestId("dashboard-bento-grid")
    expect(bentoGrid.className).toContain("grid-cols-1")
    expect(bentoGrid.className).toContain("xl:grid-cols-12")
    expect(bentoGrid.className).not.toContain("xl:items-start")

    const analyticsSlot = screen.getByTestId("bento-analytics-slot")
    expect(analyticsSlot.className).toContain("xl:col-span-7")
    expect(analyticsSlot.className).toContain("flex-col")

    const categoriesCard = screen.getByTestId("category-donut-chart")
    const cashflowCard = screen.getByTestId("period-cashflow-card")
    expect(analyticsSlot).toContainElement(categoriesCard)
    expect(analyticsSlot).toContainElement(cashflowCard)
    expect(screen.queryByRole("tab")).toBeNull()

    const diagnosisSlot = screen.getByTestId("bento-diagnosis-slot")
    expect(diagnosisSlot.className).toContain("xl:col-span-5")
    expect(diagnosisSlot.className).toContain("xl:relative")
    expect(screen.getByTestId("ai-diagnosis-card").className).toContain(
      "xl:inset-0"
    )
    expect(screen.getByTestId("ai-diagnosis-body").className).toContain(
      "xl:overflow-y-auto"
    )

    // Multi-month evolution chart slot
    expect(
      screen.getByTestId("multi-month-evolution-slot")
    ).toBeInTheDocument()
    expect(
      screen.getByTestId("multi-month-evolution-chart")
    ).toBeInTheDocument()
    expect(
      screen.getByText("Evolução Financeira Consolidada")
    ).toBeInTheDocument()
  })

  it("renders KPIs, donut chart and cashflow immediately from transactions even while AI analysis is pending", () => {
    mockAnalysisHookReturn = {
      analysis: null,
      metrics: null,
      isLoading: true,
      isRefreshing: false,
      error: null,
      refreshAnalysis: vi.fn(),
    }

    render(<DashboardPage />)

    // KPIs should NOT be stuck in skeleton; should reflect mock transactions (10000 income, 2000 Alimentação)
    expect(screen.queryByTestId("metric-cards-grid-loading")).toBeNull()
    expect(screen.getByText("Receitas Totais")).toBeInTheDocument()
    expect(screen.getByText("R$ 10.000,00")).toBeInTheDocument()
    expect(screen.getAllByText("R$ 2.000,00").length).toBeGreaterThanOrEqual(1)

    // Donut and cashflow should render immediately
    expect(screen.getByTestId("category-donut-chart")).toBeInTheDocument()
    expect(screen.getByTestId("period-cashflow-card")).toBeInTheDocument()
    expect(screen.queryByTestId("cashflow-chart-loading")).toBeNull()

    // Multi-month evolution should render immediately
    expect(
      screen.getByTestId("multi-month-evolution-chart")
    ).toBeInTheDocument()
  })
})
