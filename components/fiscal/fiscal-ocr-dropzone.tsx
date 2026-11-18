"use client"

import * as React from "react"
import {
  FileUp,
  Sparkles,
  Key,
  Loader2,
  CheckCircle2,
  Link2,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatCurrencyBRL, formatDateBR } from "@/lib/formatters"
import { validateFiscalOcrFile } from "@/lib/validations/fiscal"
import { cn } from "@/lib/utils"
import type {
  FiscalOcrResponse,
  FiscalOcrSuggestedMatch,
  TaxCategory,
} from "@/src/types/api"

export interface FiscalOcrDropzoneProps {
  hasAiKey: boolean
  onOpenAiKeyModal: () => void
  onUploadReceipt: (file: File) => Promise<FiscalOcrResponse>
  onLinkMatch: (
    match: FiscalOcrSuggestedMatch,
    ocrResult: FiscalOcrResponse,
    taxCategory: TaxCategory
  ) => Promise<void>
  isUploading?: boolean
  isLinking?: boolean
}

const CONFIDENCE_LABELS: Record<
  FiscalOcrSuggestedMatch["confidence"],
  { label: string; variant: "success" | "warning" | "secondary" }
> = {
  HIGH: { label: "Alta Confiança", variant: "success" },
  MEDIUM: { label: "Média Confiança", variant: "warning" },
  LOW: { label: "Baixa Confiança", variant: "secondary" },
}

