"use client";

import * as React from "react";
import { getCurrentYearMonth } from "@/lib/formatters";
import { useAuth } from "@/hooks/use-auth";
import { useFinancialAnalysis } from "@/hooks/use-financial-analysis";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MetricCardsGrid } from "@/components/dashboard/metric-cards-grid";
import { CategoryDonutChart } from "@/components/dashboard/category-donut-chart";
import { AiDiagnosisCard } from "@/components/dashboard/ai-diagnosis-card";
import { AiKeyModal } from "@/components/ai-key/ai-key-modal";

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = React.useState<string>(getCurrentYearMonth());
  const [aiKeyModalOpen, setAiKeyModalOpen] = React.useState<boolean>(false);
  const { user } = useAuth();

  const {
    metrics,
    analysis,
    isLoading,
    isRefreshing,
    error,
    refreshAnalysis,
  } = useFinancialAnalysis(selectedMonth);

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Painel com Seletor de Competência e Status IA */}
      <DashboardHeader
        currentMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        isLoading={isLoading || isRefreshing}
        hasAiKey={user?.hasAiKey ?? true}
      />

      {/* Grid de Resumo Financeiro (KPIs Consolidados) */}
      <MetricCardsGrid metrics={metrics} isLoading={isLoading} />

      {/* Gráfico Interativo de Distribuição por Categorias */}
      <CategoryDonutChart
        categories={metrics?.topCategories ?? []}
        month={selectedMonth}
        isLoading={isLoading}
      />

      {/* Card de Diagnóstico IA */}
      <AiDiagnosisCard
        analysis={analysis}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        onRetry={() => void refreshAnalysis()}
        hasAiKey={user?.hasAiKey ?? true}
        onRefresh={() => void refreshAnalysis()}
        onOpenAiKeyModal={() => setAiKeyModalOpen(true)}
      />

      {/* Modal de Configuração de Chave Gemini (BYOK) */}
      <AiKeyModal
        open={aiKeyModalOpen}
        onOpenChange={setAiKeyModalOpen}
      />
    </div>
  );
}
