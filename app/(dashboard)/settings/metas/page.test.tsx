import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import MetasPage from "./page";
import { useUserProfile, useUpdateFinancialProfile } from "@/hooks/use-user-profile";

vi.mock("@/hooks/use-user-profile", () => ({
  useUserProfile: vi.fn(),
  useUpdateFinancialProfile: vi.fn(),
}));

describe("SettingsMetasPage Component", () => {
  const mockUpdateProfile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useUpdateFinancialProfile).mockReturnValue({
      updateProfile: mockUpdateProfile,
      isPending: false,
      isError: false,
      error: null,
      data: undefined,
      reset: vi.fn(),
    });
  });

  it("deve exibir estado de carregamento quando isLoading for true", () => {
    vi.mocked(useUserProfile).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useUserProfile>);

    render(<MetasPage />);

    expect(screen.getByText(/Carregando perfil de investidor e metas/i)).toBeInTheDocument();
  });

  it("deve renderizar a página de metas com o perfil de investidor do usuário", () => {
    vi.mocked(useUserProfile).mockReturnValue({
      data: {
        id: "user-1",
        email: "usuario@teste.com",
        name: "Débora Goulart",
        hasAiKey: true,
        financialProfile: {
          incomeType: "CLT",
          declaredMonthlyIncome: 7000,
          goals: ["RESERVA_EMERGENCIA"],
          riskProfile: "MODERATE",
        },
      },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useUserProfile>);

    render(<MetasPage />);

    expect(screen.getByText("Perfil de Investidor & Metas")).toBeInTheDocument();
    expect(
      screen.getByText(/Defina seu perfil de risco, objetivos e reserva de emergência/i)
    ).toBeInTheDocument();

    // Deve conter os campos do perfil financeiro e de investidor
    expect(screen.getAllByText("Renda Mensal Declarada").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Metas Financeiras Prioritárias")).toBeInTheDocument();
    expect(screen.getByText("Regime de Trabalho e Renda")).toBeInTheDocument();

    // NÃO deve conter campos de dados cadastrais ou foto de usuário
    expect(screen.queryByText("Nome Completo / Exibição")).toBeNull();
    expect(screen.queryByText("Escolher Foto")).toBeNull();
    expect(screen.queryByText("Exportar Dados")).toBeNull();
    expect(screen.queryByText("Central de Exportação")).toBeNull();
  });
});
