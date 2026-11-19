import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import * as React from "react"
import { InvestmentPortfolioCard } from "./investment-portfolio-card"
import type { Account, InvestmentPortfolioSummary } from "@/src/types/api"

describe("InvestmentPortfolioCard", () => {
  const sampleAccounts: Account[] = [
    {
      id: "acc-inv-1",
      name: "XP Investimentos",
      type: "INVESTMENT",
      balance: 50000,
      initialBalance: 50000,
      institution: "XP",
      color: "#8b5cf6",
      createdAt: "2026-10-01T00:00:00Z",
      updatedAt: "2026-10-01T00:00:00Z",
    },
  ]

  const samplePortfolio: InvestmentPortfolioSummary = {
    totalInvested: 50000,
    riskProfile: "CONSERVATIVE",
    holdings: [
      { macroClass: "FIXED_INCOME", amount: 35000, percentage: 70 },
      { macroClass: "EQUITIES", amount: 15000, percentage: 30 },
      { macroClass: "REAL_ESTATE", amount: 0, percentage: 0 },
      { macroClass: "INTERNATIONAL", amount: 0, percentage: 0 },
      { macroClass: "CRYPTO", amount: 0, percentage: 0 },
      { macroClass: "CASH_LIQUIDITY", amount: 0, percentage: 0 },
    ],
    allocationDiagnosis: {
      adherentToRiskProfile: false,
      recommendations: [
        "Sua carteira possui 30.0% em classes voláteis, acima do recomendado (máximo 20%) para o perfil Conservador.",
      ],
    },
  }

  it("renders total invested, risk badge, allocation diagnosis insights and macroclass BarList", () => {
    render(
      <InvestmentPortfolioCard
        portfolio={samplePortfolio}
        accounts={sampleAccounts}
      />
    )

    expect(
      screen.getByTestId("investment-portfolio-card")
    ).toBeInTheDocument()
    expect(screen.getByTestId("investment-total-value")).toHaveTextContent(
      "R$ 50.000,00"
    )
    expect(screen.getByText("Perfil Conservador")).toBeInTheDocument()
    expect(
      screen.getByText(/Insight de Alocação: Rebalanceamento Sugerido/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Sua carteira possui 30\.0% em classes voláteis/i)
    ).toBeInTheDocument()
    expect(screen.getByText("Renda Fixa")).toBeInTheDocument()
    expect(screen.getByText("Ações Brasil")).toBeInTheDocument()
  })

  it("opens modal and submits upsertHolding with selected account and macroclass", async () => {
    const onUpsertHolding = vi.fn().mockResolvedValue(samplePortfolio)

    render(
      <InvestmentPortfolioCard
        portfolio={samplePortfolio}
        accounts={sampleAccounts}
        onUpsertHolding={onUpsertHolding}
      />
    )

    fireEvent.click(screen.getByTestId("update-holding-button"))
    expect(
      screen.getByText("Atualizar Posição de Investimento")
    ).toBeInTheDocument()

    const amountInput = screen.getByLabelText(/Montante Atual/i)
    fireEvent.change(amountInput, { target: { value: "40000" } })

    const form = amountInput.closest("form")
    expect(form).not.toBeNull()
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(onUpsertHolding).toHaveBeenCalledWith({
        accountId: "acc-inv-1",
        macroClass: "FIXED_INCOME",
        amount: 40000,
        notes: undefined,
      })
    })
  })

  it("renders empty holdings state when totalInvested is zero", () => {
    render(
      <InvestmentPortfolioCard
        portfolio={{
          totalInvested: 0,
          holdings: [],
          allocationDiagnosis: {
            adherentToRiskProfile: true,
            recommendations: [],
          },
        }}
        accounts={sampleAccounts}
      />
    )

    expect(
      screen.getByTestId("investment-holdings-empty")
    ).toBeInTheDocument()
  })

  it("renders loading skeleton when isLoading is true", () => {
    render(
      <InvestmentPortfolioCard
        portfolio={null}
        accounts={sampleAccounts}
        isLoading={true}
      />
    )

    expect(
      screen.getByTestId("investment-portfolio-loading")
    ).toBeInTheDocument()
  })
})
