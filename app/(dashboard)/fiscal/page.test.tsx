import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import FiscalPage from "./page"
import { FISCAL_LEGAL_NOTICE_TEXT } from "@/components/fiscal/fiscal-legal-notice"

const mockExportDossier = vi.fn()
const mockUpdateFiscal = vi.fn()
const mockUploadOcr = vi.fn()

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "u1", name: "Usuário", email: "u@test.com", hasAiKey: true },
    isAuthenticated: true,
  }),
}))

vi.mock("@/hooks/use-transactions", () => ({
  useTransactions: () => ({
    transactions: [
      {
        id: "tx-1",
        externalId: "ext-1",
        amount: -450,
        date: `${new Date().getFullYear()}-10-10T12:00:00.000Z`,
        rawDescription: "CLINICA VIDA",
        cleanDescription: "Clínica Vida",
        category: "Saúde",
        source: "OFX",
      },
    ],
    isLoading: false,
  }),
}))

vi.mock("@/hooks/use-fiscal", () => ({
  useFiscalSummary: () => ({
    summary: {
      year: String(new Date().getFullYear()),
      totalDeductibleExpenses: 4500,
      confirmedDeductibleExpenses: 3200,
      pendingDocumentationExpenses: 1300,
      byCategory: [
        {
          taxCategory: "HEALTH",
          totalAmount: 4500,
          confirmedAmount: 3200,
          pendingAmount: 1300,
          count: 4,
        },
      ],
      pjSummary: {
        applicable: true,
        grossRevenueYearToDate: 70000,
        annualLimit: 81000,
        ceilingPercentage: 86.4,
        proLaboreTotal: 20000,
        dividendsTotal: 40000,
      },
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useUpdateTransactionFiscal: () => ({
    updateFiscal: mockUpdateFiscal,
    isUpdating: false,
  }),
  useUploadFiscalOcr: () => ({
    uploadOcr: mockUploadOcr,
    isUploading: false,
  }),
  useExportFiscalDossier: () => ({
    exportDossier: mockExportDossier,
    isExporting: false,
    exportFormat: null,
    error: null,
  }),
}))

vi.mock("@/components/ai-key/ai-key-modal", () => ({
  AiKeyModal: () => null,
}))

describe("FiscalPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders fiscal summary, legal disclaimer, PJ panel, OCR zone, and expenses list", () => {
    render(<FiscalPage />)

    expect(screen.getByTestId("fiscal-page")).toBeInTheDocument()
    expect(screen.getByText(FISCAL_LEGAL_NOTICE_TEXT)).toBeInTheDocument()
    expect(screen.getByTestId("fiscal-summary-cards")).toBeInTheDocument()
    expect(screen.getByTestId("fiscal-pj-panel")).toBeInTheDocument()
    expect(screen.getByTestId("fiscal-ocr-dropzone")).toBeInTheDocument()
    expect(screen.getByText("Clínica Vida")).toBeInTheDocument()
  })

  it("triggers PDF and XLSX dossier exports for the selected year", () => {
    render(<FiscalPage />)
    const year = String(new Date().getFullYear())

    fireEvent.click(screen.getByTestId("export-dossier-pdf"))
    expect(mockExportDossier).toHaveBeenCalledWith({ year, format: "pdf" })

    fireEvent.click(screen.getByTestId("export-dossier-xlsx"))
    expect(mockExportDossier).toHaveBeenCalledWith({ year, format: "xlsx" })
  })
})
