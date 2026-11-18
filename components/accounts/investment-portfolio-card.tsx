"use client"

import * as React from "react"
import {
  PieChart,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Loader2,
  ShieldCheck,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BarList } from "@/components/ui/tremor/bar-list"
import { formatCurrencyBRL } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import {
  ASSET_MACRO_CLASSES,
  ASSET_MACRO_CLASS_LABELS,
  type Account,
  type AssetMacroClass,
  type InvestmentPortfolioSummary,
  type UpsertInvestmentHoldingDTO,
} from "@/src/types/api"
import type { BarListItem, TremorColor } from "@/src/types/charts"

const MACRO_CLASS_COLORS: Record<
  AssetMacroClass,
  { color: string; colorName: TremorColor }
> = {
  FIXED_INCOME: { color: "#10b981", colorName: "emerald" },
  EQUITIES: { color: "#3b82f6", colorName: "blue" },
  REAL_ESTATE: { color: "#8b5cf6", colorName: "violet" },
  INTERNATIONAL: { color: "#06b6d4", colorName: "cyan" },
  CRYPTO: { color: "#f59e0b", colorName: "amber" },
  CASH_LIQUIDITY: { color: "#14b8a6", colorName: "teal" },
}

const RISK_BADGE_LABELS: Record<string, string> = {
  CONSERVATIVE: "Perfil Conservador",
  MODERATE: "Perfil Moderado",
  AGGRESSIVE: "Perfil Agressivo",
}

export interface InvestmentPortfolioCardProps {
  portfolio: InvestmentPortfolioSummary | null
  accounts: readonly Account[]
  isLoading?: boolean
  onUpsertHolding?: (dto: UpsertInvestmentHoldingDTO) => Promise<unknown>
  isSubmitting?: boolean
  className?: string
}

