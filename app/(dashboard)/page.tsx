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
import { AiKeyModal } from "@/components/ai-key/ai-key-modal"

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = React.useState<string>(
    getCurrentYearMonth()
  )
  const [aiKeyModalOpen, setAiKeyModalOpen] = React.useState<boolean>(false)
  const { user } = useAuth()
  const { data: userProfile } = useUserProfile()

  const hasFinancialProfile = Boolean(
    userProfile?.financialProfile?.incomeType ||
    (userProfile?.financialProfile?.goals &&
      userProfile.financialProfile.goals.length > 0)
  )

  const { metrics, analysis, isLoading, isRefreshing, error, refreshAnalysis } =
    useFinancialAnalysis(selectedMonth)
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Painel com Seletor de Competência e Status IA */}
      <DashboardHeader
        currentMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        isLoading={isLoading || isRefreshing}
        hasAiKey={user?.hasAiKey ?? true}
      />

      {/* Banner de Onboarding de Perfil Financeiro Voluntário */}
      <ProfileOnboardingBanner hasProfile={hasFinancialProfile} />

      {/* Grid de Resumo Financeiro (KPIs Consolidados) */}
      <MetricCardsGrid metrics={metrics} isLoading={isLoading} />

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
            categories={metrics?.topCategories ?? []}
            month={selectedMonth}
            isLoading={isLoading}
          />
          <PeriodCashflowCard
            metrics={metrics}
            month={selectedMonth}
            isLoading={isLoading}
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
            monthlyExpenses={metrics?.totalExpenses}
            matchedDesktopHeight
          />
        </motion.div>
      </div>

      {/* Modal de Configuração de Chave Gemini (BYOK) */}
      <AiKeyModal open={aiKeyModalOpen} onOpenChange={setAiKeyModalOpen} />
    </div>
  )
}
