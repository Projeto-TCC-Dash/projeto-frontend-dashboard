import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCategorizeTransactions } from "./use-categorize-transactions";
import { AuthProvider } from "./use-auth";
import { CategorizeResponse } from "@/src/types/api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe("useCategorizeTransactions Hook", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("auth_token", "test-token");
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

  function createWrapper(hasAiKey: boolean) {
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ id: "u-1", email: "user@test.com", hasAiKey })
    );

    return function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      );
    };
  }

  it("executes batch categorization successfully when hasAiKey is true and invalidates query", async () => {
    const mockResponse: CategorizeResponse = {
      uniqueMerchantsAnalyzed: 12,
      transactionsUpdated: 34,
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockResponse,
    });
    vi.stubGlobal("fetch", fetchMock);

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCategorizeTransactions(), {
      wrapper: createWrapper(true),
    });

    expect(result.current.hasAiKey).toBe(true);

    let res: CategorizeResponse | undefined;
    await act(async () => {
      res = await result.current.categorize();
    });

    expect(res).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/transactions/categorize"),
      expect.objectContaining({ method: "POST" })
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["transactions"],
    });
  });

  it("indicates hasAiKey is false and prevents API call when key is missing", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useCategorizeTransactions(), {
      wrapper: createWrapper(false),
    });

    expect(result.current.hasAiKey).toBe(false);

    let caughtError: Error | null = null;
    try {
      await act(async () => {
        await result.current.categorize();
      });
    } catch (e) {
      caughtError = e as Error;
    }

    expect(caughtError?.message).toMatch(/Chave de IA não configurada/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("handles upstream rate limit 429 with specific message", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ message: "Limite de cota excedido" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useCategorizeTransactions(), {
      wrapper: createWrapper(true),
    });

    await expect(
      act(async () => {
        await result.current.categorize();
      })
    ).rejects.toThrow();
  });
});
