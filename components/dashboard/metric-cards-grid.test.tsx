import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { MetricCardsGrid } from "./metric-cards-grid";
import { FinancialMetrics } from "@/src/types/api";

describe("MetricCardsGrid Component", () => {
  const sampleMetrics: FinancialMetrics = {
    totalIncome: 12000,
    totalExpenses: 8000,
    netBalance: 4000,
    savingsRate: 33.3,
    topCategories: [],
  };

  it("renders 4 KPI cards with formatted values", () => {
    render(<MetricCardsGrid metrics={sampleMetrics} />);

    expect(screen.getByText("Receitas Totais")).toBeInTheDocument();
    expect(screen.getByText("Despesas Totais")).toBeInTheDocument();
    expect(screen.getByText("Saldo Líquido")).toBeInTheDocument();
    expect(screen.getByText("Taxa de Poupança")).toBeInTheDocument();

    expect(screen.getByText("R$ 12.000,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 8.000,00")).toBeInTheDocument();
    expect(screen.getByText("+R$ 4.000,00")).toBeInTheDocument();
    expect(screen.getByText("33,3%")).toBeInTheDocument();
  });

  it("renders deficit status and 0% savings rate when expenses > income", () => {
    const deficitMetrics: FinancialMetrics = {
      totalIncome: 4000,
      totalExpenses: 6500,
      netBalance: -2500,
      savingsRate: 0,
      topCategories: [],
    };

    render(<MetricCardsGrid metrics={deficitMetrics} />);

    expect(screen.getByText("-R$ 2.500,00")).toBeInTheDocument();
    expect(screen.getByText("0,0%")).toBeInTheDocument();
    expect(screen.getByText("Sem poupança / Déficit orçamentário")).toBeInTheDocument();
  });

  it("renders loading skeleton cards when isLoading is true", () => {
    render(<MetricCardsGrid metrics={null} isLoading={true} />);

    expect(screen.getByTestId("metric-cards-grid-loading")).toBeInTheDocument();
    const skeletons = screen.getAllByTestId("metric-card-skeleton");
    expect(skeletons).toHaveLength(4);
  });
});
