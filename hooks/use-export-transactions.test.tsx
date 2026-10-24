import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useExportTransactions } from "./use-export-transactions";
import * as exportUtils from "@/lib/export-utils";

describe("useExportTransactions Hook", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("auth_token", "jwt-test-token");
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("deve exportar CSV com mês selecionado e disparar triggerBlobDownload", async () => {
    const triggerSpy = vi
      .spyOn(exportUtils, "triggerBlobDownload")
      .mockImplementation(() => {});

    const mockBlob = new Blob(["CSV DATA"], { type: "text/csv" });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({
        "content-type": "text/csv",
        "content-disposition": 'attachment; filename="extrato-2026-10.csv"',
      }),
      blob: async () => mockBlob,
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useExportTransactions());

    await act(async () => {
      await result.current.exportTransactions({
        format: "csv",
        month: "2026-10",
      });
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/transactions/export?format=csv&month=2026-10"),
      expect.objectContaining({
        method: "GET",
        headers: expect.any(Headers),
      })
    );
    expect(triggerSpy).toHaveBeenCalledWith(mockBlob, "extrato-2026-10.csv");
  });

  it("deve exportar XLSX com filtros de conta e categoria", async () => {
    const triggerSpy = vi
      .spyOn(exportUtils, "triggerBlobDownload")
      .mockImplementation(() => {});

    const mockBlob = new Blob(["XLSX DATA"], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/octet-stream" }),
      blob: async () => mockBlob,
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useExportTransactions());

    await act(async () => {
      await result.current.exportTransactions({
        format: "xlsx",
        accountId: "acc-123",
        category: "Alimentação",
      });
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        "/api/transactions/export?format=xlsx&accountId=acc-123&category=Alimenta%C3%A7%C3%A3o"
      ),
      expect.any(Object)
    );
    expect(triggerSpy).toHaveBeenCalledWith(mockBlob, "extrato-financeiro.xlsx");
  });

  it("deve lançar erro e armazenar mensagem quando a requisição falhar", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ message: "Erro interno no gerador de PDF" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useExportTransactions());

    await act(async () => {
      await expect(
        result.current.exportTransactions({
          format: "pdf",
        })
      ).rejects.toThrow("Erro interno no gerador de PDF");
    });

    expect(result.current.error).toBe("Erro interno no gerador de PDF");
  });
});
