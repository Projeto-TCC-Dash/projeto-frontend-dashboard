import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { InvestmentAllocationDonut } from "./investment-allocation-donut"
import type { InvestmentPortfolioSummary } from "@/src/types/api"

describe("InvestmentAllocationDonut", () => {
  it("renders empty state when portfolio has no holdings", () => {
    render(
      <InvestmentAllocationDonut
        portfolio={{
          totalInvested: 0,
          riskProfile: "MODERATE",
          holdings: [],
          allocationDiagnosis: {
            adherentToRiskProfile: true,
            recommendations: [],
          },
        }}
      />
    )

    expect(screen.getByTestId("investment-allocation-empty")).toBeInTheDocument()
  })

  it("renders donut chart and bar list across all 6 macroclasses", () => {
    const portfolio: InvestmentPortfolioSummary = {
      totalInvested: 100000,
      riskProfile: "AGGRESSIVE",
      holdings: [
        { macroClass: "FIXED_INCOME", amount: 30000, percentage: 30 },
        { macroClass: "EQUITIES", amount: 25000, percentage: 25 },
        { macroClass: "REAL_ESTATE", amount: 15000, percentage: 15 },
        { macroClass: "INTERNATIONAL", amount: 15000, percentage: 15 },
        { macroClass: "CRYPTO", amount: 5000, percentage: 5 },
        { macroClass: "CASH_LIQUIDITY", amount: 10000, percentage: 10 },
      ],
      allocationDiagnosis: {
        adherentToRiskProfile: true,
        recommendations: ["Boa diversificação"],
      },
    }

    render(<InvestmentAllocationDonut portfolio={portfolio} />)

    expect(screen.getByTestId("investment-allocation-donut")).toBeInTheDocument()
    expect(screen.getByText(/100\.000,00/)).toBeInTheDocument()
    expect(screen.getByText("Renda Fixa")).toBeInTheDocument()
    expect(screen.getByText("Ações Brasil")).toBeInTheDocument()
    expect(screen.getByText("Fundos Imobiliários")).toBeInTheDocument()
    expect(screen.getByText("Internacional")).toBeInTheDocument()
    expect(screen.getByText("Caixa & Liquidez")).toBeInTheDocument()
    expect(screen.getByText("Criptoativos")).toBeInTheDocument()

    // Hovering BarList item updates center label focus without crashing
    const rendaFixaItem = screen.getByText("Renda Fixa")
    fireEvent.mouseEnter(rendaFixaItem)
    fireEvent.mouseLeave(rendaFixaItem)
  })
})
