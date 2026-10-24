import * as React from "react";
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, CreditCard } from "lucide-react";
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" data-testid="metric-cards-grid-loading">
        <MetricCard title="Receitas Totais" value="" isLoading={true} />
        <MetricCard title="Despesas Primárias" value="" isLoading={true} />
        <MetricCard title="Quitação de Faturas" value="" isLoading={true} />
        <MetricCard title="Saldo Líquido" value="" isLoading={true} />
        <MetricCard title="Taxa de Poupança" value="" isLoading={true} />
      </div>
    );
  }

  const invoiceSettlements = metrics.invoiceSettlements ?? 0;
  // Saldo Líquido atualizado descontando despesas primárias e liquidação de faturas (sem duplicidade contábil)
  const netBalance = Math.round((metrics.totalIncome - metrics.totalExpenses - invoiceSettlements) * 100) / 100;
  const savings = calculateSavingsRate(metrics.totalIncome, metrics.totalExpenses);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" data-testid="metric-cards-grid">
      {/* 1. Receitas Totais */}
      <MetricCard
        title="Receitas Totais"
        value={formatCurrencyBRL(metrics.totalIncome)}
        variant="positive"
        icon={<ArrowUpRight className="size-4 text-emerald-500" />}
        description="Entradas consolidadas"
      />

      {/* 2. Despesas Primárias (Consumo Real) */}
      <MetricCard
        title="Despesas Primárias"
        value={formatCurrencyBRL(metrics.totalExpenses)}
        variant="negative"
        icon={<ArrowDownRight className="size-4 text-rose-500" />}
        description="Consumo real do mês"
      />

      {/* 3. Quitação de Faturas (Segregado de Cartão de Crédito) */}
      <MetricCard
        title="Quitação de Faturas"
        value={formatCurrencyBRL(invoiceSettlements)}
        variant={invoiceSettlements > 0 ? "default" : "default"}
        icon={<CreditCard className="size-4 text-slate-500" />}
        description="Liquidação de cartão"
      />

      {/* 4. Saldo Líquido Real de Caixa */}
      <MetricCard
        title="Saldo Líquido"
        value={(netBalance > 0 ? "+" : "") + formatCurrencyBRL(netBalance)}
        variant={netBalance > 0 ? "positive" : netBalance < 0 ? "negative" : "default"}
        icon={<Wallet className="size-4 text-primary" />}
        description={netBalance >= 0 ? "Superávit do mês" : "Déficit do mês"}
      />

      {/* 5. Taxa de Poupança */}
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
