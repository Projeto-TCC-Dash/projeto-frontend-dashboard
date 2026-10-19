import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./use-auth";

// Mock router do Next.js
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
}));

describe("useAuth Hook", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    vi.restoreAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
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

  it("deve inicializar deslogado quando não houver token no localStorage", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("deve realizar login, salvar credenciais e atualizar estado", async () => {
    const mockAuthResponse = {
      token: "jwt-token-login-456",
      user: { id: "u-1", email: "auth@teste.com", hasAiKey: false },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockAuthResponse,
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const res = await result.current.login({ email: "auth@teste.com", password: "password123" });
      expect(res).toEqual(mockAuthResponse);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe("auth@teste.com");
    expect(result.current.token).toBe("jwt-token-login-456");
    expect(localStorage.getItem("auth_token")).toBe("jwt-token-login-456");
  });

  it("deve realizar logout e limpar estado e localStorage", async () => {
    localStorage.setItem("auth_token", "token-ativo");
    localStorage.setItem("auth_user", JSON.stringify({ id: "1", email: "a@b.com", hasAiKey: true }));

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("auth_token")).toBeNull();
    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});
