import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { MetricCard } from "./metric-card";

describe("MetricCard Component", () => {
  it("renders title, formatted value and description", () => {
    render(
      <MetricCard
        title="Receitas Totais"
        value="R$ 10.000,00"
        description="Mês corrente"
      />
    );

    expect(screen.getByText("Receitas Totais")).toBeInTheDocument();
    expect(screen.getByText("R$ 10.000,00")).toBeInTheDocument();
    expect(screen.getByText("Mês corrente")).toBeInTheDocument();
  });

  it("applies positive styling variant for surplus", () => {
    render(
      <MetricCard
        title="Saldo Líquido"
        value="R$ 3.500,00"
        variant="positive"
      />
    );

    const valueEl = screen.getByTestId("metric-value");
    expect(valueEl.className).toContain("text-emerald-600");
  });

  it("applies negative styling variant for deficit", () => {
    render(
      <MetricCard
        title="Saldo Líquido"
        value="-R$ 1.200,00"
        variant="negative"
      />
    );

    const valueEl = screen.getByTestId("metric-value");
    expect(valueEl.className).toContain("text-rose-600");
  });

  it("renders deficit warning badge when provided", () => {
    render(
      <MetricCard
        title="Taxa de Poupança"
        value="0,0%"
        badge={{ text: "Sem poupança / Déficit orçamentário", variant: "destructive" }}
      />
    );

    expect(screen.getByText("Sem poupança / Déficit orçamentário")).toBeInTheDocument();
  });

  it("renders loading skeleton when isLoading is true", () => {
    render(
      <MetricCard
        title="Receitas Totais"
        value="R$ 10.000,00"
        isLoading={true}
      />
    );

    expect(screen.getByTestId("metric-card-skeleton")).toBeInTheDocument();
    expect(screen.queryByText("R$ 10.000,00")).not.toBeInTheDocument();
  });
});
