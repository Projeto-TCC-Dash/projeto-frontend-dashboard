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

  it("deve atualizar o nome do usuário com sucesso via updateName e invalidar query", async () => {
    localStorage.setItem("auth_token", "jwt-valid-token");
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ id: "user-123", email: "user@test.com", hasAiKey: true })
    );

    const updatedProfile = {
      id: "user-123",
      email: "user@test.com",
      name: "Débora H. Goulart",
      hasAiKey: true,
    };

    const fetchMock = vi.fn().mockImplementation((url, options) => {
      if (options?.method === "PATCH") {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => updatedProfile,
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ id: "user-123", email: "user@test.com", hasAiKey: true }),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await act(async () => {
      await result.current.updateName("Débora H. Goulart");
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/user/profile",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ name: "Débora H. Goulart" }),
      })
    );
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["user-profile"] });
  });

  it("deve fazer upload do avatar via FormData e invalidar query", async () => {
    localStorage.setItem("auth_token", "jwt-valid-token");
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ id: "user-123", email: "user@test.com", hasAiKey: true })
    );

    const fetchMock = vi.fn().mockImplementation((url, options) => {
      if (options?.method === "POST" && url.includes("/api/user/avatar")) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({ avatarUrl: "https://storage.exemplo.com/avatar.webp" }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ id: "user-123", email: "user@test.com", hasAiKey: true }),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useUserProfile(), { wrapper });

    const fakeFile = new File(["dummy content"], "avatar.png", { type: "image/png" });
    await act(async () => {
      await result.current.uploadAvatar(fakeFile);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/user/avatar",
      expect.objectContaining({
        method: "POST",
      })
    );
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["user-profile"] });
  });

  it("deve excluir o avatar via deleteAvatar e invalidar query", async () => {
    localStorage.setItem("auth_token", "jwt-valid-token");
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ id: "user-123", email: "user@test.com", hasAiKey: true })
    );

    const fetchMock = vi.fn().mockImplementation((url, options) => {
      if (options?.method === "DELETE" && url.includes("/api/user/avatar")) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({ success: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ id: "user-123", email: "user@test.com", hasAiKey: true }),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await act(async () => {
      await result.current.deleteAvatar();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/user/avatar",
      expect.objectContaining({
        method: "DELETE",
      })
    );
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["user-profile"] });
  });

  it("deve executar updateIdentity com salvamento coordenado de avatar e nome", async () => {
    localStorage.setItem("auth_token", "jwt-valid-token");
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ id: "user-123", email: "user@test.com", hasAiKey: true })
    );

    const updatedProfile = {
      id: "user-123",
      email: "user@test.com",
      name: "Novo Nome",
      avatarUrl: "https://storage.exemplo.com/new-avatar.png",
      hasAiKey: true,
    };

    const fetchMock = vi.fn().mockImplementation((url, options) => {
      if (options?.method === "POST" && url.includes("/api/user/avatar")) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({ avatarUrl: updatedProfile.avatarUrl }),
        });
      }
      if (options?.method === "PATCH" && url.includes("/api/user/profile")) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => updatedProfile,
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => updatedProfile,
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useUserProfile(), { wrapper });

    const fakeFile = new File(["dummy content"], "new-avatar.png", { type: "image/png" });

    await act(async () => {
      await result.current.updateIdentity({
        name: "Novo Nome",
        avatarFile: fakeFile,
      });
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/user/avatar",
      expect.objectContaining({
        method: "POST",
      })
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/user/profile",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ name: "Novo Nome" }),
      })
    );
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["user-profile"] });
  });
});
