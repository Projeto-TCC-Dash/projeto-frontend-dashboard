import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { MetricCardsGrid } from "./metric-cards-grid";
import { FinancialMetrics } from "@/src/types/api";

describe("MetricCardsGrid Component", () => {
  const sampleMetrics: FinancialMetrics = {
    totalIncome: 12000,
    totalExpenses: 6000,
    invoiceSettlements: 2000,
    netBalance: 6000, // backend raw
    savingsRate: 50.0,
    topCategories: [],
  };

  it("renders 5 KPI cards including invoice settlements and recalculated net balance", () => {
    render(<MetricCardsGrid metrics={sampleMetrics} />);

    expect(screen.getByText("Receitas Totais")).toBeInTheDocument();
    expect(screen.getByText("Despesas Primárias")).toBeInTheDocument();
    expect(screen.getByText("Quitação de Faturas")).toBeInTheDocument();
    expect(screen.getByText("Saldo Líquido")).toBeInTheDocument();
    expect(screen.getByText("Taxa de Poupança")).toBeInTheDocument();

    expect(screen.getByText("R$ 12.000,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 6.000,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 2.000,00")).toBeInTheDocument();
    // 12000 - 6000 - 2000 = +4000
    expect(screen.getByText("+R$ 4.000,00")).toBeInTheDocument();
    expect(screen.getByText("50,0%")).toBeInTheDocument();
  });

  it("handles metrics without invoiceSettlements gracefully defaulting to 0", () => {
    const metricsWithoutInvoices: FinancialMetrics = {
      totalIncome: 10000,
      totalExpenses: 4000,
      netBalance: 6000,
      savingsRate: 60,
      topCategories: [],
    };

    render(<MetricCardsGrid metrics={metricsWithoutInvoices} />);

    expect(screen.getByText("Quitação de Faturas")).toBeInTheDocument();
    expect(screen.getByText("R$ 0,00")).toBeInTheDocument();
    // 10000 - 4000 - 0 = +6000
    expect(screen.getByText("+R$ 6.000,00")).toBeInTheDocument();
  });

  it("renders deficit status and 0% savings rate when expenses > income", () => {
    const deficitMetrics: FinancialMetrics = {
      totalIncome: 4000,
      totalExpenses: 6500,
      invoiceSettlements: 500,
      netBalance: -2500,
      savingsRate: 0,
      topCategories: [],
    };

    render(<MetricCardsGrid metrics={deficitMetrics} />);

    // 4000 - 6500 - 500 = -3000
    expect(screen.getByText("-R$ 3.000,00")).toBeInTheDocument();
    expect(screen.getByText("0,0%")).toBeInTheDocument();
    expect(screen.getByText("Sem poupança / Déficit orçamentário")).toBeInTheDocument();
  });

  it("renders 5 loading skeleton cards when isLoading is true", () => {
    render(<MetricCardsGrid metrics={null} isLoading={true} />);

    expect(screen.getByTestId("metric-cards-grid-loading")).toBeInTheDocument();
    const skeletons = screen.getAllByTestId("metric-card-skeleton");
    expect(skeletons).toHaveLength(5);
  });
});
