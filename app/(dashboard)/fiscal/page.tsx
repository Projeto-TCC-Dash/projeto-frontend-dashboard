"use client"

import * as React from "react"
import Link from "next/link"
import {
  Download,
  FileSpreadsheet,
  Loader2,
  Scale,
  AlertCircle,
  ArrowRight,
  Wallet,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FiscalLegalNotice } from "@/components/fiscal/fiscal-legal-notice"
import { FiscalSummaryCards } from "@/components/fiscal/fiscal-summary-cards"
import { FiscalPjPanel } from "@/components/fiscal/fiscal-pj-panel"
import { FiscalOcrDropzone } from "@/components/fiscal/fiscal-ocr-dropzone"
import { FiscalExpensesList } from "@/components/fiscal/fiscal-expenses-list"
import { FiscalEditDialog } from "@/components/fiscal/fiscal-edit-dialog"
import { AiKeyModal } from "@/components/ai-key/ai-key-modal"
import { useAuth } from "@/hooks/use-auth"
import { useTransactions } from "@/hooks/use-transactions"
import {
  useExportFiscalDossier,
  useFiscalSummary,
  useUpdateTransactionFiscal,
  useUploadFiscalOcr,
} from "@/hooks/use-fiscal"
import {
  APP_ROUTES,
  type FiscalOcrResponse,
  type FiscalOcrSuggestedMatch,
  type TaxCategory,
  type Transaction,
  type TransactionFiscalMetadata,
  type UpdateTransactionFiscalDTO,
} from "@/src/types/api"