export function InvestmentPortfolioCard({
  portfolio,
  accounts,
  isLoading = false,
  onUpsertHolding,
  isSubmitting = false,
  className,
}: InvestmentPortfolioCardProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const defaultAccountId = React.useMemo(() => {
    const inv = accounts.find((a) => a.type === "INVESTMENT")
    return inv?.id ?? accounts[0]?.id ?? ""
  }, [accounts])

  const [selectedAccountId, setSelectedAccountId] =
    React.useState<string>(defaultAccountId)
  const [selectedMacroClass, setSelectedMacroClass] =
    React.useState<AssetMacroClass>("FIXED_INCOME")
  const [amountInput, setAmountInput] = React.useState<string>("")
  const [notesInput, setNotesInput] = React.useState<string>("")
  const [formError, setFormError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!selectedAccountId && defaultAccountId) {
      setSelectedAccountId(defaultAccountId)
    }
  }, [defaultAccountId, selectedAccountId])

  const activeHoldings = React.useMemo(() => {
    if (!portfolio?.holdings) return []
    return [...portfolio.holdings]
      .filter((h) => h.amount > 0)
      .sort((a, b) => b.amount - a.amount)
  }, [portfolio])

  const barItems = React.useMemo<BarListItem[]>(() => {
    return activeHoldings.map((h) => {
      const tokens = MACRO_CLASS_COLORS[h.macroClass] ?? {
        color: "#64748b",
        colorName: "slate" as TremorColor,
      }
      return {
        key: h.macroClass,
        name: ASSET_MACRO_CLASS_LABELS[h.macroClass] ?? h.macroClass,
        value: h.amount,
        percentage: h.percentage,
        color: tokens.color,
        colorName: tokens.colorName,
      }
    })
  }, [activeHoldings])

  const handleOpenModal = (macroClass?: AssetMacroClass) => {
    setFormError(null)
    if (macroClass) {
      setSelectedMacroClass(macroClass)
      const existing = portfolio?.holdings.find(
        (h) => h.macroClass === macroClass
      )
      setAmountInput(existing && existing.amount > 0 ? String(existing.amount) : "")
    } else {
      setAmountInput("")
    }
    setNotesInput("")
    setSelectedAccountId(defaultAccountId)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onUpsertHolding) return

    setFormError(null)
    const numericAmount = Number(amountInput.replace(",", "."))

    if (!selectedAccountId) {
      setFormError("Selecione uma conta para vincular a posição.")
      return
    }
    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
      setFormError("Informe um valor monetário válido (zero ou positivo).")
      return
    }

    try {
      await onUpsertHolding({
        accountId: selectedAccountId,
        macroClass: selectedMacroClass,
        amount: numericAmount,
        notes: notesInput.trim() || undefined,
      })
      setDialogOpen(false)
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar a posição de investimento."
      )
    }
  }

  if (isLoading) {
    return (
      <Card
        data-testid="investment-portfolio-loading"
        className={cn("min-w-0 animate-pulse", className)}
      >
        <CardHeader className="pb-3">
          <div className="h-5 w-64 rounded bg-muted" />
          <div className="mt-1 h-3.5 w-48 rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-20 rounded-xl bg-muted/60" />
          <div className="space-y-2">
            <div className="h-9 rounded-lg bg-muted/60" />
            <div className="h-9 rounded-lg bg-muted/60" />
            <div className="h-9 rounded-lg bg-muted/60" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const diagnosis = portfolio?.allocationDiagnosis
  const isAdherent = diagnosis?.adherentToRiskProfile ?? true
  const riskLabel = portfolio?.riskProfile
    ? (RISK_BADGE_LABELS[portfolio.riskProfile] ?? portfolio.riskProfile)
    : null

  return (
    <>
      <Card
        data-testid="investment-portfolio-card"
        className={cn("min-w-0", className)}
      >
        <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base font-semibold text-foreground">
                Carteira & Diagnóstico de Investimentos
              </CardTitle>
              {riskLabel ? (
                <Badge variant="secondary" className="gap-1 text-xs font-medium">
                  <ShieldCheck className="size-3" />
                  {riskLabel}
                </Badge>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              Distribuição por macroclasses e aderência estratégica ao perfil de
              risco
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:shrink-0">
            <div className="text-left sm:text-right tabular-nums">
              <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Total Investido
              </p>
              <p
                data-testid="investment-total-value"
                className="text-lg font-bold text-foreground"
              >
                {formatCurrencyBRL(portfolio?.totalInvested ?? 0)}
              </p>
            </div>

            {onUpsertHolding && accounts.length > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-testid="update-holding-button"
                onClick={() => handleOpenModal()}
                className="min-h-9 gap-1.5"
              >
                <Plus className="size-3.5" />
                <span>Atualizar Posição</span>
              </Button>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Banner de Diagnóstico / Insight de Alocação */}
          {diagnosis && diagnosis.recommendations.length > 0 ? (
            <div
              data-testid="investment-diagnosis-banner"
              className={cn(
                "rounded-xl border p-3.5 text-xs",
                isAdherent
                  ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-300"
              )}
            >
              <div className="mb-1.5 flex items-center gap-2 font-semibold">
                {isAdherent ? (
                  <>
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>Insight de Alocação: Carteira Aderente ao Perfil</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>Insight de Alocação: Rebalanceamento Sugerido</span>
                  </>
                )}
              </div>
              <ul className="space-y-1 pl-6 list-disc">
                {diagnosis.recommendations.map((rec, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Distribuição por Macroclasses */}
          {barItems.length === 0 ? (
            <div
              data-testid="investment-holdings-empty"
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8 text-center text-muted-foreground"
            >
              <div className="mb-2.5 rounded-full bg-muted/60 p-2.5">
                <PieChart className="size-6 text-muted-foreground/70" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Nenhuma posição de investimento cadastrada
              </p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Registre seus saldos por macroclasse (Renda Fixa, Ações, FIIs,
                Internacional ou Liquidez) para liberar os insights de alocação.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Composição por Macroclasse (clique para editar)
              </p>
              <BarList
                data={barItems}
                onItemSelect={(item) =>
                  handleOpenModal(item.key as AssetMacroClass)
                }
                ariaLabel="Composição da carteira de investimentos por macroclasse"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para Atualizar/Cadastrar Posição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Atualizar Posição de Investimento</DialogTitle>
            <DialogDescription>
              Informe o saldo atual consolidado na macroclasse para recalcular
              o diagnóstico de alocação.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="holding-account"
                className="text-xs font-medium text-foreground"
              >
                Conta Vinculada
              </label>
              <select
                id="holding-account"
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                    {acc.institution ? ` (${acc.institution})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="holding-macro-class"
                className="text-xs font-medium text-foreground"
              >
                Macroclasse de Ativo
              </label>
              <select
                id="holding-macro-class"
                value={selectedMacroClass}
                onChange={(e) =>
                  setSelectedMacroClass(e.target.value as AssetMacroClass)
                }
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {ASSET_MACRO_CLASSES.map((mc) => (
                  <option key={mc} value={mc}>
                    {ASSET_MACRO_CLASS_LABELS[mc]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="holding-amount"
                className="text-xs font-medium text-foreground"
              >
                Montante Atual (R$)
              </label>
              <Input
                id="holding-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 15000.00"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="holding-notes"
                className="text-xs font-medium text-foreground"
              >
                Observações (opcional)
              </label>
              <Input
                id="holding-notes"
                type="text"
                maxLength={200}
                placeholder="Ex: Tesouro Selic + CDB Liquidez Diária"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
              />
            </div>

            {formError ? (
              <p className="text-xs font-medium text-destructive">{formError}</p>
            ) : null}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-1.5">
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Posição"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
