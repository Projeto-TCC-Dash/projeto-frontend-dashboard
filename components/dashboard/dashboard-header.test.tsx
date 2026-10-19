import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DashboardHeader } from "./dashboard-header";

describe("DashboardHeader Component", () => {
  it("renders title, description and month selector", () => {
    render(
      <DashboardHeader
        currentMonth="2026-10"
        onMonthChange={vi.fn()}
        hasAiKey={true}
      />
    );

    expect(screen.getByRole("heading", { name: /painel financeiro inteligente/i })).toBeInTheDocument();
    expect(screen.getByText("Outubro de 2026")).toBeInTheDocument();
    expect(screen.getByText("IA Ativa")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /extratos & transações/i })).toBeInTheDocument();
  });

  it("calls onMonthChange when navigating months in MonthSelector", () => {
    const handleMonthChange = vi.fn();
    render(
      <DashboardHeader
        currentMonth="2026-10"
        onMonthChange={handleMonthChange}
        hasAiKey={true}
      />
    );

    const prevButton = screen.getByRole("button", { name: /mês anterior/i });
    fireEvent.click(prevButton);
    expect(handleMonthChange).toHaveBeenCalledWith("2026-09");
  });

  it("displays pending AI key badge when hasAiKey is false", () => {
    render(
      <DashboardHeader
        currentMonth="2026-10"
        onMonthChange={vi.fn()}
        hasAiKey={false}
      />
    );

    expect(screen.getByText(/ia desativada/i)).toBeInTheDocument();
  });
});
