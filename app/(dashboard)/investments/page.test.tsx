import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import InvestmentsPage from "./page"

const mockUseAccounts = vi.fn()
const mockUseInvestmentPortfolio = vi.fn()
const mockUseTransactions = vi.fn()

vi.mock("@/hooks/use-accounts", () => ({
  useAccounts: () => mockUseAccounts(),
}))

vi.mock("@/hooks/use-investments", () => ({
  useInvestmentPortfolio: () => mockUseInvestmentPortfolio(),
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
    mockUseInvestmentPortfolio.mockReturnValue({
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
    })
  })

  it("renders dedicated investments page with KPIs, donut chart, portfolio card, and series chart", () => {
    render(<InvestmentsPage />)

    expect(screen.getByTestId("investments-page")).toBeInTheDocument()
    expect(screen.getByText("Carteira de Investimentos")).toBeInTheDocument()
    expect(screen.getAllByText(/97\.000,00/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Moderado")).toBeInTheDocument()
    expect(screen.getByText("Aderente ao Perfil")).toBeInTheDocument()
    const donut = screen.getByTestId("investment-allocation-donut")
    const emptyChart = screen.getByTestId("investment-chart-empty")
    expect(donut).toBeInTheDocument()
    expect(screen.getByTestId("investment-portfolio-card")).toBeInTheDocument()
    expect(emptyChart).toBeInTheDocument()
    expect(
      donut.compareDocumentPosition(emptyChart) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  it("renders the empty investment movements card above other dashboards when no investments are added", () => {
    mockUseInvestmentPortfolio.mockReturnValue({
      portfolio: {
        totalInvested: 0,
        riskProfile: "MODERATE",
        holdings: [],
        allocationDiagnosis: {
          adherentToRiskProfile: true,
          recommendations: [],
        },
      },
      isLoading: false,
    })

    render(<InvestmentsPage />)

    const emptyChart = screen.getByTestId("investment-chart-empty")
    const kpiTitle = screen.getByRole("heading", { name: "Total Investido" })
    const donut = screen.getByTestId("investment-allocation-donut")

    expect(
      screen.getByText("Sem movimentações em contas de investimento")
    ).toBeInTheDocument()
    expect(
      emptyChart.compareDocumentPosition(kpiTitle) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(
      emptyChart.compareDocumentPosition(donut) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  it("renders the empty investment movements card above KPIs and account CTA when there are no accounts or investments", () => {
    mockUseAccounts.mockReturnValue({
      accounts: [],
      netWorth: 0,
      isLoading: false,
      isError: false,
    })
    mockUseInvestmentPortfolio.mockReturnValue({
      portfolio: null,
      isLoading: false,
    })

    render(<InvestmentsPage />)

    const emptyChart = screen.getByTestId("investment-chart-empty")
    const kpiTitle = screen.getByRole("heading", { name: "Total Investido" })
    const noAccountsCta = screen.getByText(
      "Cadastre pelo menos uma conta ou corretora para registrar posições"
    )

    expect(
      emptyChart.compareDocumentPosition(kpiTitle) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(
      emptyChart.compareDocumentPosition(noAccountsCta) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
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
