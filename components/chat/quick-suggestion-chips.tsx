"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  TrendingDown,
  PiggyBank,
  AlertCircle,
  Coins,
  ShieldCheck,
  Compass,
  Lightbulb,
  Scale,
  Target,
  type LucideIcon,
} from "lucide-react"
import {
  BudgetOverview,
  FinancialAnalysis,
  InvestmentPortfolioSummary,
} from "@/src/types/api"
import { cn } from "@/lib/utils"

export interface QuickSuggestionChipItem {
  id: string
  label: string
  prompt: string
  icon: LucideIcon
  badge?: string
}

export interface QuickSuggestionChipsProps {
  onSelect: (prompt: string) => void
  currentMonth?: string
  disabled?: boolean
  className?: string
}

export function QuickSuggestionChips({
  onSelect,
  currentMonth,
  disabled = false,
  className,
}: QuickSuggestionChipsProps) {
  const queryClient = useQueryClient()

  // Se nenhum mês for passado, usa a data atual YYYY-MM
  const monthKey = React.useMemo(() => {
    if (currentMonth) return currentMonth
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    return `${year}-${month}`
  }, [currentMonth])

  // Recupera os dados da análise financeira, orçamento e carteira cacheados
  const cachedAnalysis = queryClient.getQueryData<FinancialAnalysis>([
    "analysis",
    monthKey,
  ])
  const cachedBudget = queryClient.getQueryData<BudgetOverview | null>([
    "budgets",
    monthKey,
  ])
  const cachedPortfolio = queryClient.getQueryData<InvestmentPortfolioSummary>([
    "investments",
    "portfolio",
  ])

  const chips = React.useMemo<QuickSuggestionChipItem[]>(() => {
    const metrics = cachedAnalysis?.metrics

    if (metrics && (metrics.totalExpenses > 0 || metrics.totalIncome > 0)) {
      const result: QuickSuggestionChipItem[] = []

      // 1. Maior categoria de despesa ou categoria em alerta no orçamento
      const warningBudgetCat = cachedBudget?.categories.find(
        (c) => c.status === "EXCEEDED" || c.status === "WARNING"
      )
      const topCat = metrics.topCategories?.[0]
      if (warningBudgetCat) {
        result.push({
          id: "budget-alert-category",
          label: `Orçamento: ${warningBudgetCat.category}`,
          prompt: `Estou em ${warningBudgetCat.percentConsumed.toFixed(0)}% do meu teto em ${warningBudgetCat.category}. Como fechar o mês dentro do orçamento?`,
          icon: Target,
          badge: "Orçamento",
        })
      } else if (topCat && topCat.amount > 0) {
        result.push({
          id: "top-expense",
          label: `Gastos em ${topCat.category}`,
          prompt: `Como posso reduzir meus gastos em ${topCat.category} este mês?`,
          icon: TrendingDown,
          badge: "Orçamento",
        })
      }

      // 2. Taxa de poupança ou rebalanceamento da carteira
      if (
        cachedPortfolio &&
        cachedPortfolio.allocationDiagnosis &&
        !cachedPortfolio.allocationDiagnosis.adherentToRiskProfile
      ) {
        result.push({
          id: "portfolio-rebalance",
          label: "Rebalancear Carteira",
          prompt: `Minha carteira está desalinhada ao perfil ${cachedPortfolio.riskProfile}. Como rebalancear meus aportes entre macroclasses?`,
          icon: Coins,
          badge: "Investimentos",
        })
      } else if (metrics.savingsRate < 20) {
        result.push({
          id: "savings-goal",
          label: "Meta de Poupança",
          prompt:
            "Como alcançar uma taxa de poupança de 20% com meu orçamento atual?",
          icon: PiggyBank,
          badge: "Economia",
        })
      } else {
        result.push({
          id: "invest-surplus",
          label: "Alocar Excedente",
          prompt:
            "Qual a melhor estratégia para investir meu saldo excedente deste mês?",
          icon: Coins,
          badge: "Investimentos",
        })
      }

      // 3. Planejamento Fiscal (IRPF / Deduções)
      result.push({
        id: "fiscal-deductions",
        label: "Deduções IRPF & MEI",
        prompt:
          "Quais das minhas despesas de saúde, educação ou previdência podem ajudar a abater meu IRPF e como organizar meu dossiê fiscal?",
        icon: Scale,
        badge: "Fiscal",
      })

      // 4. Gastos atípicos ou saldo
      if (metrics.netBalance < 0) {
        result.push({
          id: "deficit-alert",
          label: "Recuperar Déficit",
          prompt:
            "O que posso fazer para equilibrar meu saldo negativo este mês?",
          icon: AlertCircle,
          badge: "Alerta",
        })
      } else {
        result.push({
          id: "atypical-check",
          label: "Gastos Atípicos",
          prompt:
            "Identifique se tive algum gasto fora do padrão ou atípico neste mês.",
          icon: Compass,
          badge: "Auditoria",
        })
      }

      return result
    }

    // Fallback de Educação Financeira (Cold Start sem transações no mês)
    return [
      {
        id: "emergency-fund",
        label: "Reserva de Emergência",
        prompt: "Como calcular e construir minha reserva de emergência?",
        icon: ShieldCheck,
        badge: "Iniciante",
      },
      {
        id: "rule-50-30-20",
        label: "Regra 50-30-20",
        prompt: "Como funciona a regra orçamentária 50-30-20 e como aplicá-la?",
        icon: Lightbulb,
        badge: "Planejamento",
      },
      {
        id: "fiscal-deductions",
        label: "Deduções IRPF & MEI",
        prompt:
          "Como organizar despesas dedutíveis no IRPF e acompanhar o teto anual do MEI?",
        icon: Scale,
        badge: "Fiscal",
      },
      {
        id: "portfolio-rebalance",
        label: "Carteira & Perfil de Risco",
        prompt:
          "Como distribuir meus investimentos entre Renda Fixa, Ações, FIIs e Exterior conforme meu perfil de risco?",
        icon: Coins,
        badge: "Investimentos",
      },
    ]
  }, [cachedAnalysis, cachedBudget, cachedPortfolio])

  return (
    <div className={cn("mx-auto w-full max-w-lg min-w-0 py-2", className)}>
      <div className="mb-4 text-center">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          Sugestões rápidas para começar
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Perguntas inteligentes formuladas para o seu momento financeiro
        </p>
      </div>

      <div
        className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
        data-testid="quick-suggestion-chips-grid"
      >
        {chips.map((chip) => {
          const Icon = chip.icon
          return (
            <button
              key={chip.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(chip.prompt)}
              data-testid={`quick-chip-${chip.id}`}
              className={cn(
                "group relative flex min-h-11 items-start gap-3 rounded-xl border border-border/80 bg-card/60 p-3 text-left transition-all hover:border-primary/40 hover:bg-card hover:shadow-xs",
                "focus:ring-2 focus:ring-primary/30 focus:outline-none",
                disabled && "pointer-events-none cursor-not-allowed opacity-50"
              )}
            >
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-2xs transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center justify-between gap-1.5">
                  <span className="truncate text-xs font-semibold text-foreground transition-colors group-hover:text-primary">
                    {chip.label}
                  </span>
                  {chip.badge && (
                    <span className="py-0.2 shrink-0 rounded-full border border-border/60 bg-secondary px-1.5 text-[10px] font-medium text-secondary-foreground">
                      {chip.badge}
                    </span>
                  )}
                </div>
                <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                  {chip.prompt}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
