import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import * as React from "react"
import { MultiMonthEvolutionChart } from "./multi-month-evolution-chart"
import type { MultiMonthEvolutionPoint } from "@/src/types/charts"

describe("MultiMonthEvolutionChart", () => {
  const sampleData: MultiMonthEvolutionPoint[] = [
    {
      month: "2026-06",
      label: "Jun/26",
      receitas: 8000,
      despesas: 4000,
      faturas: 1000,
      netBalance: 3000,
      cumulativeBalance: 3000,
    },
    {
      month: "2026-07",
      label: "Jul/26",
      receitas: 9000,
      despesas: 4500,
      faturas: 1500,
      netBalance: 3000,
      cumulativeBalance: 6000,
    },
    {
      month: "2026-08",
      label: "Ago/26",
      receitas: 8500,
      despesas: 3500,
      faturas: 1000,
      netBalance: 4000,
      cumulativeBalance: 10000,
    },
  ]

  it("renders card title, horizon selector buttons, and composed chart container", () => {
    const handleHorizonChange = vi.fn()
    render(
      <MultiMonthEvolutionChart
        data={sampleData}
        horizon="6M"
        onHorizonChange={handleHorizonChange}
      />
    )

    expect(
      screen.getByTestId("multi-month-evolution-chart")
    ).toBeInTheDocument()
    expect(
      screen.getByText("Evolução Financeira Consolidada")
    ).toBeInTheDocument()

    const btn6M = screen.getByTestId("horizon-btn-6M")
    const btn12M = screen.getByTestId("horizon-btn-12M")
    const btnAll = screen.getByTestId("horizon-btn-ALL")

    expect(btn6M).toHaveAttribute("aria-pressed", "true")
    expect(btn12M).toHaveAttribute("aria-pressed", "false")
    expect(btnAll).toHaveAttribute("aria-pressed", "false")

    fireEvent.click(btn12M)
    expect(handleHorizonChange).toHaveBeenCalledWith("12M")
  })

  it("displays growth badge with cumulative balance highlight", () => {
    render(
      <MultiMonthEvolutionChart
        data={sampleData}
        horizon="6M"
        onHorizonChange={vi.fn()}
      />
    )

    const badge = screen.getByTestId("period-growth-badge")
    expect(badge).toBeInTheDocument()
    expect(badge.textContent).toContain("R$")
  })

  it("renders empty state when data is empty and not loading", () => {
    render(
      <MultiMonthEvolutionChart
        data={[]}
        horizon="6M"
        onHorizonChange={vi.fn()}
      />
    )

    expect(screen.getByTestId("multi-month-chart-empty")).toBeInTheDocument()
    expect(
      screen.getByText("Sem histórico de movimentações no período")
    ).toBeInTheDocument()
  })

  it("renders loading skeleton when isLoading is true", () => {
    render(
      <MultiMonthEvolutionChart
        data={sampleData}
        horizon="6M"
        onHorizonChange={vi.fn()}
        isLoading={true}
      />
    )

    expect(screen.getByTestId("multi-month-chart-loading")).toBeInTheDocument()
  })
})
