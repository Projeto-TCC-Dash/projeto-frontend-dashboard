import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUploadTransactions } from "./use-upload-transactions";
import { UploadTransactionsResponse } from "@/src/types/api";

describe("useUploadTransactions Hook", () => {
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

  it("uploads statement file successfully and invalidates transactions query", async () => {
    const mockResponse: UploadTransactionsResponse = {
      totalExtracted: 25,
      imported: 20,
      duplicatesIgnored: 5,
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockResponse,
    });
    vi.stubGlobal("fetch", fetchMock);

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUploadTransactions(), { wrapper });

    const file = new File(["dummy content"], "extrato.ofx", {
      type: "application/x-ofx",
    });

    let uploadResult: UploadTransactionsResponse | undefined;
    await act(async () => {
      uploadResult = await result.current.upload(file);
    });

    expect(uploadResult).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/transactions/upload"),
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData),
      })
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["transactions"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["accounts"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["analysis"],
    });
  });

  it("uploads statement file with accountId query param when provided", async () => {
    const mockResponse: UploadTransactionsResponse = {
      totalExtracted: 10,
      imported: 10,
      duplicatesIgnored: 0,
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockResponse,
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useUploadTransactions(), { wrapper });

    const file = new File(["dummy csv"], "extrato.csv", {
      type: "text/csv",
    });

    let uploadResult: UploadTransactionsResponse | undefined;
    await act(async () => {
      uploadResult = await result.current.upload({
        file,
        accountId: "acc-itau-123",
      });
    });

    expect(uploadResult).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/transactions/upload?accountId=acc-itau-123"),
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData),
      })
    );
  });

  it("throws error when upload request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ message: "Arquivo OFX corrompido" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useUploadTransactions(), { wrapper });

    const file = new File(["invalid content"], "corrupted.ofx");

    await expect(
      act(async () => {
        await result.current.upload(file);
      })
    ).rejects.toThrow("Arquivo OFX corrompido");
  });
});