export function FiscalOcrDropzone({
  hasAiKey,
  onOpenAiKeyModal,
  onUploadReceipt,
  onLinkMatch,
  isUploading = false,
  isLinking = false,
}: FiscalOcrDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [validationError, setValidationError] = React.useState<string | null>(
    null
  )
  const [ocrResult, setOcrResult] = React.useState<FiscalOcrResponse | null>(
    null
  )
  const [reconcileOpen, setReconcileOpen] = React.useState(false)
  const [selectedTaxCategory, setSelectedTaxCategory] =
    React.useState<TaxCategory>("HEALTH")
  const [linkedMessage, setLinkedMessage] = React.useState<string | null>(null)

  const processFile = async (file: File) => {
    setValidationError(null)
    setLinkedMessage(null)

    const validation = validateFiscalOcrFile(file)
    if (!validation.isValid) {
      setValidationError(validation.error ?? "Arquivo inválido")
      return
    }

    try {
      const result = await onUploadReceipt(file)
      setOcrResult(result)
      setReconcileOpen(true)
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Falha ao processar comprovante via OCR."
      setValidationError(msg)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      void processFile(file)
    }
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (!hasAiKey || isUploading) return
    const file = e.dataTransfer.files?.[0]
    if (file) {
      void processFile(file)
    }
  }

  return (
    <>
      <Card data-testid="fiscal-ocr-dropzone">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                Leitura Inteligente de Recibos (OCR)
              </CardTitle>
            </div>
            <Badge variant="secondary" className="text-[11px]">
              PDF, PNG, JPG até 10MB
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Envie notas fiscais ou recibos médicos/educacionais para extração
            automática e conciliação com lançamentos bancários.
          </p>
        </CardHeader>

        <CardContent className="space-y-3">
          {!hasAiKey ? (
            <div
              data-testid="fiscal-ocr-byok-required"
              className="flex flex-col items-start justify-between gap-3 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 p-4 sm:flex-row sm:items-center"
            >
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-foreground">
                  Chave do Gemini necessária para leitura OCR
                </p>
                <p className="text-muted-foreground">
                  Você ainda pode classificar despesas manualmente abaixo, ou
                  ativar sua chave gratuita BYOK para leitura automática de
                  recibos.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onOpenAiKeyModal}
                className="shrink-0 gap-1.5"
              >
                <Key className="size-3.5" />
                Configurar Chave IA
              </Button>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
                className="hidden"
                data-testid="fiscal-ocr-file-input"
                onChange={handleFileChange}
              />

              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="size-6 animate-spin text-primary" />
                  <p className="text-xs font-medium text-foreground">
                    Extraindo dados fiscais com IA...
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-2 rounded-full bg-muted/60 p-2.5 text-muted-foreground">
                    <FileUp className="size-5" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Arraste seu comprovante aqui ou clique para enviar
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PDF, PNG, JPG ou WebP com até 10 MB
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => inputRef.current?.click()}
                  >
                    Selecionar Comprovante
                  </Button>
                </>
              )}
            </div>
          )}

          {validationError ? (
            <div
              data-testid="fiscal-ocr-error"
              className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              <AlertCircle className="size-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          ) : null}

          {linkedMessage ? (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{linkedMessage}</span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Modal de Conciliação OCR */}
      <Dialog open={reconcileOpen} onOpenChange={setReconcileOpen}>
        <DialogContent
          data-testid="fiscal-ocr-reconcile-modal"
          onClose={() => setReconcileOpen(false)}
        >
          <DialogHeader>
            <DialogTitle>Dados Extraídos do Comprovante</DialogTitle>
            <DialogDescription>
              Arquivo: {ocrResult?.originalFilename}
            </DialogDescription>
          </DialogHeader>

          {ocrResult ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs space-y-1">
                <p>
                  <span className="text-muted-foreground">Prestador: </span>
                  <span className="font-semibold text-foreground">
                    {ocrResult.extractedData.providerName || "Não identificado"}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">CPF/CNPJ: </span>
                  <span className="font-mono text-foreground">
                    {ocrResult.extractedData.providerDocument ||
                      "Não identificado"}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Valor: </span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {ocrResult.extractedData.totalAmount !== undefined
                      ? formatCurrencyBRL(ocrResult.extractedData.totalAmount)
                      : "Não identificado"}
                  </span>
                </p>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="ocr-tax-category"
                  className="text-xs font-medium text-foreground"
                >
                  Categoria Fiscal ao Vincular
                </label>
                <select
                  id="ocr-tax-category"
                  value={selectedTaxCategory}
                  onChange={(e) =>
                    setSelectedTaxCategory(e.target.value as TaxCategory)
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
                >
                  <option value="HEALTH">Saúde</option>
                  <option value="EDUCATION">Educação / Instrução</option>
                  <option value="PENSION_PGBL">
                    Previdência Complementar (PGBL)
                  </option>
                  <option value="ALIMONY">Pensão Alimentícia Judicial</option>
                  <option value="BUSINESS_EXPENSE_BOOK">
                    Livro-Caixa Profissional
                  </option>
                  <option value="OTHER_DEDUCTIBLE">
                    Outras Despesas Dedutíveis
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">
                  Transações Compatíveis Sugeridas
                </p>
                {ocrResult.suggestedMatches.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    Nenhuma transação bancária compatível encontrada
                    automaticamente. Você pode classificar manualmente na lista
                    de despesas.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {ocrResult.suggestedMatches.map((match) => {
                      const conf = CONFIDENCE_LABELS[match.confidence]
                      return (
                        <div
                          key={match.transactionId}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3 text-xs"
                        >
                          <div className="min-w-0 space-y-0.5">
                            <p className="font-medium text-foreground truncate">
                              {match.cleanDescription}
                            </p>
                            <div className="flex items-center gap-2 text-muted-foreground tabular-nums">
                              <span>{formatDateBR(match.date)}</span>
                              <span>•</span>
                              <span className="font-semibold text-foreground">
                                {formatCurrencyBRL(match.amount)}
                              </span>
                              <Badge variant={conf.variant} className="text-[10px]">
                                {conf.label}
                              </Badge>
                            </div>
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            disabled={isLinking}
                            data-testid={`link-ocr-match-${match.transactionId}`}
                            onClick={async () => {
                              await onLinkMatch(
                                match,
                                ocrResult,
                                selectedTaxCategory
                              )
                              setReconcileOpen(false)
                              setLinkedMessage(
                                `Comprovante vinculado à transação "${match.cleanDescription}"!`
                              )
                            }}
                            className="gap-1.5"
                          >
                            <Link2 className="size-3.5" />
                            Vincular
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
