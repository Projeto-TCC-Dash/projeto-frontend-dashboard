import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import DashboardPage from "./page";
import { FinancialAnalysis, UserProfileResponse } from "@/src/types/api";

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
    topCategories: [
      { category: "Alimentação", amount: 2000, percentage: 50 },
    ],
  },
  generatedAt: "2026-10-19T10:00:00Z",
  expiresAt: "2026-10-20T10:00:00Z",
};

const mockUserProfile: UserProfileResponse = {
  id: "user-1",
  email: "teste@exemplo.com",
  hasAiKey: true,
  financialProfile: {
    incomeType: "CLT",
    declaredMonthlyIncome: 10000,
    goals: ["RESERVA_EMERGENCIA"],
  },
};

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "user-1", email: "teste@exemplo.com", hasAiKey: true },
  }),
}));

vi.mock("@/hooks/use-user-profile", () => ({
  useUserProfile: () => ({
    data: mockUserProfile,
    isLoading: false,
  }),
}));

vi.mock("@/hooks/use-financial-analysis", () => ({
  useFinancialAnalysis: () => ({
    analysis: mockAnalysis,
    metrics: mockAnalysis.metrics,
    isLoading: false,
    isRefreshing: false,
    error: null,
    refreshAnalysis: vi.fn(),
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("DashboardPage Integration", () => {
  it("renders header, kpi cards with invoice settlements, donut chart and ai diagnosis card with calibrated guideline", () => {
    render(<DashboardPage />);

    // Header & KPIs
    expect(screen.getByText("Receitas Totais")).toBeInTheDocument();
    expect(screen.getByText("Despesas Primárias")).toBeInTheDocument();
    expect(screen.getByText("Quitação de Faturas")).toBeInTheDocument();
    expect(screen.getByText("Saldo Líquido")).toBeInTheDocument();

    // Values: 10000 - 4000 - 2000 = +4000
    expect(screen.getByText("R$ 10.000,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 4.000,00")).toBeInTheDocument();
    expect(screen.getAllByText("R$ 2.000,00").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("+R$ 4.000,00")).toBeInTheDocument();

    // Calibrated reserve guideline
    expect(screen.getByTestId("emergency-reserve-guideline")).toBeInTheDocument();
    expect(screen.getByText("CLT • Meta: 3 a 6 meses")).toBeInTheDocument();

    // AI diagnosis content
    expect(screen.getByText("Parabéns pela gestão equilibrada do orçamento.")).toBeInTheDocument();
  });
});
