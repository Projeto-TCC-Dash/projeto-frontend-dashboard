import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import * as React from "react"
import { AiDiagnosisCard } from "./ai-diagnosis-card"
import { FinancialAnalysis } from "@/src/types/api"

describe("AiDiagnosisCard Component", () => {
  const sampleAnalysis: FinancialAnalysis = {
    cached: true,
    month: "2026-10",
    diagnosis:
      "### Visão Geral\n\nSeu saldo foi **positivo** com superávit de R$ 3.500,00.",
    recommendations: [
      "Mantenha a reserva de emergência aportando em renda fixa.",
      "Reduza os gastos em delivery.",
    ],
    metrics: {
      totalIncome: 10000,
      totalExpenses: 6500,
      netBalance: 3500,
      savingsRate: 35.0,
      topCategories: [],
    },
    generatedAt: "2026-10-19T10:00:00Z",
    expiresAt: "2026-10-20T10:00:00Z",
  }

  it("renders diagnosis in markdown and recommendations list", () => {
    render(<AiDiagnosisCard analysis={sampleAnalysis} hasAiKey={true} />)

    expect(
      screen.getByText("Parecer do Consultor Financeiro")
    ).toBeInTheDocument()
    expect(screen.getByText("Visão Geral")).toBeInTheDocument()
    expect(screen.getByText("positivo")).toBeInTheDocument()
    expect(
      screen.getByText(
        "Mantenha a reserva de emergência aportando em renda fixa."
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText("Reduza os gastos em delivery.")
    ).toBeInTheDocument()
  })

  it("displays cache badge when cached is true", () => {
    render(<AiDiagnosisCard analysis={sampleAnalysis} hasAiKey={true} />)

    expect(screen.getByText("Cache ativo 24h")).toBeInTheDocument()
  })

  it("displays fresh analysis badge when cached is false", () => {
    render(
      <AiDiagnosisCard
        analysis={{ ...sampleAnalysis, cached: false }}
        hasAiKey={true}
      />
    )

    expect(screen.getByText("Análise recém-gerada")).toBeInTheDocument()
  })

  it("triggers onRefresh when clicking 'Recalcular Diagnóstico'", () => {
    const onRefreshMock = vi.fn()
    render(
      <AiDiagnosisCard
        analysis={sampleAnalysis}
        hasAiKey={true}
        onRefresh={onRefreshMock}
      />
    )

    const refreshBtn = screen.getByRole("button", {
      name: /recalcular diagnóstico/i,
    })
    fireEvent.click(refreshBtn)

    expect(onRefreshMock).toHaveBeenCalledTimes(1)
  })

  it("displays BYOK educational fallback when hasAiKey is false", () => {
    const onOpenModalMock = vi.fn()
    render(
      <AiDiagnosisCard
        analysis={sampleAnalysis}
        hasAiKey={false}
        onOpenAiKeyModal={onOpenModalMock}
      />
    )

    expect(
      screen.getByTestId("ai-diagnosis-card-byok-required")
    ).toBeInTheDocument()
    expect(
      screen.getByText("Ative seu Consultor Financeiro Inteligente")
    ).toBeInTheDocument()

    const configBtn = screen.getByRole("button", {
      name: /configurar chave de ia/i,
    })
    fireEvent.click(configBtn)

    expect(onOpenModalMock).toHaveBeenCalledTimes(1)
  })

  it("displays error card and retry button on error", () => {
    const onRetryMock = vi.fn()
    render(
      <AiDiagnosisCard
        analysis={null}
        hasAiKey={true}
        error={new Error("Erro 503: Servidor de IA sobrecarregado")}
        onRetry={onRetryMock}
      />
    )

    expect(screen.getByTestId("ai-diagnosis-card-error")).toBeInTheDocument()
    expect(
      screen.getByText("Diagnóstico Temporariamente Indisponível")
    ).toBeInTheDocument()

    const retryBtn = screen.getByRole("button", { name: /tentar novamente/i })
    fireEvent.click(retryBtn)

    expect(onRetryMock).toHaveBeenCalledTimes(1)
  })

  it("renders loading skeleton when isLoading is true", () => {
    render(<AiDiagnosisCard analysis={null} isLoading={true} hasAiKey={true} />)

    expect(screen.getByTestId("ai-diagnosis-card-loading")).toBeInTheDocument()
  })

  it("renders calibrated emergency reserve guideline for CLT profile with calculated amounts", () => {
    render(
      <AiDiagnosisCard
        analysis={sampleAnalysis}
        hasAiKey={true}
        financialProfile={{
          incomeType: "CLT",
          declaredMonthlyIncome: 10000,
          goals: ["RESERVA_EMERGENCIA"],
        }}
      />
    )

    const guideline = screen.getByTestId("emergency-reserve-guideline")
    expect(guideline).toBeInTheDocument()
    expect(screen.getByText("CLT • Meta: 3 a 6 meses")).toBeInTheDocument()
    // 6500 * 3 = 19500, 6500 * 6 = 39000
    expect(guideline.textContent?.replace(/\u00A0/g, " ")).toMatch(
      /R\$\s?19\.500,00 a R\$\s?39\.000,00/
    )
  })

  it("renders calibrated emergency reserve guideline for PJ / Autônomo (6 a 12 meses)", () => {
    render(
      <AiDiagnosisCard
        analysis={sampleAnalysis}
        hasAiKey={true}
        financialProfile={{
          incomeType: "PJ_AUTONOMO",
          declaredMonthlyIncome: 12000,
        }}
      />
    )

    const guideline = screen.getByTestId("emergency-reserve-guideline")
    expect(guideline).toBeInTheDocument()
    expect(
      screen.getByText("PJ / Autônomo • Meta: 6 a 12 meses")
    ).toBeInTheDocument()
    // 6500 * 6 = 39000, 6500 * 12 = 78000
    expect(guideline.textContent?.replace(/\u00A0/g, " ")).toMatch(
      /R\$\s?39\.000,00 a R\$\s?78\.000,00/
    )
  })

  it("renders market standard guideline (6 meses) when profile is not informed", () => {
    render(<AiDiagnosisCard analysis={sampleAnalysis} hasAiKey={true} />)

    const guideline = screen.getByTestId("emergency-reserve-guideline")
    expect(guideline).toBeInTheDocument()
    expect(
      screen.getByText("Padrão de Mercado • Meta: 6 meses")
    ).toBeInTheDocument()
  })

  it("renders user active goals chips in recommendations header", () => {
    render(
      <AiDiagnosisCard
        analysis={sampleAnalysis}
        hasAiKey={true}
        financialProfile={{
          incomeType: "CLT",
          goals: ["QUITAR_DIVIDAS", "RESERVA_EMERGENCIA"],
        }}
      />
    )

    const chips = screen.getByTestId("user-active-goals-chips")
    expect(chips).toBeInTheDocument()
    expect(screen.getByText("Quitar Dívidas e Empréstimos")).toBeInTheDocument()
    expect(
      screen.getByText("Criar / Expandir Reserva de Emergência")
    ).toBeInTheDocument()
  })

  it("activates BorderBeam when isRefreshing is true, softens on ready, and hides on error/byok/empty/reduced-motion", () => {
    const { rerender } = render(
      <AiDiagnosisCard
        analysis={sampleAnalysis}
        hasAiKey={true}
        isRefreshing={true}
      />
    )
    expect(screen.getByTestId("border-beam")).toHaveAttribute(
      "data-beam-state",
      "active"
    )

    rerender(
      <AiDiagnosisCard
        analysis={sampleAnalysis}
        hasAiKey={true}
        isRefreshing={false}
      />
    )
    expect(screen.getByTestId("border-beam")).toHaveAttribute(
      "data-beam-state",
      "subtle"
    )

    rerender(
      <AiDiagnosisCard
        analysis={sampleAnalysis}
        hasAiKey={false}
        isRefreshing={true}
      />
    )
    expect(screen.queryByTestId("border-beam")).toBeNull()

    rerender(
      <AiDiagnosisCard
        analysis={sampleAnalysis}
        hasAiKey={true}
        error={new Error("Falha")}
      />
    )
    expect(screen.queryByTestId("border-beam")).toBeNull()

    rerender(<AiDiagnosisCard analysis={null} hasAiKey={true} />)
    expect(screen.queryByTestId("border-beam")).toBeNull()

    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: true,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList
    )
    rerender(
      <AiDiagnosisCard
        analysis={sampleAnalysis}
        hasAiKey={true}
        isRefreshing={true}
      />
    )
    expect(screen.queryByTestId("border-beam")).toBeNull()
  })

  it("matches desktop left-column height with pinned header and scrollable body when matchedDesktopHeight is enabled", () => {
    const { rerender } = render(
      <AiDiagnosisCard
        analysis={sampleAnalysis}
        hasAiKey={true}
        onRefresh={vi.fn()}
        matchedDesktopHeight
      />
    )

    const readyCard = screen.getByTestId("ai-diagnosis-card")
    expect(readyCard.className).toContain("xl:absolute")
    expect(readyCard.className).toContain("xl:inset-0")
    expect(readyCard.className).toContain("xl:flex-col")

    const readyBody = screen.getByTestId("ai-diagnosis-body")
    expect(readyBody.className).toContain("xl:flex-1")
    expect(readyBody.className).toContain("xl:min-h-0")
    expect(readyBody.className).toContain("xl:overflow-y-auto")

    const refreshBtn = screen.getByRole("button", {
      name: /recalcular diagnóstico/i,
    })
    expect(readyBody).not.toContainElement(refreshBtn)
    expect(refreshBtn.closest("[class*='xl:shrink-0']")).not.toBeNull()

    rerender(
      <AiDiagnosisCard
        analysis={sampleAnalysis}
        hasAiKey={false}
        onOpenAiKeyModal={vi.fn()}
        matchedDesktopHeight
      />
    )
    expect(
      screen.getByTestId("ai-diagnosis-card-byok-required").className
    ).toContain("xl:inset-0")
    expect(screen.getByTestId("ai-diagnosis-body").className).toContain(
      "xl:overflow-y-auto"
    )

    rerender(
      <AiDiagnosisCard
        analysis={null}
        hasAiKey={true}
        error={new Error("Erro 503")}
        onRetry={vi.fn()}
        matchedDesktopHeight
      />
    )
    expect(screen.getByTestId("ai-diagnosis-card-error").className).toContain(
      "xl:inset-0"
    )

    rerender(
      <AiDiagnosisCard
        analysis={null}
        hasAiKey={true}
        onRefresh={vi.fn()}
        matchedDesktopHeight
      />
    )
    expect(screen.getByTestId("ai-diagnosis-card-empty").className).toContain(
      "xl:inset-0"
    )

    rerender(
      <AiDiagnosisCard
        analysis={null}
        isLoading={true}
        hasAiKey={true}
        matchedDesktopHeight
      />
    )
    expect(screen.getByTestId("ai-diagnosis-card-loading").className).toContain(
      "xl:inset-0"
    )
  })
})
