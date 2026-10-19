import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFinancialAnalysis } from "./use-financial-analysis";
import { FinancialAnalysis } from "@/src/types/api";

describe("useFinancialAnalysis Hook", () => {
  let queryClient: QueryClient;

  const mockAnalysis: FinancialAnalysis = {
    cached: true,
    month: "2026-10",
    diagnosis: "### Visão Geral\n\nResultado financeiro **positivo** no mês.",
    recommendations: [
      "Aporte o excedente na reserva de emergência.",
      "Reduza os gastos em delivery.",
    ],
    metrics: {
      totalIncome: 10000,
      totalExpenses: 6500,
      netBalance: 3500,
      savingsRate: 35.0,
      topCategories: [
        { category: "Moradia", amount: 3000, percentage: 46.15 },
        { category: "Alimentação", amount: 2000, percentage: 30.77 },
        { category: "Transporte", amount: 1500, percentage: 23.08 },
      ],
    },
    generatedAt: "2026-10-19T10:00:00Z",
    expiresAt: "2026-10-20T10:00:00Z",
  };

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("auth_token", "test-token");
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
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  it("fetches financial analysis for given month successfully", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockAnalysis,
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useFinancialAnalysis("2026-10"), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.analysis).toEqual(mockAnalysis);
    expect(result.current.metrics?.netBalance).toBe(3500);
    expect(result.current.metrics?.savingsRate).toBe(35.0);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/analysis/2026-10"),
      expect.objectContaining({
        method: "GET",
        headers: expect.any(Headers),
      })
    );
  });

  it("triggers manual forceRefresh via refreshAnalysis and updates query data", async () => {
    const freshAnalysis: FinancialAnalysis = {
      ...mockAnalysis,
      cached: false,
      diagnosis: "### Novo Parecer Atualizado\n\nDiagnóstico recém-gerado pelo Gemini.",
      generatedAt: "2026-10-19T12:00:00Z",
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockAnalysis,
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => freshAnalysis,
      });

    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useFinancialAnalysis("2026-10"), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.analysis?.cached).toBe(true);

    let refreshResult: FinancialAnalysis | null = null;
    await act(async () => {
      refreshResult = await result.current.refreshAnalysis();
    });

    expect(refreshResult).toEqual(freshAnalysis);
    expect(result.current.analysis?.cached).toBe(false);
    expect(result.current.analysis?.diagnosis).toContain("Novo Parecer Atualizado");
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining("/api/analysis/2026-10?forceRefresh=true"),
      expect.anything()
    );
  });

  it("handles HTTP 403 (chave de IA ausente) properly", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ message: "Chave do Gemini não configurada", code: "AI_KEY_NOT_CONFIGURED" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useFinancialAnalysis("2026-10"), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Chave do Gemini não configurada");
  });

  it("handles HTTP 503 (alta demanda temporária) properly", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ message: "Serviço upstream sob alta demanda temporária" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(
      () => useFinancialAnalysis("2026-10", { retry: false }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Serviço upstream sob alta demanda temporária");
  });
});
