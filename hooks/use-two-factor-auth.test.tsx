import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./use-auth";
import { useTwoFactorAuth } from "./use-two-factor-auth";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
}));

describe("useTwoFactorAuth Hook", () => {
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

  it("deve solicitar código 2FA via requestEnable", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        message: "Código enviado para seu e-mail",
        expiresInSeconds: 60,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useTwoFactorAuth(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.requestEnable();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/2fa/request-enable",
      expect.objectContaining({ method: "POST" })
    );
    expect(response).toEqual({
      message: "Código enviado para seu e-mail",
      expiresInSeconds: 60,
    });
  });

  it("deve confirmar ativação com código de 6 dígitos e invalidar user-profile", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        success: true,
        message: "2FA ativado com sucesso",
        twoFactorEnabled: true,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useTwoFactorAuth(), { wrapper });

    let response: { twoFactorEnabled: boolean } | undefined;
    await act(async () => {
      response = await result.current.confirmEnable({ code: "123456" });
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/2fa/confirm-enable",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ code: "123456" }),
      })
    );
    expect(response?.twoFactorEnabled).toBe(true);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["user-profile"] });
  });

  it("deve desativar 2FA via disable2FA e invalidar user-profile", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        success: true,
        message: "2FA desativado",
        twoFactorEnabled: false,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useTwoFactorAuth(), { wrapper });

    let response: { twoFactorEnabled: boolean } | undefined;
    await act(async () => {
      response = await result.current.disable2FA();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/2fa/disable",
      expect.objectContaining({ method: "POST" })
    );
    expect(response?.twoFactorEnabled).toBe(false);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["user-profile"] });
  });

  it("deve delegar logout e redirecionar para tela de login", async () => {
    localStorage.setItem("auth_token", "active-token");
    localStorage.setItem("auth_user", JSON.stringify({ id: "123" }));

    const { result } = renderHook(() => useTwoFactorAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(localStorage.getItem("auth_token")).toBeNull();
    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});
