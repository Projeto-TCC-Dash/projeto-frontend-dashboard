import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { AiDiagnosisCard } from "./ai-diagnosis-card";
import { FinancialAnalysis } from "@/src/types/api";

describe("AiDiagnosisCard Component", () => {
  const sampleAnalysis: FinancialAnalysis = {
    cached: true,
    month: "2026-10",
    diagnosis: "### Visão Geral\n\nSeu saldo foi **positivo** com superávit de R$ 3.500,00.",
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
  };

  it("renders diagnosis in markdown and recommendations list", () => {
    render(<AiDiagnosisCard analysis={sampleAnalysis} hasAiKey={true} />);

    expect(screen.getByText("Parecer do Consultor Financeiro")).toBeInTheDocument();
    expect(screen.getByText("Visão Geral")).toBeInTheDocument();
    expect(screen.getByText("positivo")).toBeInTheDocument();
    expect(
      screen.getByText("Mantenha a reserva de emergência aportando em renda fixa.")
    ).toBeInTheDocument();
    expect(screen.getByText("Reduza os gastos em delivery.")).toBeInTheDocument();
  });

  it("displays cache badge when cached is true", () => {
    render(<AiDiagnosisCard analysis={sampleAnalysis} hasAiKey={true} />);

    expect(screen.getByText("Cache ativo 24h")).toBeInTheDocument();
  });

  it("displays fresh analysis badge when cached is false", () => {
    render(
      <AiDiagnosisCard
        analysis={{ ...sampleAnalysis, cached: false }}
        hasAiKey={true}
      />
    );

    expect(screen.getByText("Análise recém-gerada")).toBeInTheDocument();
  });

  it("triggers onRefresh when clicking 'Recalcular Diagnóstico'", () => {
    const onRefreshMock = vi.fn();
    render(
      <AiDiagnosisCard
        analysis={sampleAnalysis}
        hasAiKey={true}
        onRefresh={onRefreshMock}
      />
    );

    const refreshBtn = screen.getByRole("button", {
      name: /recalcular diagnóstico/i,
    });
    fireEvent.click(refreshBtn);

    expect(onRefreshMock).toHaveBeenCalledTimes(1);
  });

  it("displays BYOK educational fallback when hasAiKey is false", () => {
    const onOpenModalMock = vi.fn();
    render(
      <AiDiagnosisCard
        analysis={sampleAnalysis}
        hasAiKey={false}
        onOpenAiKeyModal={onOpenModalMock}
      />
    );

    expect(
      screen.getByTestId("ai-diagnosis-card-byok-required")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Ative seu Consultor Financeiro Inteligente")
    ).toBeInTheDocument();

    const configBtn = screen.getByRole("button", {
      name: /configurar chave de ia/i,
    });
    fireEvent.click(configBtn);

    expect(onOpenModalMock).toHaveBeenCalledTimes(1);
  });

  it("displays error card and retry button on error", () => {
    const onRetryMock = vi.fn();
    render(
      <AiDiagnosisCard
        analysis={null}
        hasAiKey={true}
        error={new Error("Erro 503: Servidor de IA sobrecarregado")}
        onRetry={onRetryMock}
      />
    );

    expect(screen.getByTestId("ai-diagnosis-card-error")).toBeInTheDocument();
    expect(
      screen.getByText("Diagnóstico Temporariamente Indisponível")
    ).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: /tentar novamente/i });
    fireEvent.click(retryBtn);

    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });

  it("renders loading skeleton when isLoading is true", () => {
    render(<AiDiagnosisCard analysis={null} isLoading={true} hasAiKey={true} />);

    expect(screen.getByTestId("ai-diagnosis-card-loading")).toBeInTheDocument();
  });
});
