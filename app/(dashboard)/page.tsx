"use client"

import * as React from "react"
import { motion } from "motion/react"
import { getCurrentYearMonth } from "@/lib/formatters"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"
import { useAuth } from "@/hooks/use-auth"
import { useUserProfile } from "@/hooks/use-user-profile"
import { useFinancialAnalysis } from "@/hooks/use-financial-analysis"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ProfileOnboardingBanner } from "@/components/profile/profile-onboarding-banner"
import { MetricCardsGrid } from "@/components/dashboard/metric-cards-grid"
import { CategoryDonutChart } from "@/components/dashboard/category-donut-chart"
import { PeriodCashflowCard } from "@/components/dashboard/period-cashflow-card"
import { AiDiagnosisCard } from "@/components/dashboard/ai-diagnosis-card"
import { MonthlyBudgetCard } from "@/components/dashboard/monthly-budget-card"
import { MultiMonthEvolutionChart } from "@/components/dashboard/multi-month-evolution-chart"
import { AiKeyModal } from "@/components/ai-key/ai-key-modal"
import { useBudget, useUpsertBudget } from "@/hooks/use-budgets"
import { useMultiMonthAnalysis } from "@/hooks/use-multi-month-analysis"
import { useTransactions } from "@/hooks/use-transactions"
import type { MultiMonthRange } from "@/src/types/api"
import {
  buildMultiMonthEvolutionSeries,
  calculateEmergencyFundTarget,
  calculateFinancialMetricsFromTransactions,
  subtractMonths,
} from "@/lib/dashboard-charts"
import type { MultiMonthHorizon } from "@/src/types/charts"

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = React.useState<string>(
    getCurrentYearMonth()
  )
  const [horizon, setHorizon] = React.useState<MultiMonthHorizon>("6M")
  const [aiKeyModalOpen, setAiKeyModalOpen] = React.useState<boolean>(false)
  const { user } = useAuth()
  const { data: userProfile } = useUserProfile()

  const hasFinancialProfile = Boolean(
    userProfile?.financialProfile?.incomeType ||
    (userProfile?.financialProfile?.goals &&
      userProfile.financialProfile.goals.length > 0)
  )

  const { metrics, analysis, isLoading, isRefreshing, error, refreshAnalysis } =
    useFinancialAnalysis(selectedMonth, {
      enabled: Boolean(selectedMonth) && (user?.hasAiKey ?? true),
    })
  const {
    budget,
    isLoading: isBudgetLoading,
    isError: isBudgetError,
    refetch: refetchBudget,
  } = useBudget(selectedMonth)
  const { upsertBudget, isSaving: isBudgetSaving } = useUpsertBudget()

  const multiMonthRange: MultiMonthRange =
    horizon === "3M" ? "3" : horizon === "6M" ? "6" : "12"
  const { analysis: multiMonthServerAnalysis } =
    useMultiMonthAnalysis(multiMonthRange)
  const {
    transactions: monthTransactions,
    isLoading: isMonthTransactionsLoading,
  } = useTransactions({ month: selectedMonth })
  const { transactions: allTransactions, isLoading: isAllTransactionsLoading } =
    useTransactions({})
  const prefersReducedMotion = usePrefersReducedMotion()

  const fallbackMetrics = React.useMemo(
    () => calculateFinancialMetricsFromTransactions(monthTransactions),
    [monthTransactions]
  )

  const effectiveMetrics =
    metrics ?? (!isMonthTransactionsLoading ? fallbackMetrics : null)
  const isMetricsLoading =
    !effectiveMetrics && (isLoading || isMonthTransactionsLoading)

  const emergencyFundTarget = React.useMemo(
    () =>
      calculateEmergencyFundTarget(
        userProfile?.financialProfile?.incomeType,
        userProfile?.financialProfile?.declaredMonthlyIncome,
        effectiveMetrics?.totalExpenses
      ),
    [
      userProfile?.financialProfile?.incomeType,
      userProfile?.financialProfile?.declaredMonthlyIncome,
      effectiveMetrics?.totalExpenses,
    ]
  )

  const multiMonthSeries = React.useMemo(
    () =>
      buildMultiMonthEvolutionSeries(
        allTransactions,
        horizon,
        selectedMonth
      ),
    [allTransactions, horizon, selectedMonth]
  )

  const previousMonth = React.useMemo(
    () => subtractMonths(selectedMonth, 1),
    [selectedMonth]
  )

  const previousMetrics = React.useMemo(() => {
    const prevPoint = multiMonthSeries.find((p) => p.month === previousMonth)
    if (!prevPoint) return null
    return {
      totalIncome: prevPoint.receitas,
      totalExpenses: prevPoint.despesas,
      invoiceSettlements: prevPoint.faturas,
      netBalance: prevPoint.netBalance,
      savingsRate: 0,
      topCategories: [],
    }
  }, [multiMonthSeries, previousMonth])

  const historicalTrends = React.useMemo(() => {
    if (multiMonthSeries.length < 2) return undefined
    return {
      incomeSeries: multiMonthSeries.map((p) => p.receitas),
      expensesSeries: multiMonthSeries.map((p) => p.despesas),
      invoiceSeries: multiMonthSeries.map((p) => p.faturas),
      netBalanceSeries: multiMonthSeries.map((p) => p.netBalance),
    }
  }, [multiMonthSeries])

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Painel com Seletor de Competência e Status IA */}
      <DashboardHeader
        currentMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        isLoading={isMetricsLoading || isRefreshing}
        hasAiKey={user?.hasAiKey ?? true}
      />

      {/* Banner de Onboarding de Perfil Financeiro Voluntário */}
      <ProfileOnboardingBanner hasProfile={hasFinancialProfile} />

      {/* Grid de Resumo Financeiro (KPIs Consolidados) */}
      <MetricCardsGrid
        metrics={effectiveMetrics}
        previousMetrics={previousMetrics}
        historicalTrends={historicalTrends}
        isLoading={isMetricsLoading}
      />

      <div
        data-testid="dashboard-bento-grid"
        className="grid grid-cols-1 gap-6 xl:grid-cols-12"
      >
        <motion.div
          data-testid="bento-analytics-slot"
          className="flex min-w-0 flex-col gap-6 xl:col-span-7"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.22,
            delay: 0.08,
          }}
        >
          {/* Cards analíticos empilhados (Distribuição por Categorias + Fluxo do Período) */}
          <CategoryDonutChart
            categories={effectiveMetrics?.topCategories ?? []}
            month={selectedMonth}
            isLoading={isMetricsLoading}
          />
          <PeriodCashflowCard
            metrics={effectiveMetrics}
            month={selectedMonth}
            isLoading={isMonthTransactionsLoading}
          />
        </motion.div>

        <motion.div
          data-testid="bento-diagnosis-slot"
          className="min-w-0 xl:relative xl:col-span-5 xl:self-stretch"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.22,
            delay: 0.14,
          }}
        >
          {/* Card de Diagnóstico IA com altura igualada à coluna esquerda no desktop */}
          <AiDiagnosisCard
            analysis={analysis}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            error={error}
            onRetry={() => void refreshAnalysis()}
            hasAiKey={user?.hasAiKey ?? true}
            onRefresh={() => void refreshAnalysis()}
            onOpenAiKeyModal={() => setAiKeyModalOpen(true)}
            financialProfile={userProfile?.financialProfile}
            monthlyExpenses={effectiveMetrics?.totalExpenses}
            matchedDesktopHeight
          />
        </motion.div>
      </div>

      {/* Orçamentos do Mês (Tetos Globais e por Categoria) */}
      <motion.div
        data-testid="monthly-budget-slot"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.22,
          delay: 0.16,
        }}
      >
        <MonthlyBudgetCard
          month={selectedMonth}
          budget={budget}
          isLoading={isBudgetLoading}
          isError={isBudgetError}
          onRetry={() => void refetchBudget()}
          onSaveBudget={(data) =>
            upsertBudget({ month: selectedMonth, data })
          }
          isSaving={isBudgetSaving}
        />
      </motion.div>

      {/* Gráfico Histórico Consolidado Multi-Mês (Trajetória e Subida Acumulada) */}
      <motion.div
        data-testid="multi-month-evolution-slot"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.22,
          delay: 0.18,
        }}
      >
        <MultiMonthEvolutionChart
          data={multiMonthSeries}
          horizon={horizon}
          onHorizonChange={setHorizon}
          serverAnalysis={multiMonthServerAnalysis}
          emergencyFundTarget={emergencyFundTarget}
          isLoading={isAllTransactionsLoading}
        />
      </motion.div>

      {/* Modal de Configuração de Chave Gemini (BYOK) */}
      <AiKeyModal open={aiKeyModalOpen} onOpenChange={setAiKeyModalOpen} />
    </div>
  )
}
