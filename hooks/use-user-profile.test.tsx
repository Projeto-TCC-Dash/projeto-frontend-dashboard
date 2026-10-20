import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./use-auth";
import { useUserProfile, useUpdateFinancialProfile } from "./use-user-profile";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe("useUserProfile & useUpdateFinancialProfile Hooks", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );
  }

  it("não deve carregar perfil se o usuário não estiver autenticado", async () => {
    const { result } = renderHook(() => useUserProfile(), { wrapper });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it("deve carregar perfil do usuário autenticado com sucesso", async () => {
    localStorage.setItem("auth_token", "jwt-valid-token");
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ id: "user-123", email: "user@test.com", hasAiKey: true })
    );

    const mockProfileResponse = {
      id: "user-123",
      email: "user@test.com",
      hasAiKey: true,
      financialProfile: {
        incomeType: "CLT",
        declaredMonthlyIncome: 5000,
        goals: ["RESERVA_EMERGENCIA"],
        riskProfile: "CONSERVATIVE",
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockProfileResponse,
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockProfileResponse);
  });

  it("deve executar mutação de atualização do perfil e invalidar queries", async () => {
    localStorage.setItem("auth_token", "jwt-valid-token");
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ id: "user-123", email: "user@test.com", hasAiKey: true })
    );

    const updatedProfile = {
      id: "user-123",
      email: "user@test.com",
      hasAiKey: true,
      financialProfile: {
        incomeType: "PJ_AUTONOMO",
        declaredMonthlyIncome: 10000,
        goals: ["INVESTIR_LONGO_PRAZO"],
        riskProfile: "MODERATE",
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => updatedProfile,
    });
    vi.stubGlobal("fetch", fetchMock);

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateFinancialProfile(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.updateProfile({
        incomeType: "PJ_AUTONOMO",
        declaredMonthlyIncome: 10000,
        goals: ["INVESTIR_LONGO_PRAZO"],
        riskProfile: "MODERATE",
      });
    });

    expect(response).toEqual(updatedProfile);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["user-profile"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["financial-analysis"] });
  });

  it("deve reportar erro em caso de falha na mutação", async () => {
    localStorage.setItem("auth_token", "jwt-valid-token");
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ id: "user-123", email: "user@test.com", hasAiKey: true })
    );

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ message: "Dados inválidos de perfil" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useUpdateFinancialProfile(), { wrapper });

    await expect(
      result.current.updateProfile({
        declaredMonthlyIncome: -50,
      })
    ).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
