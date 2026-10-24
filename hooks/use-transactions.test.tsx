import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTransactions } from "./use-transactions";
import { Transaction } from "@/src/types/api";

describe("useTransactions Hook", () => {
  let queryClient: QueryClient;

  const mockTransactions: Transaction[] = [
    {
      id: "tx-1",
      externalId: "ext-1",
      rawDescription: "IFOOD *RESTAURANTE",
      cleanDescription: "iFood Restaurante",
      amount: -45.5,
      date: "2026-10-15T19:00:00Z",
      category: "Alimentação",
      source: "OFX",
    },
    {
      id: "tx-2",
      externalId: "ext-2",
      rawDescription: "SALARIO EMPRESA",
      cleanDescription: "Salário Mensal",
      amount: 5000.0,
      date: "2026-10-05T10:00:00Z",
      category: "Receita",
      source: "SEED",
    },
  ];

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

  it("fetches transactions for given month successfully", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockTransactions,
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(
      () => useTransactions({ month: "2026-10" }),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.transactions).toEqual(mockTransactions);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/transactions?month=2026-10"),
      expect.anything()
    );
  });

  it("includes category and source in query params when provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => [mockTransactions[0]],
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(
      () =>
        useTransactions({
          month: "2026-10",
          category: "Alimentação",
          source: "OFX",
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.transactions).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(
        /\/api\/transactions\?.*month=2026-10.*category=Alimenta%C3%A7%C3%A3o.*source=OFX/
      ),
      expect.anything()
    );
  });

  it("includes accountId in query params and query key when provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => [mockTransactions[0]],
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(
      () =>
        useTransactions({
          month: "2026-10",
          accountId: "acc-nubank",
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(
        /\/api\/transactions\?.*month=2026-10.*accountId=acc-nubank/
      ),
      expect.anything()
    );
  });

  it("handles fetch error gracefully", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ message: "Erro interno no servidor" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(
      () => useTransactions({ month: "2026-10" }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.transactions).toEqual([]);
  });
});
