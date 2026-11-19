"use client"

import * as React from "react"
import { motion } from "motion/react"
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  CreditCard,
} from "lucide-react"
import { FinancialMetrics } from "@/src/types/api"
import { MetricCard } from "./metric-card"
import { formatCurrencyBRL, calculateSavingsRate } from "@/lib/formatters"
import { calculateMoMTrend } from "@/lib/dashboard-charts"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"

export interface MetricCardsGridProps {
  metrics: FinancialMetrics | null
  previousMetrics?: FinancialMetrics | null
  historicalTrends?: {
    incomeSeries?: number[]
    expensesSeries?: number[]
    invoiceSeries?: number[]
    netBalanceSeries?: number[]
  }
  isLoading?: boolean
}

export function MetricCardsGrid({
  metrics,
  previousMetrics,
  historicalTrends,
  isLoading = false,
}: MetricCardsGridProps) {
  const prefersReducedMotion = usePrefersReducedMotion()

  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        data-testid="metric-cards-grid-loading"
      >
        <MetricCard title="Receitas Totais" value="" isLoading={true} />
        <MetricCard title="Despesas Primárias" value="" isLoading={true} />
        <MetricCard title="Quitação de Faturas" value="" isLoading={true} />
        <MetricCard title="Saldo Líquido" value="" isLoading={true} />
        <MetricCard title="Taxa de Poupança" value="" isLoading={true} />
      </div>
    )
  }

  const safeMetrics: FinancialMetrics = metrics ?? {
    totalIncome: 0,
    totalExpenses: 0,
    invoiceSettlements: 0,
    netBalance: 0,
    savingsRate: 0,
    topCategories: [],
  }

  const invoiceSettlements = safeMetrics.invoiceSettlements ?? 0
  // Saldo Líquido atualizado descontando despesas primárias e liquidação de faturas (sem duplicidade contábil)
  const netBalance =
    Math.round(
      (safeMetrics.totalIncome -
        safeMetrics.totalExpenses -
        invoiceSettlements) *
        100
    ) / 100
  const savings = calculateSavingsRate(
    safeMetrics.totalIncome,
    safeMetrics.totalExpenses
  )

  const prevInvoiceSettlements = previousMetrics?.invoiceSettlements ?? 0
  const prevNetBalance = previousMetrics
    ? Math.round(
        (previousMetrics.totalIncome -
          previousMetrics.totalExpenses -
          prevInvoiceSettlements) *
          100
      ) / 100
    : undefined

  const incomeTrend = calculateMoMTrend(
    safeMetrics.totalIncome,
    previousMetrics?.totalIncome,
    false
  )

  const expensesTrend = calculateMoMTrend(
    safeMetrics.totalExpenses,
    previousMetrics?.totalExpenses,
    true
  )

  const invoiceTrend = calculateMoMTrend(
    invoiceSettlements,
    previousMetrics?.invoiceSettlements,
    true
  )

  const netTrend = calculateMoMTrend(
    netBalance,
    prevNetBalance,
    false
  )

  const cardMotion = (index: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.22, delay: index * 0.04 },
        }

  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      data-testid="metric-cards-grid"
    >
      {/* 1. Receitas Totais */}
      <motion.div className="min-w-0" {...cardMotion(0)}>
        <MetricCard
          className="h-full"
          title="Receitas Totais"
          value={formatCurrencyBRL(safeMetrics.totalIncome)}
          numericValue={safeMetrics.totalIncome}
          numberFormat={{ style: "currency", currency: "BRL" }}
          variant="positive"
          icon={<ArrowUpRight className="size-4 text-emerald-500" />}
          description="Entradas consolidadas"
          trend={incomeTrend}
          sparklineData={historicalTrends?.incomeSeries}
        />
      </motion.div>

      {/* 2. Despesas Primárias (Consumo Real) */}
      <motion.div className="min-w-0" {...cardMotion(1)}>
        <MetricCard
          className="h-full"
          title="Despesas Primárias"
          value={formatCurrencyBRL(safeMetrics.totalExpenses)}
          numericValue={safeMetrics.totalExpenses}
          numberFormat={{ style: "currency", currency: "BRL" }}
          variant="negative"
          icon={<ArrowDownRight className="size-4 text-rose-500" />}
          description="Consumo real do mês"
          trend={expensesTrend}
          sparklineData={historicalTrends?.expensesSeries}
        />
      </motion.div>

      {/* 3. Quitação de Faturas (Segregado de Cartão de Crédito) */}
      <motion.div className="min-w-0" {...cardMotion(2)}>
        <MetricCard
          className="h-full"
          title="Quitação de Faturas"
          value={formatCurrencyBRL(invoiceSettlements)}
          numericValue={invoiceSettlements}
          numberFormat={{ style: "currency", currency: "BRL" }}
          variant="default"
          icon={<CreditCard className="size-4 text-slate-500" />}
          description="Liquidação de cartão"
          trend={invoiceTrend}
          sparklineData={historicalTrends?.invoiceSeries}
        />
      </motion.div>

      {/* 4. Saldo Líquido Real de Caixa */}
      <motion.div className="min-w-0" {...cardMotion(3)}>
        <MetricCard
          className="h-full"
          title="Saldo Líquido"
          value={(netBalance > 0 ? "+" : "") + formatCurrencyBRL(netBalance)}
          numericValue={netBalance}
          numberFormat={{ style: "currency", currency: "BRL" }}
          numberPrefix={netBalance > 0 ? "+" : undefined}
          variant={
            netBalance > 0
              ? "positive"
              : netBalance < 0
                ? "negative"
                : "default"
          }
          icon={<Wallet className="size-4 text-primary" />}
          description={netBalance >= 0 ? "Superávit do mês" : "Déficit do mês"}
          trend={netTrend}
          sparklineData={historicalTrends?.netBalanceSeries}
        />
      </motion.div>

      {/* 5. Taxa de Poupança */}
      <motion.div className="min-w-0" {...cardMotion(4)}>
        <MetricCard
          className="h-full"
          title="Taxa de Poupança"
          value={savings.formattedRate}
          numericValue={savings.rate}
          numberFormat={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
          numberSuffix="%"
          variant={
            savings.isDeficit
              ? "negative"
              : savings.rate >= 20
                ? "positive"
                : "warning"
          }
          icon={<TrendingUp className="size-4 text-amber-500" />}
          badge={
            savings.isDeficit
              ? { text: savings.statusLabel, variant: "destructive" }
              : undefined
          }
          description={!savings.isDeficit ? savings.statusLabel : undefined}
          progressBar={{
            value: savings.rate,
            max: 100,
            color: savings.isDeficit
              ? "rose"
              : savings.rate >= 20
                ? "emerald"
                : "amber",
            "aria-label": `Progresso da taxa de poupança: ${savings.formattedRate}`,
          }}
        />
      </motion.div>
    </div>
  )
}
