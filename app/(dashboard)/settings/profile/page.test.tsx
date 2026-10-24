import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import ProfileSettingsPage from "./page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/use-auth";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/settings/profile",
}));

describe("ProfileSettingsPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("auth_token", "jwt-mock");
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ id: "user-1", email: "debora@teste.com", hasAiKey: true })
    );
    vi.restoreAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  function wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );
  }

  it("deve carregar e exibir formulário unificado de identidade sem misturar metas financeiras", async () => {
    const mockProfile = {
      id: "user-1",
      email: "debora@teste.com",
      name: "Débora Goulart",
      avatarUrl: "https://storage.exemplo.com/avatar.png",
      hasAiKey: true,
      financialProfile: {
        incomeType: "CLT",
        declaredMonthlyIncome: 8500,
        goals: ["RESERVA_EMERGENCIA"],
        riskProfile: "MODERATE",
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockProfile,
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<ProfileSettingsPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("Informações de Identidade")).toBeInTheDocument();
      expect(screen.getByText("Foto de Perfil")).toBeInTheDocument();
      expect(screen.getByTestId("user-name-input")).toHaveValue("Débora Goulart");
      expect(screen.getByTestId("user-email-input")).toHaveValue("debora@teste.com");

      // Confirma que metas financeiras NÃO estão nesta tela
      expect(screen.queryByText("Regime de Trabalho e Renda")).toBeNull();
      expect(screen.queryByText("Metas Financeiras Prioritárias")).toBeNull();
    });
  });
});
