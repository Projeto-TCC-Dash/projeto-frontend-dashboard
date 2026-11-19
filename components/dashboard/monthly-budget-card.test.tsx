import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MonthlyBudgetCard } from "./monthly-budget-card"
import type { BudgetOverview } from "@/src/types/api"

describe("MonthlyBudgetCard & BudgetFormDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders empty state when budget is null and opens form dialog on click", async () => {
    const onSaveBudget = vi.fn().mockResolvedValue({})

    render(
      <MonthlyBudgetCard
        month="2026-11"
        budget={null}
        onSaveBudget={onSaveBudget}
      />
    )

    expect(screen.getByTestId("monthly-budget-empty")).toBeInTheDocument()

    fireEvent.click(screen.getByTestId("open-budget-dialog-btn"))
    expect(
      await screen.findByText(/Planejamento Orçamentário/i)
    ).toBeInTheDocument()

    const totalInput = screen.getByLabelText(/Teto Global Mensal/i)
    fireEvent.change(totalInput, { target: { value: "6000" } })

    const form = totalInput.closest("form")!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(onSaveBudget).toHaveBeenCalledWith({
        totalLimitAmount: 6000,
        categoryBudgets: [
          { category: "Moradia", limitAmount: 2000 },
          { category: "Alimentação", limitAmount: 1200 },
          { category: "Transporte", limitAmount: 600 },
        ],
      })
    })
  })

  it("renders semantic REGULAR (<70%), WARNING (70-99.9%) and EXCEEDED (>=100%) states", () => {
    const budget: BudgetOverview = {
      month: "2026-11",
      totalLimitAmount: 6500,
      totalSpentAmount: 4200,
      totalRemainingAmount: 2300,
      globalPercentConsumed: 64.6,
      globalStatus: "REGULAR",
      categories: [
        {
          category: "Moradia",
          limitAmount: 2500,
          spentAmount: 1250,
          remainingAmount: 1250,
          percentConsumed: 50,
          status: "REGULAR",
        },
        {
          category: "Alimentação",
          limitAmount: 1800,
          spentAmount: 1500,
          remainingAmount: 300,
          percentConsumed: 83.3,
          status: "WARNING",
        },
        {
          category: "Lazer",
          limitAmount: 400,
          spentAmount: 450,
          remainingAmount: -50,
          percentConsumed: 112.5,
          status: "EXCEEDED",
        },
      ],
    }

    render(
      <MonthlyBudgetCard
        month="2026-11"
        budget={budget}
        onSaveBudget={vi.fn()}
      />
    )

    expect(screen.getByTestId("budget-global-status-badge")).toHaveTextContent(
      /Regular/i
    )
    expect(screen.getByTestId("budget-category-row-Moradia")).toBeInTheDocument()
    expect(
      screen.getByTestId("budget-category-row-Alimentação")
    ).toBeInTheDocument()
    expect(screen.getByTestId("budget-category-row-Lazer")).toBeInTheDocument()

    // Check semantic bar fill colors via progressbar inner fill classes
    const progressBars = screen.getAllByRole("progressbar")
    expect(progressBars[1].firstElementChild).toHaveClass("bg-emerald-500")
    expect(progressBars[2].firstElementChild).toHaveClass("bg-amber-500")
    expect(progressBars[3].firstElementChild).toHaveClass("bg-rose-500")
  })
})
