import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react"
import {
  FiscalLegalNotice,
  FISCAL_LEGAL_NOTICE_TEXT,
} from "./fiscal-legal-notice"
import { FiscalSummaryCards } from "./fiscal-summary-cards"
import { FiscalPjPanel } from "./fiscal-pj-panel"
import { FiscalOcrDropzone } from "./fiscal-ocr-dropzone"
import { FiscalEditDialog } from "./fiscal-edit-dialog"
import { FiscalExpensesList } from "./fiscal-expenses-list"
import type {
  FiscalAnnualSummary,
  FiscalOcrResponse,
  Transaction,
} from "@/src/types/api"

describe("Fiscal Components", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders FiscalLegalNotice with the mandatory disclaimer", () => {
    render(<FiscalLegalNotice />)
    expect(screen.getByTestId("fiscal-legal-notice")).toBeInTheDocument()
    expect(screen.getByText(FISCAL_LEGAL_NOTICE_TEXT)).toBeInTheDocument()
  })

  it("renders FiscalSummaryCards with annual IRPF totals and categories", () => {
    const summary: FiscalAnnualSummary = {
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
          count: 6,
        },
        {
          taxCategory: "EDUCATION",
          totalAmount: 3050,
          confirmedAmount: 1800,
          pendingAmount: 1250,
          count: 3,
        },
      ],
      pjSummary: {
        applicable: false,
        grossRevenueYearToDate: 0,
        annualLimit: 81000,
        ceilingPercentage: 0,
        proLaboreTotal: 0,
        dividendsTotal: 0,
      },
    }

    render(<FiscalSummaryCards summary={summary} />)
    expect(screen.getByTestId("fiscal-summary-cards")).toBeInTheDocument()
    expect(screen.getByText(/8\.450,00/)).toBeInTheDocument()
    expect(screen.getByText(/7\.200,00/)).toBeInTheDocument()
    expect(screen.getAllByText(/1\.250,00/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Saúde")).toBeInTheDocument()
  })

  it("renders FiscalPjPanel with alert badge when ceiling >= 80% and hides when not applicable", () => {
    const { rerender } = render(
      <FiscalPjPanel
        pjSummary={{
          applicable: false,
          grossRevenueYearToDate: 0,
          annualLimit: 81000,
          ceilingPercentage: 0,
          proLaboreTotal: 0,
          dividendsTotal: 0,
        }}
      />
    )
    expect(screen.queryByTestId("fiscal-pj-panel")).not.toBeInTheDocument()

    rerender(
      <FiscalPjPanel
        pjSummary={{
          applicable: true,
          grossRevenueYearToDate: 68500,
          annualLimit: 81000,
          ceilingPercentage: 84.6,
          proLaboreTotal: 24000,
          dividendsTotal: 38000,
        }}
      />
    )
    expect(screen.getByTestId("fiscal-pj-panel")).toBeInTheDocument()
    expect(screen.getByTestId("mei-ceiling-alert")).toHaveTextContent(
      /80% do teto MEI/i
    )
    expect(screen.getByText(/24\.000,00/)).toBeInTheDocument()
    expect(screen.getByText(/38\.000,00/)).toBeInTheDocument()
  })

  it("renders BYOK fallback in FiscalOcrDropzone when user lacks AI key", () => {
    const onOpenAiKeyModal = vi.fn()
    render(
      <FiscalOcrDropzone
        hasAiKey={false}
        onOpenAiKeyModal={onOpenAiKeyModal}
        onUploadReceipt={vi.fn()}
        onLinkMatch={vi.fn()}
      />
    )

    expect(screen.getByTestId("fiscal-ocr-byok-required")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /Configurar Chave IA/i }))
    expect(onOpenAiKeyModal).toHaveBeenCalledTimes(1)
  })

  it("rejects oversized file > 10MB and handles OCR upload + match link", async () => {
    const ocrResponse: FiscalOcrResponse = {
      proofDocumentId: "doc-1",
      originalFilename: "recibo-clinica.pdf",
      extractedData: {
        providerDocument: "12345678000195",
        providerName: "Clínica Sorriso",
        totalAmount: 450,
        issueDate: "2026-11-10",
        description: "Consulta Odontológica",
      },
      suggestedMatches: [
        {
          transactionId: "tx-1",
          date: "2026-11-10T14:00:00.000Z",
          amount: -450,
          cleanDescription: "CLINICA SORRISO",
          confidence: "HIGH",
        },
      ],
    }

    const onUploadReceipt = vi.fn().mockResolvedValue(ocrResponse)
    const onLinkMatch = vi.fn().mockResolvedValue(undefined)

    render(
      <FiscalOcrDropzone
        hasAiKey={true}
        onOpenAiKeyModal={vi.fn()}
        onUploadReceipt={onUploadReceipt}
        onLinkMatch={onLinkMatch}
      />
    )

    const fileInput = screen.getByTestId(
      "fiscal-ocr-file-input"
    ) as HTMLInputElement

    // 1. Oversized file (>10MB) triggers validation error
    const bigFile = new File(["x"], "grande.pdf", { type: "application/pdf" })
    Object.defineProperty(bigFile, "size", { value: 11 * 1024 * 1024 })
    fireEvent.change(fileInput, { target: { files: [bigFile] } })

    expect(await screen.findByTestId("fiscal-ocr-error")).toHaveTextContent(
      /10MB/i
    )
    expect(onUploadReceipt).not.toHaveBeenCalled()

    // 2. Valid file triggers upload and reconcile modal
    const validFile = new File(["pdf-bytes"], "recibo-clinica.pdf", {
      type: "application/pdf",
    })
    fireEvent.change(fileInput, { target: { files: [validFile] } })

    expect(
      await screen.findByTestId("fiscal-ocr-reconcile-modal")
    ).toBeInTheDocument()
    expect(screen.getByText("Clínica Sorriso")).toBeInTheDocument()

    fireEvent.click(screen.getByTestId("link-ocr-match-tx-1"))

    await waitFor(() => {
      expect(onLinkMatch).toHaveBeenCalledWith(
        ocrResponse.suggestedMatches[0],
        ocrResponse,
        "HEALTH"
      )
    })
  })

  it("validates CPF/CNPJ in FiscalEditDialog and submits formatted payload", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onOpenChange = vi.fn()
    const tx: Transaction = {
      id: "tx-health-1",
      externalId: "ext-health-1",
      amount: -320,
      date: "2026-10-05T12:00:00.000Z",
      rawDescription: "HOSPITAL MODELO",
      cleanDescription: "Hospital Modelo",
      category: "Saúde",
      source: "OFX",
    }

    render(
      <FiscalEditDialog
        open={true}
        onOpenChange={onOpenChange}
        transaction={tx}
        onSubmit={onSubmit}
      />
    )

    const docInput = screen.getByLabelText("CPF/CNPJ do Prestador")
    fireEvent.change(docInput, { target: { value: "12345" } })

    const form = docInput.closest("form")!
    fireEvent.submit(form)

    expect(
      await screen.findByText(/11 \(CPF\) ou 14 \(CNPJ\) dígitos/i)
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()

    fireEvent.change(docInput, { target: { value: "12.345.678/0001-95" } })
    fireEvent.change(screen.getByLabelText("Nome do Prestador"), {
      target: { value: "Hospital Modelo LTDA" },
    })
    fireEvent.submit(form)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("tx-health-1", {
        isTaxDeductible: true,
        taxCategory: "HEALTH",
        providerDocument: "12345678000195",
        providerName: "Hospital Modelo LTDA",
        deductibleAmount: 320,
        status: "PENDING",
        notes: undefined,
      })
    })
  })

  it("filters year expenses in FiscalExpensesList and excludes Receita / Pagamento de Fatura", () => {
    const onEdit = vi.fn()
    const transactions: Transaction[] = [
      {
        id: "1",
        externalId: "ext-1",
        amount: 5000,
        date: "2026-10-01T10:00:00.000Z",
        rawDescription: "SALARIO",
        cleanDescription: "Salário",
        category: "Receita",
        source: "OFX",
      },
      {
        id: "2",
        externalId: "ext-2",
        amount: -1200,
        date: "2026-10-02T10:00:00.000Z",
        rawDescription: "PAGAMENTO FATURA NUBANK",
        cleanDescription: "Pagamento Fatura Nubank",
        category: "Pagamento de Fatura",
        source: "OFX",
      },
      {
        id: "3",
        externalId: "ext-3",
        amount: -450,
        date: "2026-10-10T10:00:00.000Z",
        rawDescription: "CONSULTA DRA ANA",
        cleanDescription: "Consulta Dra Ana",
        category: "Saúde",
        source: "OFX",
        fiscal: {
          isTaxDeductible: true,
          taxCategory: "HEALTH",
          status: "CONFIRMED",
          deductibleAmount: 450,
        },
      },
      {
        id: "4",
        externalId: "ext-4",
        amount: -200,
        date: "2025-12-10T10:00:00.000Z",
        rawDescription: "DESPESA ANO ANTERIOR",
        cleanDescription: "Despesa ano anterior",
        category: "Saúde",
        source: "OFX",
      },
    ]

    render(
      <FiscalExpensesList
        transactions={transactions}
        year="2026"
        onEditTransaction={onEdit}
      />
    )

    expect(screen.queryByText("Salário")).not.toBeInTheDocument()
    expect(
      screen.queryByText("Pagamento Fatura Nubank")
    ).not.toBeInTheDocument()
    expect(screen.queryByText("Despesa ano anterior")).not.toBeInTheDocument()
    expect(screen.getByText("Consulta Dra Ana")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Editar Fiscal/i }))
    expect(onEdit).toHaveBeenCalledWith(transactions[2])
  })
})
