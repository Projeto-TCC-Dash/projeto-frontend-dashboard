import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import FiscalPage from "./page"
import { FISCAL_LEGAL_NOTICE_TEXT } from "@/components/fiscal/fiscal-legal-notice"

const mockUseTransactions = vi.fn()
const mockUseFiscalSummary = vi.fn()
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
  useTransactions: () => mockUseTransactions(),
}))

vi.mock("@/hooks/use-fiscal", () => ({
  useFiscalSummary: () => mockUseFiscalSummary(),
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
    mockUseTransactions.mockReturnValue({
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
    })
    mockUseFiscalSummary.mockReturnValue({
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
    })
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

  it("hides dashboards and export controls and renders info card when user has no revenue and fiscal is not applicable", () => {
    mockUseTransactions.mockReturnValue({
      transactions: [],
      isLoading: false,
    })
    mockUseFiscalSummary.mockReturnValue({
      summary: {
        year: String(new Date().getFullYear()),
        totalDeductibleExpenses: 0,
        confirmedDeductibleExpenses: 0,
        pendingDocumentationExpenses: 0,
        byCategory: [],
        pjSummary: {
          applicable: false,
          grossRevenueYearToDate: 0,
          annualLimit: 81000,
          ceilingPercentage: 0,
          proLaboreTotal: 0,
          dividendsTotal: 0,
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    render(<FiscalPage />)

    expect(screen.getByTestId("fiscal-unavailable-card")).toBeInTheDocument()
    expect(
      screen.getByText("Planejamento fiscal não aplicável no momento")
    ).toBeInTheDocument()
    expect(screen.queryByLabelText("Selecionar ano fiscal")).not.toBeInTheDocument()
    expect(screen.queryByTestId("export-dossier-pdf")).not.toBeInTheDocument()
    expect(screen.queryByTestId("export-dossier-xlsx")).not.toBeInTheDocument()
    expect(screen.queryByTestId("fiscal-summary-cards")).not.toBeInTheDocument()
    expect(screen.queryByTestId("fiscal-pj-panel")).not.toBeInTheDocument()
    expect(screen.queryByTestId("fiscal-ocr-dropzone")).not.toBeInTheDocument()
    expect(screen.queryByTestId("fiscal-expenses-list")).not.toBeInTheDocument()
  })

  it("keeps dashboards and export controls visible when user has revenue even if PJ is not applicable", () => {
    mockUseTransactions.mockReturnValue({
      transactions: [
        {
          id: "tx-inc",
          externalId: "ext-inc",
          amount: 5000,
          date: `${new Date().getFullYear()}-10-05T12:00:00.000Z`,
          rawDescription: "SALARIO",
          cleanDescription: "Salário",
          category: "Receita",
          source: "OFX",
        },
      ],
      isLoading: false,
    })
    mockUseFiscalSummary.mockReturnValue({
      summary: {
        year: String(new Date().getFullYear()),
        totalDeductibleExpenses: 0,
        confirmedDeductibleExpenses: 0,
        pendingDocumentationExpenses: 0,
        byCategory: [],
        pjSummary: {
          applicable: false,
          grossRevenueYearToDate: 0,
          annualLimit: 81000,
          ceilingPercentage: 0,
          proLaboreTotal: 0,
          dividendsTotal: 0,
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    render(<FiscalPage />)

    expect(
      screen.queryByTestId("fiscal-unavailable-card")
    ).not.toBeInTheDocument()
    expect(screen.getByLabelText("Selecionar ano fiscal")).toBeInTheDocument()
    expect(screen.getByTestId("export-dossier-pdf")).toBeInTheDocument()
    expect(screen.getByTestId("export-dossier-xlsx")).toBeInTheDocument()
    expect(screen.getByTestId("fiscal-summary-cards")).toBeInTheDocument()
    expect(screen.getByTestId("fiscal-ocr-dropzone")).toBeInTheDocument()
    expect(screen.getByTestId("fiscal-expenses-list")).toBeInTheDocument()
  })
})
