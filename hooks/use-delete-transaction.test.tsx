import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDeleteTransaction, DeleteTransactionResponse } from "./use-delete-transaction";

describe("useDeleteTransaction Hook", () => {
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

  it("deletes transaction via DELETE /api/transactions/:id and invalidates transactions, accounts, and analysis queries", async () => {
    const mockResponse: DeleteTransactionResponse = {
      success: true,
      message: "Transação excluída com sucesso",
      deletedId: "tx-to-delete",
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockResponse,
    });
    vi.stubGlobal("fetch", fetchMock);

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteTransaction(), { wrapper });

    let response: DeleteTransactionResponse | undefined;
    await act(async () => {
      response = await result.current.deleteTransaction("tx-to-delete");
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/transactions/tx-to-delete"),
      expect.objectContaining({
        method: "DELETE",
      })
    );
    const calledHeaders = fetchMock.mock.calls[0][1].headers as Headers;
    expect(calledHeaders.get("Authorization")).toBe("Bearer test-token");

    expect(response).toEqual(mockResponse);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["transactions"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["accounts"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["analysis"] });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("handles errors during deletion", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        message: "Transação não encontrada",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useDeleteTransaction(), { wrapper });

    await act(async () => {
      try {
        await result.current.deleteTransaction("non-existent-id");
      } catch {
        // Expected error
      }
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error?.message).toContain("Transação não encontrada");
    });
  });
});
