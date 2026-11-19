"use client"

import * as React from "react"
import { Loader2, Plus, Trash2, Target } from "lucide-react"
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
import { formatMonthYear } from "@/lib/formatters"
import { setBudgetPlanSchema } from "@/lib/validations/budget"
import {
  CANONICAL_CATEGORIES,
  type BudgetOverview,
  type Category,
  type SetBudgetPlanDTO,
} from "@/src/types/api"

export interface BudgetFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  month: string
  existingBudget: BudgetOverview | null
  onSubmit: (data: SetBudgetPlanDTO) => Promise<unknown>
  isSubmitting?: boolean
}

interface DraftCategoryLimit {
  id: string
  category: Category
  limitAmount: string
}

const EXPENSE_CATEGORIES: Category[] = CANONICAL_CATEGORIES.filter(
  (c) => c !== "Receita" && c !== "Pagamento de Fatura"
)

const DEFAULT_CATEGORIES: Category[] = ["Moradia", "Alimentação", "Transporte"]

export function BudgetFormDialog({
  open,
  onOpenChange,
  month,
  existingBudget,
  onSubmit,
  isSubmitting = false,
}: BudgetFormDialogProps) {
  const [totalLimitAmount, setTotalLimitAmount] = React.useState("")
  const [rows, setRows] = React.useState<DraftCategoryLimit[]>([])
  const [validationError, setValidationError] = React.useState<string | null>(
    null
  )

  React.useEffect(() => {
    if (!open) return
    setValidationError(null)

    if (existingBudget && existingBudget.categories.length > 0) {
      setTotalLimitAmount(String(existingBudget.totalLimitAmount))
      setRows(
        existingBudget.categories.map((c, idx) => ({
          id: `${c.category}-${idx}`,
          category: c.category,
          limitAmount: String(c.limitAmount),
        }))
      )
    } else {
      setTotalLimitAmount("5000")
      setRows(
        DEFAULT_CATEGORIES.map((cat, idx) => ({
          id: `default-${idx}`,
          category: cat,
          limitAmount: idx === 0 ? "2000" : idx === 1 ? "1200" : "600",
        }))
      )
    }
  }, [open, existingBudget])

  const handleAddRow = () => {
    const used = new Set(rows.map((r) => r.category))
    const nextCat =
      EXPENSE_CATEGORIES.find((c) => !used.has(c)) ?? EXPENSE_CATEGORIES[0]
    setRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}-${prev.length}`,
        category: nextCat,
        limitAmount: "",
      },
    ])
  }

  const handleRemoveRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setValidationError(null)

    const parsedTotal = Number(totalLimitAmount.replace(",", "."))
    const parsedCategories = rows.map((r) => ({
      category: r.category,
      limitAmount: Number(r.limitAmount.replace(",", ".")),
    }))

    const parsed = setBudgetPlanSchema.safeParse({
      totalLimitAmount: Number.isFinite(parsedTotal) ? parsedTotal : 0,
      categoryBudgets: parsedCategories,
    })

    if (!parsed.success) {
      setValidationError(
        parsed.error.issues[0]?.message ??
          "Revise os valores informados no orçamento."
      )
      return
    }

    try {
      await onSubmit(parsed.data)
      onOpenChange(false)
    } catch (err) {
      setValidationError(
        err instanceof Error ? err.message : "Erro ao salvar orçamento mensal."
      )
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
            <Target className="size-4 text-primary" />
            Planejamento Orçamentário — {formatMonthYear(month)}
          </DialogTitle>
          <DialogDescription>
            Defina o teto global do mês e os limites por categoria de despesa.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="budget-total-limit"
              className="text-xs font-medium text-foreground"
            >
              Teto Global Mensal (R$)
            </label>
            <Input
              id="budget-total-limit"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="6500.00"
              value={totalLimitAmount}
              onChange={(e) => setTotalLimitAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                Tetos por Categoria
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddRow}
                disabled={rows.length >= EXPENSE_CATEGORIES.length}
                className="h-7 px-2 text-xs gap-1"
              >
                <Plus className="size-3.5" />
                Adicionar
              </Button>
            </div>

            <div className="space-y-2">
              {rows.map((row, idx) => (
                <div
                  key={row.id}
                  className="grid grid-cols-12 items-center gap-2"
                >
                  <select
                    aria-label={`Categoria do teto ${idx + 1}`}
                    value={row.category}
                    onChange={(e) => {
                      const val = e.target.value as Category
                      setRows((prev) =>
                        prev.map((item) =>
                          item.id === row.id ? { ...item, category: val } : item
                        )
                      )
                    }}
                    className="col-span-6 flex h-9 rounded-md border border-input bg-background px-2.5 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  <Input
                    aria-label={`Valor limite para ${row.category}`}
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="1500.00"
                    value={row.limitAmount}
                    onChange={(e) => {
                      const val = e.target.value
                      setRows((prev) =>
                        prev.map((item) =>
                          item.id === row.id
                            ? { ...item, limitAmount: val }
                            : item
                        )
                      )
                    }}
                    className="col-span-4"
                  />

                  <div className="col-span-2 flex justify-end">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Remover categoria ${row.category}`}
                      disabled={rows.length <= 1}
                      onClick={() => handleRemoveRow(row.id)}
                      className="size-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {validationError && (
            <p
              role="alert"
              data-testid="budget-form-error"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              {validationError}
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
                "Salvar Orçamento"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
