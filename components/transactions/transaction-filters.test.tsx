import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { TransactionFilters } from "./transaction-filters";

describe("TransactionFilters component", () => {
  it("renders month selector with current month and category/source options", () => {
    const onFilterChange = vi.fn();
    render(
      <TransactionFilters
        month="2026-10"
        category={undefined}
        source={undefined}
        onFilterChange={onFilterChange}
      />
    );

    expect(screen.getByDisplayValue("2026-10")).toBeDefined();
    expect(screen.getByLabelText(/Mês de Competência/i)).toBeDefined();
    expect(screen.getByLabelText(/Categoria/i)).toBeDefined();
    expect(screen.getByLabelText(/Origem/i)).toBeDefined();
  });

  it("shifts month backward and forward via buttons", () => {
    const onFilterChange = vi.fn();
    render(
      <TransactionFilters
        month="2026-10"
        onFilterChange={onFilterChange}
      />
    );

    const prevBtn = screen.getByRole("button", { name: /Mês anterior/i });
    fireEvent.click(prevBtn);
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ month: "2026-09" })
    );

    const nextBtn = screen.getByRole("button", { name: /Próximo mês/i });
    fireEvent.click(nextBtn);
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ month: "2026-11" })
    );
  });

  it("triggers filter change when category or source is changed", () => {
    const onFilterChange = vi.fn();
    render(
      <TransactionFilters
        month="2026-10"
        onFilterChange={onFilterChange}
      />
    );

    const categorySelect = screen.getByLabelText(/Categoria/i);
    fireEvent.change(categorySelect, { target: { value: "Alimentação" } });
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ category: "Alimentação" })
    );

    const sourceSelect = screen.getByLabelText(/Origem/i);
    fireEvent.change(sourceSelect, { target: { value: "OFX" } });
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ source: "OFX" })
    );
  });
});
