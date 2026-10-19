import * as React from "react";
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp } from "lucide-react";
import { FinancialMetrics } from "@/src/types/api";
import { MetricCard } from "./metric-card";
import { formatCurrencyBRL, calculateSavingsRate } from "@/lib/formatters";

export interface MetricCardsGridProps {
  metrics: FinancialMetrics | null;
  isLoading?: boolean;
}

export function MetricCardsGrid({ metrics, isLoading = false }: MetricCardsGridProps) {
  if (isLoading || !metrics) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="metric-cards-grid-loading">
        <MetricCard title="Receitas Totais" value="" isLoading={true} />
        <MetricCard title="Despesas Totais" value="" isLoading={true} />
        <MetricCard title="Saldo Líquido" value="" isLoading={true} />
        <MetricCard title="Taxa de Poupança" value="" isLoading={true} />
      </div>
    );
  }

  const netBalance = metrics.netBalance;
  const savings = calculateSavingsRate(metrics.totalIncome, metrics.totalExpenses);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="metric-cards-grid">
      {/* 1. Receitas Totais */}
      <MetricCard
        title="Receitas Totais"
        value={formatCurrencyBRL(metrics.totalIncome)}
        variant="positive"
        icon={<ArrowUpRight className="size-4 text-emerald-500" />}
        description="Entradas consolidadas"
      />

      {/* 2. Despesas Totais */}
      <MetricCard
        title="Despesas Totais"
        value={formatCurrencyBRL(metrics.totalExpenses)}
        variant="negative"
        icon={<ArrowDownRight className="size-4 text-rose-500" />}
        description="Saídas consolidadas"
      />

      {/* 3. Saldo Líquido */}
      <MetricCard
        title="Saldo Líquido"
        value={(netBalance > 0 ? "+" : "") + formatCurrencyBRL(netBalance)}
        variant={netBalance > 0 ? "positive" : netBalance < 0 ? "negative" : "default"}
        icon={<Wallet className="size-4 text-primary" />}
        description={netBalance >= 0 ? "Superávit do mês" : "Déficit do mês"}
      />

      {/* 4. Taxa de Poupança */}
      <MetricCard
        title="Taxa de Poupança"
        value={savings.formattedRate}
        variant={savings.isDeficit ? "negative" : savings.rate >= 20 ? "positive" : "warning"}
        icon={<TrendingUp className="size-4 text-amber-500" />}
        badge={
          savings.isDeficit
            ? { text: savings.statusLabel, variant: "destructive" }
            : undefined
        }
        description={!savings.isDeficit ? savings.statusLabel : undefined}
      />
    </div>
  );
}
