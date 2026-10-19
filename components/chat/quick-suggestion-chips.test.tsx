import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QuickSuggestionChips } from "./quick-suggestion-chips";
import { FinancialAnalysis } from "@/src/types/api";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

describe("components/chat/quick-suggestion-chips", () => {
  it("deve renderizar chips educativos de fallback quando não houver dados no mês", () => {
    const queryClient = createTestQueryClient();
    const onSelect = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <QuickSuggestionChips onSelect={onSelect} currentMonth="2026-10" />
      </QueryClientProvider>
    );

    expect(screen.getByText("Sugestões rápidas para começar")).toBeInTheDocument();
    expect(screen.getByText("Reserva de Emergência")).toBeInTheDocument();
    expect(screen.getByText("Regra 50-30-20")).toBeInTheDocument();
  });

  it("deve gerar chips personalizados quando houver análise orçamentária no cache", () => {
    const queryClient = createTestQueryClient();
    const mockAnalysis: FinancialAnalysis = {
      cached: true,
      month: "2026-10",
      diagnosis: "Diagnóstico",
      recommendations: [],
      metrics: {
        totalIncome: 8000,
        totalExpenses: 5000,
        netBalance: 3000,
        savingsRate: 37.5,
        topCategories: [
          { category: "Alimentação", amount: 1800, percentage: 36 },
          { category: "Moradia", amount: 1500, percentage: 30 },
        ],
      },
      generatedAt: "2026-10-19T00:00:00Z",
      expiresAt: "2026-10-20T00:00:00Z",
    };

    queryClient.setQueryData(["analysis", "2026-10"], mockAnalysis);
    const onSelect = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <QuickSuggestionChips onSelect={onSelect} currentMonth="2026-10" />
      </QueryClientProvider>
    );

    expect(screen.getByText("Gastos em Alimentação")).toBeInTheDocument();
    expect(screen.getByText("Alocar Excedente")).toBeInTheDocument();
    expect(screen.getByText("Gastos Atípicos")).toBeInTheDocument();
  });

  it("deve disparar onSelect com o prompt correspondente ao clicar em um chip", () => {
    const queryClient = createTestQueryClient();
    const onSelect = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <QuickSuggestionChips onSelect={onSelect} currentMonth="2026-10" />
      </QueryClientProvider>
    );

    const chip = screen.getByTestId("quick-chip-emergency-fund");
    fireEvent.click(chip);

    expect(onSelect).toHaveBeenCalledWith(
      "Como calcular e construir minha reserva de emergência?"
    );
  });
});
