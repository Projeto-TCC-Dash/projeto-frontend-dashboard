import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./use-auth";
import { useAiKey } from "./use-ai-key";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe("useAiKey Hook", () => {
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

  it("deve reportar status NOT_CONFIGURED quando usuário não possui chave", () => {
    const { result } = renderHook(() => useAiKey(), { wrapper });
    expect(result.current.status).toBe("NOT_CONFIGURED");
  });

  it("deve registrar e atualizar para ACTIVE_VERIFIED em resposta positiva padrão", async () => {
    // Configura usuário logado no localStorage
    localStorage.setItem("auth_token", "jwt-123");
    localStorage.setItem("auth_user", JSON.stringify({ id: "1", email: "a@b.com", hasAiKey: false }));

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        success: true,
        message: "Chave ativada com sucesso",
        status: "ACTIVE_VERIFIED",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useAiKey(), { wrapper });

    await act(async () => {
      await result.current.saveAndTestKey({ apiKey: "AIzaSyD-1234567890abcdefghijklmn" });
    });

    expect(result.current.status).toBe("ACTIVE_VERIFIED");
  });

  it("deve atualizar para ACTIVE_PROVISIONAL_DEMAND quando serviço estiver sob alta demanda", async () => {
    localStorage.setItem("auth_token", "jwt-123");
    localStorage.setItem("auth_user", JSON.stringify({ id: "1", email: "a@b.com", hasAiKey: false }));

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        success: true,
        message: "Alta demanda temporária",
        status: "ACTIVE_PROVISIONAL_DEMAND",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useAiKey(), { wrapper });

    await act(async () => {
      await result.current.saveAndTestKey({ apiKey: "AIzaSyD-1234567890abcdefghijklmn" });
    });

    expect(result.current.status).toBe("ACTIVE_PROVISIONAL_DEMAND");
  });
});
