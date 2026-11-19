import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import InvestmentsPage from "./page"

const mockUseAccounts = vi.fn()
const mockUseTransactions = vi.fn()

vi.mock("@/hooks/use-accounts", () => ({
  useAccounts: () => mockUseAccounts(),
}))

vi.mock("@/hooks/use-investments", () => ({
  useInvestmentPortfolio: () => ({
    portfolio: {
      totalInvested: 97000,
      riskProfile: "MODERATE",
      holdings: [
        { macroClass: "FIXED_INCOME", amount: 57000, percentage: 58.8 },
        { macroClass: "EQUITIES", amount: 25000, percentage: 25.8 },
        { macroClass: "CASH_LIQUIDITY", amount: 15000, percentage: 15.4 },
      ],
      allocationDiagnosis: {
        adherentToRiskProfile: true,
        recommendations: ["Alocação compatível com perfil Moderado."],
      },
    },
    isLoading: false,
  }),
  useUpsertInvestmentHolding: () => ({
    upsertHolding: vi.fn(),
    isPending: false,
  }),
}))

vi.mock("@/hooks/use-transactions", () => ({
  useTransactions: (filters: unknown) => mockUseTransactions(filters),
}))

describe("InvestmentsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAccounts.mockReturnValue({
      accounts: [
        {
          id: "acc-inv-1",
          name: "XP Investimentos",
          type: "INVESTMENT",
          balance: 97000,
          initialBalance: 80000,
          institution: "XP",
          color: "#10b981",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-11-01T00:00:00Z",
        },
      ],
      netWorth: 97000,
      isLoading: false,
      isError: false,
    })
    mockUseTransactions.mockReturnValue({
      transactions: [],
      isLoading: false,
    })
  })

  it("renders dedicated investments page with KPIs, donut chart, portfolio card, and series chart", () => {
    render(<InvestmentsPage />)

    expect(screen.getByTestId("investments-page")).toBeInTheDocument()
    expect(screen.getByText("Carteira de Investimentos")).toBeInTheDocument()
    expect(screen.getAllByText(/97\.000,00/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Moderado")).toBeInTheDocument()
    expect(screen.getByText("Aderente ao Perfil")).toBeInTheDocument()
    expect(screen.getByTestId("investment-allocation-donut")).toBeInTheDocument()
    expect(screen.getByTestId("investment-portfolio-card")).toBeInTheDocument()
    expect(screen.getByTestId("investment-chart-empty")).toBeInTheDocument()
  })

  it("ignores checking account transactions in the investment evolution chart", () => {
    mockUseAccounts.mockReturnValue({
      accounts: [
        {
          id: "acc-chk-1",
          name: "Conta Corrente",
          type: "CHECKING",
          balance: 34.9,
          initialBalance: 0,
          institution: "Banco",
          color: "#3b82f6",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-11-01T00:00:00Z",
        },
      ],
      netWorth: 34.9,
      isLoading: false,
      isError: false,
    })
    mockUseTransactions.mockReturnValue({
      transactions: [
        {
          id: "t-chk",
          externalId: "e-chk",
          rawDescription: "PIX",
          cleanDescription: "Pix",
          amount: 1500,
          date: "2026-11-05T10:00:00Z",
          category: "Não Categorizado",
          source: "OFX",
          accountId: "acc-chk-1",
        },
      ],
      isLoading: false,
    })

    render(<InvestmentsPage />)

    expect(screen.getByTestId("investment-chart-empty")).toBeInTheDocument()
    expect(
      screen.getByText("Sem movimentações em contas de investimento")
    ).toBeInTheDocument()
  })
})
