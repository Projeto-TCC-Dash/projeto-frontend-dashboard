import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MonthSelector } from "./month-selector";

describe("MonthSelector Component", () => {
  it("renders the formatted month name for the given YYYY-MM", () => {
    render(
      <MonthSelector
        currentMonth="2026-10"
        onMonthChange={vi.fn()}
      />
    );

    expect(screen.getByText("Outubro de 2026")).toBeInTheDocument();
  });

  it("calls onMonthChange with previous month when clicking previous button", () => {
    const handleMonthChange = vi.fn();
    render(
      <MonthSelector
        currentMonth="2026-10"
        onMonthChange={handleMonthChange}
      />
    );

    const prevButton = screen.getByRole("button", { name: /mês anterior/i });
    fireEvent.click(prevButton);

    expect(handleMonthChange).toHaveBeenCalledWith("2026-09");
  });

  it("calls onMonthChange with next month when clicking next button", () => {
    const handleMonthChange = vi.fn();
    render(
      <MonthSelector
        currentMonth="2026-10"
        onMonthChange={handleMonthChange}
      />
    );

    const nextButton = screen.getByRole("button", { name: /próximo mês/i });
    fireEvent.click(nextButton);

    expect(handleMonthChange).toHaveBeenCalledWith("2026-11");
  });

  it("handles year transition backward and forward correctly", () => {
    const handleMonthChange = vi.fn();
    const { rerender } = render(
      <MonthSelector
        currentMonth="2026-01"
        onMonthChange={handleMonthChange}
      />
    );

    const prevButton = screen.getByRole("button", { name: /mês anterior/i });
    fireEvent.click(prevButton);
    expect(handleMonthChange).toHaveBeenCalledWith("2025-12");

    rerender(
      <MonthSelector
        currentMonth="2026-12"
        onMonthChange={handleMonthChange}
      />
    );

    const nextButton = screen.getByRole("button", { name: /próximo mês/i });
    fireEvent.click(nextButton);
    expect(handleMonthChange).toHaveBeenCalledWith("2027-01");
  });

  it("disables navigation buttons when disabled prop is true", () => {
    render(
      <MonthSelector
        currentMonth="2026-10"
        onMonthChange={vi.fn()}
        disabled={true}
      />
    );

    const prevButton = screen.getByRole("button", { name: /mês anterior/i });
    const nextButton = screen.getByRole("button", { name: /próximo mês/i });

    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });
});
