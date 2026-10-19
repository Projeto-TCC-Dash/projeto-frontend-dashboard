import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUpdateTransaction } from "./use-update-transaction";
import { Transaction, UpdateTransactionDTO } from "@/src/types/api";

describe("useUpdateTransaction Hook", () => {
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

  function wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  it("updates transaction via PATCH /api/transactions/:id and invalidates cache", async () => {
    const mockUpdatedTx: Transaction = {
      id: "tx-123",
      externalId: "ext-123",
      rawDescription: "IFOOD RESTAURANTE",
      cleanDescription: "iFood Almoço de Domingo",
      amount: -60.0,
      date: "2026-10-18T13:00:00Z",
      category: "Alimentação",
      source: "OFX",
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockUpdatedTx,
    });
    vi.stubGlobal("fetch", fetchMock);

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateTransaction(), { wrapper });

    const dto: UpdateTransactionDTO = {
      cleanDescription: "iFood Almoço de Domingo",
      category: "Alimentação",
    };

    let updatedResult: Transaction | undefined;
    await act(async () => {
      updatedResult = await result.current.updateTransaction({
        id: "tx-123",
        data: dto,
      });
    });

    expect(updatedResult).toEqual(mockUpdatedTx);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/transactions/tx-123"),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify(dto),
      })
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["transactions"],
    });
  });

  it("handles update failure and throws error", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ message: "Transação não encontrada" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useUpdateTransaction(), { wrapper });

    await expect(
      act(async () => {
        await result.current.updateTransaction({
          id: "tx-inexistente",
          data: { cleanDescription: "Teste" },
        });
      })
    ).rejects.toThrow("Transação não encontrada");
  });
});
