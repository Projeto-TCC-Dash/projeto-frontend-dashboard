import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { CategoryDonutChart } from "./category-donut-chart";
import { CategoryMetric } from "@/src/types/api";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("CategoryDonutChart Component", () => {
  const sampleCategories: CategoryMetric[] = [
    { category: "Moradia", amount: 2500, percentage: 50 },
    { category: "Alimentação", amount: 1500, percentage: 30 },
    { category: "Transporte", amount: 1000, percentage: 20 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders SVG slices for all categories with amount > 0", () => {
    render(<CategoryDonutChart categories={sampleCategories} month="2026-10" />);

    expect(screen.getByTestId("category-donut-chart")).toBeInTheDocument();
    expect(screen.getByTestId("donut-slice-Moradia")).toBeInTheDocument();
    expect(screen.getByTestId("donut-slice-Alimentação")).toBeInTheDocument();
    expect(screen.getByTestId("donut-slice-Transporte")).toBeInTheDocument();
  });

  it("renders empty state illustration when there are no active categories", () => {
    render(<CategoryDonutChart categories={[]} month="2026-10" />);

    expect(screen.getByTestId("category-donut-chart-empty")).toBeInTheDocument();
    expect(
      screen.getByText("Nenhuma despesa registrada neste mês")
    ).toBeInTheDocument();
  });

  it("updates central information on slice hover", () => {
    render(<CategoryDonutChart categories={sampleCategories} month="2026-10" />);

    const slice = screen.getByTestId("donut-slice-Alimentação");
    fireEvent.mouseEnter(slice);

    const centerInfo = screen.getByTestId("donut-center-info");
    expect(centerInfo).toHaveTextContent("Alimentação");
    expect(centerInfo).toHaveTextContent("R$ 1.500,00");
    expect(centerInfo).toHaveTextContent("30,0%");

    fireEvent.mouseLeave(slice);
    expect(centerInfo).toHaveTextContent("Total Despesas");
  });

  it("navigates to /transactions with filters when clicking on slice (drill-down)", () => {
    render(<CategoryDonutChart categories={sampleCategories} month="2026-10" />);

    const slice = screen.getByTestId("donut-slice-Moradia");
    fireEvent.click(slice);

    expect(pushMock).toHaveBeenCalledWith(
      "/transactions?month=2026-10&category=Moradia"
    );
  });

  it("navigates to /transactions when clicking on a legend item", () => {
    render(<CategoryDonutChart categories={sampleCategories} month="2026-10" />);

    const legendBtn = screen.getByRole("button", {
      name: /transporte/i,
    });
    fireEvent.click(legendBtn);

    expect(pushMock).toHaveBeenCalledWith(
      "/transactions?month=2026-10&category=Transporte"
    );
  });
});