export default function FiscalPage() {
  const currentYear = String(new Date().getFullYear())
  const yearOptions = React.useMemo(() => {
    const y = Number(currentYear)
    return [String(y - 2), String(y - 1), currentYear, String(y + 1)]
  }, [currentYear])

  const [selectedYear, setSelectedYear] = React.useState(currentYear)
  const [editingTx, setEditingTx] = React.useState<Transaction | null>(null)
  const [aiKeyModalOpen, setAiKeyModalOpen] = React.useState(false)
  const [fiscalOverrides, setFiscalOverrides] = React.useState<
    Record<string, TransactionFiscalMetadata>
  >({})

  const { user } = useAuth()
  const { transactions, isLoading: isTxLoading } = useTransactions()
  const {
    summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
    refetch: refetchSummary,
  } = useFiscalSummary(selectedYear)
  const { updateFiscal, isUpdating } = useUpdateTransactionFiscal()
  const { uploadOcr, isUploading } = useUploadFiscalOcr()
  const {
    exportDossier,
    isExporting,
    exportFormat,
    error: exportError,
  } = useExportFiscalDossier()

  const mergedTransactions = React.useMemo(() => {
    return transactions.map((tx) => {
      const override = fiscalOverrides[tx.id]
      if (!override) return tx
      return { ...tx, fiscal: override }
    })
  }, [transactions, fiscalOverrides])

  const isPjApplicable = Boolean(summary?.pjSummary?.applicable)
  const hasPjRevenue = (summary?.pjSummary?.grossRevenueYearToDate ?? 0) > 0
  const hasTransactionRevenue = React.useMemo(
    () =>
      mergedTransactions.some(
        (tx) => tx.category === "Receita" && Math.abs(tx.amount) > 0
      ),
    [mergedTransactions]
  )
  const hasDeductibleExpenses = (summary?.totalDeductibleExpenses ?? 0) > 0
  const isFiscalUnavailable =
    !isSummaryLoading &&
    !isTxLoading &&
    !isSummaryError &&
    !isPjApplicable &&
    !hasPjRevenue &&
    !hasTransactionRevenue &&
    !hasDeductibleExpenses

  const handleSaveFiscal = async (
    transactionId: string,
    data: UpdateTransactionFiscalDTO
  ) => {
    const res = await updateFiscal({ transactionId, data })
    if (res?.fiscal) {
      setFiscalOverrides((prev) => ({
        ...prev,
        [transactionId]: res.fiscal!,
      }))
    }
  }

  const handleLinkOcrMatch = async (
    match: FiscalOcrSuggestedMatch,
    ocrResult: FiscalOcrResponse,
    taxCategory: TaxCategory
  ) => {
    const data: UpdateTransactionFiscalDTO = {
      isTaxDeductible: true,
      taxCategory,
      providerDocument: ocrResult.extractedData.providerDocument,
      providerName: ocrResult.extractedData.providerName,
      deductibleAmount:
        ocrResult.extractedData.totalAmount ?? Math.abs(match.amount),
      status: "CONFIRMED",
      notes: `Comprovante OCR: ${ocrResult.originalFilename}`,
    }
    await handleSaveFiscal(match.transactionId, data)
  }

  return (
    <div data-testid="fiscal-page" className="space-y-6">
      {/* Cabeçalho e Exportação */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Scale className="size-6 text-primary" />
            Planejamento Fiscal (IRPF &amp; PJ)
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Classifique despesas dedutíveis, concilie recibos via OCR e
            exporte seu dossiê anual auditável.
          </p>
        </div>

        {!isFiscalUnavailable && (
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Selecionar ano fiscal"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  Exercício {y}
                </option>
              ))}
            </select>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isExporting}
              onClick={() => exportDossier({ year: selectedYear, format: "pdf" })}
              data-testid="export-dossier-pdf"
            >
              {isExporting && exportFormat === "pdf" ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <Download className="mr-1.5 size-4" />
              )}
              Dossiê PDF
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isExporting}
              onClick={() =>
                exportDossier({ year: selectedYear, format: "xlsx" })
              }
              data-testid="export-dossier-xlsx"
            >
              {isExporting && exportFormat === "xlsx" ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="mr-1.5 size-4" />
              )}
              Planilha Excel
            </Button>
          </div>
        )}
      </div>

      {/* Aviso Legal Obrigatório (FR-014) */}
      <FiscalLegalNotice />

      {exportError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive"
        >
          <AlertCircle className="size-4 shrink-0" />
          <span>{exportError}</span>
        </div>
      )}

      {isSummaryError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive"
        >
          <span>
            Não foi possível carregar o consolidado fiscal:{" "}
            {summaryError?.message ?? "Erro inesperado"}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void refetchSummary()}
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {isFiscalUnavailable ? (
        <Card
          data-testid="fiscal-unavailable-card"
          className="border-dashed p-6 text-center sm:p-10"
        >
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
            <Scale className="size-6" />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Planejamento fiscal não aplicável no momento
          </h2>
          <p className="mx-auto mt-1.5 max-w-lg text-sm text-muted-foreground">
            Você ainda não possui faturamento registrado e o enquadramento fiscal
            não se aplica ao seu perfil atual. Quando houver receitas
            cadastradas ou atuação como PJ/Autônomo no perfil financeiro, os
            painéis e exportações fiscais serão exibidos aqui.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={APP_ROUTES.METAS}
              className={buttonVariants({ variant: "default", size: "lg" })}
            >
              Atualizar Perfil Financeiro
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href={APP_ROUTES.TRANSACTIONS}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              <Wallet className="size-4" />
              Registrar Receitas
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {/* Consolidado IRPF Anual */}
          <FiscalSummaryCards summary={summary} isLoading={isSummaryLoading} />

          {/* Painel Condicional PJ / MEI */}
          <FiscalPjPanel pjSummary={summary?.pjSummary} />

          {/* OCR Inteligente de Comprovantes */}
          <FiscalOcrDropzone
            hasAiKey={Boolean(user?.hasAiKey)}
            onOpenAiKeyModal={() => setAiKeyModalOpen(true)}
            onUploadReceipt={uploadOcr}
            onLinkMatch={handleLinkOcrMatch}
            isUploading={isUploading}
            isLinking={isUpdating}
          />

          {/* Lista de Despesas Elegíveis do Exercício */}
          <FiscalExpensesList
            transactions={mergedTransactions}
            year={selectedYear}
            isLoading={isTxLoading}
            onEditTransaction={setEditingTx}
          />

          {/* Modal de Classificação Manual */}
          <FiscalEditDialog
            open={Boolean(editingTx)}
            onOpenChange={(open) => {
              if (!open) setEditingTx(null)
            }}
            transaction={editingTx}
            onSubmit={handleSaveFiscal}
            isSubmitting={isUpdating}
          />

          {/* Modal BYOK Gemini */}
          <AiKeyModal open={aiKeyModalOpen} onOpenChange={setAiKeyModalOpen} />
        </>
      )}
    </div>
  )
}
