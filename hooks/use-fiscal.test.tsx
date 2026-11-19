import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "./use-auth"
import {
  useExportFiscalDossier,
  useFiscalSummary,
  useUpdateTransactionFiscal,
  useUploadFiscalOcr,
} from "./use-fiscal"
import * as exportUtils from "@/lib/export-utils"
import type {
  FiscalAnnualSummary,
  FiscalOcrResponse,
  UpdateTransactionFiscalResponse,
} from "@/src/types/api"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))

describe("hooks/use-fiscal", () => {
  let queryClient: QueryClient

  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem("auth_token", "valid-token")
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ id: "u1", email: "user@test.com", hasAiKey: true })
    )
    vi.restoreAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    )
  }

  it("fetches annual fiscal summary for given year", async () => {
    const mockSummary: FiscalAnnualSummary = {
      year: "2026",
      totalDeductibleExpenses: 8450,
      confirmedDeductibleExpenses: 7200,
      pendingDocumentationExpenses: 1250,
      byCategory: [
        {
          taxCategory: "HEALTH",
          totalAmount: 5400,
          confirmedAmount: 5400,
          pendingAmount: 0,
          count: 4,
        },
      ],
      pjSummary: {
        applicable: true,
        grossRevenueYearToDate: 68500,
        annualLimit: 81000,
        ceilingPercentage: 84.6,
        proLaboreTotal: 24000,
        dividendsTotal: 38000,
      },
    }

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockSummary,
    })
    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => useFiscalSummary("2026"), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.summary?.totalDeductibleExpenses).toBe(8450)
    expect(result.current.summary?.pjSummary.ceilingPercentage).toBe(84.6)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/fiscal/summary?year=2026"),
      expect.anything()
    )
  })

  it("updates transaction fiscal classification via PATCH /api/transactions/:id/fiscal", async () => {
    const mockResponse: UpdateTransactionFiscalResponse = {
      id: "tx-1",
      amount: -450,
      cleanDescription: "Consulta Médica",
      fiscal: {
        isTaxDeductible: true,
        taxCategory: "HEALTH",
        providerDocument: "12345678000195",
        providerName: "Hospital Albert Einstein",
        deductibleAmount: 450,
        status: "CONFIRMED",
      },
    }

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockResponse,
    })
    vi.stubGlobal("fetch", fetchMock)
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries")

    const { result } = renderHook(() => useUpdateTransactionFiscal(), {
      wrapper,
    })

    await act(async () => {
      const res = await result.current.updateFiscal({
        transactionId: "tx-1",
        data: {
          isTaxDeductible: true,
          taxCategory: "HEALTH",
          providerDocument: "12345678000195",
          providerName: "Hospital Albert Einstein",
          status: "CONFIRMED",
        },
      })
      expect(res.fiscal.status).toBe("CONFIRMED")
    })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/transactions/tx-1/fiscal"),
      expect.objectContaining({ method: "PATCH" })
    )
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["fiscal"] })
  })

  it("uploads OCR receipt via multipart POST and handles 403 AI_KEY_REQUIRED", async () => {
    const mockOcr: FiscalOcrResponse = {
      proofDocumentId: "doc-1",
      originalFilename: "recibo.pdf",
      extractedData: {
        providerDocument: "12345678000195",
        providerName: "Clínica Sorriso",
        totalAmount: 450,
        issueDate: "2026-11-10",
      },
      suggestedMatches: [
        {
          transactionId: "tx-50",
          date: "2026-11-10T14:00:00.000Z",
          amount: -450,
          cleanDescription: "CLINICA SORRISO",
          confidence: "HIGH",
        },
      ],
    }

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockOcr,
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          code: "AI_KEY_REQUIRED",
          message: "Configure sua chave do Gemini",
        }),
      })
    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => useUploadFiscalOcr(), { wrapper })
    const file = new File(["pdf"], "recibo.pdf", { type: "application/pdf" })

    await act(async () => {
      const res = await result.current.uploadOcr(file)
      expect(res.suggestedMatches).toHaveLength(1)
    })

    await expect(
      act(async () => {
        await result.current.uploadOcr(file)
      })
    ).rejects.toThrow("Configure sua chave do Gemini")
  })

  it("downloads fiscal dossier PDF/XLSX blob with filename from Content-Disposition", async () => {
    const blob = new Blob(["%PDF-1.4"], { type: "application/pdf" })
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({
        "content-type": "application/pdf",
        "content-disposition": 'attachment; filename="dossie-fiscal-2026.pdf"',
      }),
      blob: async () => blob,
    })
    vi.stubGlobal("fetch", fetchMock)
    const downloadSpy = vi
      .spyOn(exportUtils, "triggerBlobDownload")
      .mockImplementation(() => {})

    const { result } = renderHook(() => useExportFiscalDossier(), { wrapper })

    await act(async () => {
      await result.current.exportDossier({ year: "2026", format: "pdf" })
    })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/fiscal/dossier?year=2026&format=pdf"),
      expect.objectContaining({ method: "GET" })
    )
    expect(downloadSpy).toHaveBeenCalledWith(blob, "dossie-fiscal-2026.pdf")
  })
})
