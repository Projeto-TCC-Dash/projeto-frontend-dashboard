"use client"

import * as React from "react"
import { Loader2, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { formatCurrencyBRL, formatDateBR } from "@/lib/formatters"
import { updateTransactionFiscalSchema } from "@/lib/validations/fiscal"
import {
  FISCAL_STATUS_LABELS,
  FISCAL_VERIFICATION_STATUSES,
  TAX_CATEGORIES,
  TAX_CATEGORY_LABELS,
  type FiscalVerificationStatus,
  type TaxCategory,
  type Transaction,
  type UpdateTransactionFiscalDTO,
} from "@/src/types/api"

export interface FiscalEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
  onSubmit: (
    transactionId: string,
    data: UpdateTransactionFiscalDTO
  ) => Promise<void>
  isSubmitting?: boolean
}

interface FieldErrors {
  taxCategory?: string
  providerDocument?: string
  providerName?: string
  deductibleAmount?: string
  notes?: string
}

export function FiscalEditDialog({
  open,
  onOpenChange,
  transaction,
  onSubmit,
  isSubmitting = false,
}: FiscalEditDialogProps) {
  const [isTaxDeductible, setIsTaxDeductible] = React.useState(true)
  const [taxCategory, setTaxCategory] = React.useState<TaxCategory | "">(
    "HEALTH"
  )
  const [providerDocument, setProviderDocument] = React.useState("")
  const [providerName, setProviderName] = React.useState("")
  const [deductibleAmount, setDeductibleAmount] = React.useState("")
  const [status, setStatus] =
    React.useState<FiscalVerificationStatus>("PENDING")
  const [notes, setNotes] = React.useState("")
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({})
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!transaction || !open) return
    const fiscal = transaction.fiscal
    setIsTaxDeductible(fiscal ? fiscal.isTaxDeductible : true)
    setTaxCategory(fiscal?.taxCategory ?? "HEALTH")
    setProviderDocument(fiscal?.providerDocument ?? "")
    setProviderName(fiscal?.providerName ?? "")
    const defaultAmount =
      fiscal?.deductibleAmount ?? Math.abs(transaction.amount)
    setDeductibleAmount(
      Number.isFinite(defaultAmount) && defaultAmount > 0
        ? String(defaultAmount)
        : ""
    )
    setStatus(fiscal?.status ?? "PENDING")
    setNotes(fiscal?.notes ?? "")
    setFieldErrors({})
    setSubmitError(null)
  }, [transaction, open])

  if (!transaction) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})
    setSubmitError(null)

    const parsedAmount =
      deductibleAmount.trim() === ""
        ? undefined
        : Number(deductibleAmount.replace(",", "."))

    const rawPayload = {
      isTaxDeductible,
      taxCategory:
        isTaxDeductible && taxCategory !== "" ? taxCategory : undefined,
      providerDocument,
      providerName,
      deductibleAmount:
        deductibleAmount.trim() === "" ? undefined : parsedAmount,
      status,
      notes,
    }

    const result = updateTransactionFiscalSchema.safeParse(rawPayload)
    if (!result.success) {
      const nextErrors: FieldErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FieldErrors | undefined
        if (key && !nextErrors[key]) {
          nextErrors[key] = issue.message
        }
      }
      setFieldErrors(nextErrors)
      return
    }

    try {
      await onSubmit(transaction.id, result.data)
      onOpenChange(false)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível salvar a classificação fiscal."
      setSubmitError(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        onClose={() => onOpenChange(false)}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="size-4 text-primary" />
            Classificação Fiscal (IRPF)
          </DialogTitle>
          <DialogDescription>
            {transaction.cleanDescription} ·{" "}
            {formatCurrencyBRL(Math.abs(transaction.amount))} ·{" "}
            {formatDateBR(transaction.date)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 p-3">
            <div className="space-y-0.5">
              <label
                htmlFor="fiscal-is-deductible"
                className="text-sm font-medium cursor-pointer text-foreground"
              >
                Despesa dedutível no IRPF
              </label>
              <p className="text-xs text-muted-foreground">
                Marque para contabilizar no consolidado fiscal anual.
              </p>
            </div>
            <input
              id="fiscal-is-deductible"
              type="checkbox"
              checked={isTaxDeductible}
              onChange={(e) => setIsTaxDeductible(e.target.checked)}
              className="size-4 rounded border-border accent-primary cursor-pointer"
            />
          </div>

          {isTaxDeductible && (
            <>
              <div className="space-y-1.5">
                <label
                  htmlFor="fiscal-tax-category"
                  className="text-xs font-medium text-foreground"
                >
                  Categoria Fiscal
                </label>
                <select
                  id="fiscal-tax-category"
                  value={taxCategory}
                  onChange={(e) =>
                    setTaxCategory(e.target.value as TaxCategory | "")
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Selecione a categoria...</option>
                  {TAX_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {TAX_CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
                {fieldErrors.taxCategory && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.taxCategory}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="fiscal-provider-doc"
                    className="text-xs font-medium text-foreground"
                  >
                    CPF/CNPJ do Prestador
                  </label>
                  <Input
                    id="fiscal-provider-doc"
                    placeholder="Ex: 12345678000195"
                    value={providerDocument}
                    onChange={(e) => setProviderDocument(e.target.value)}
                  />
                  {fieldErrors.providerDocument && (
                    <p className="text-xs text-destructive">
                      {fieldErrors.providerDocument}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="fiscal-deductible-amount"
                    className="text-xs font-medium text-foreground"
                  >
                    Valor Dedutível (R$)
                  </label>
                  <Input
                    id="fiscal-deductible-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="450.00"
                    value={deductibleAmount}
                    onChange={(e) => setDeductibleAmount(e.target.value)}
                  />
                  {fieldErrors.deductibleAmount && (
                    <p className="text-xs text-destructive">
                      {fieldErrors.deductibleAmount}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="fiscal-provider-name"
                  className="text-xs font-medium text-foreground"
                >
                  Nome do Prestador
                </label>
                <Input
                  id="fiscal-provider-name"
                  placeholder="Ex: Hospital Albert Einstein"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                />
                {fieldErrors.providerName && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.providerName}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="fiscal-status"
                  className="text-xs font-medium text-foreground"
                >
                  Status Documental
                </label>
                <select
                  id="fiscal-status"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as FiscalVerificationStatus)
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {FISCAL_VERIFICATION_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {FISCAL_STATUS_LABELS[st]}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="fiscal-notes"
              className="text-xs font-medium text-foreground"
            >
              Observações
            </label>
            <Input
              id="fiscal-notes"
              placeholder="Ex: Recibo anexo, consulta particular..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            {fieldErrors.notes && (
              <p className="text-xs text-destructive">{fieldErrors.notes}</p>
            )}
          </div>

          {submitError && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              {submitError}
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Classificação"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
