import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import * as React from "react"
import { CategoryDonutChart } from "./category-donut-chart"
import type { CategoryMetric } from "@/src/types/api"

const pushMock = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

describe("CategoryDonutChart Component (Tremor Raw)", () => {
  const sampleCategories: CategoryMetric[] = [
    { category: "Moradia", amount: 2500, percentage: 50.0 },
    { category: "Alimentação", amount: 1500, percentage: 30.0 },
    { category: "Transporte", amount: 1000, percentage: 20.0 },
  ]

  beforeEach(() => {
    pushMock.mockClear()
  })

  it("renders Tremor DonutChart, BarList legend, and formatted categories", () => {
    render(<CategoryDonutChart categories={sampleCategories} month="2026-10" />)

    expect(screen.getByTestId("category-donut-chart")).toBeInTheDocument()
    expect(screen.getByTestId("tremor-donut-chart")).toBeInTheDocument()
    expect(screen.getByTestId("category-chart-legend")).toBeInTheDocument()
    expect(screen.getByTestId("tremor-bar-list")).toBeInTheDocument()

    expect(screen.getByText("Moradia")).toBeInTheDocument()
    expect(screen.getByText("Alimentação")).toBeInTheDocument()
    expect(screen.getByText("Transporte")).toBeInTheDocument()
    expect(screen.getByText("R$ 5.000,00")).toBeInTheDocument()
  })

  it("renders loading skeleton when isLoading is true", () => {
    render(
      <CategoryDonutChart
        categories={sampleCategories}
        month="2026-10"
        isLoading={true}
      />
    )

    expect(
      screen.getByTestId("category-donut-chart-loading")
    ).toBeInTheDocument()
  })

  it("renders empty state when categories list is empty and navigates to /transactions", () => {
    render(<CategoryDonutChart categories={[]} month="2026-10" />)

    expect(screen.getByTestId("category-donut-chart-empty")).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole("button", { name: /explorar transações/i })
    )
    expect(pushMock).toHaveBeenCalledWith("/transactions")
  })

  it("updates central info on legend hover and resets on mouseLeave", () => {
    render(<CategoryDonutChart categories={sampleCategories} month="2026-10" />)

    const centerInfo = screen.getByTestId("donut-center-info")
    expect(centerInfo).toHaveTextContent("Total Despesas")
    expect(centerInfo).toHaveTextContent("R$ 5.000,00")

    const alimentacaoButton = screen.getByRole("button", {
      name: /Alimentação/i,
    })
    fireEvent.mouseEnter(alimentacaoButton.parentElement!)

    expect(centerInfo).toHaveTextContent("Alimentação")
    expect(centerInfo).toHaveTextContent("R$ 1.500,00")
    expect(centerInfo).toHaveTextContent("30,0%")

    fireEvent.mouseLeave(alimentacaoButton.parentElement!)
    expect(centerInfo).toHaveTextContent("Total Despesas")
  })

  it("navigates to /transactions with month and category filters on selection", () => {
    render(<CategoryDonutChart categories={sampleCategories} month="2026-10" />)

    const moradiaButton = screen.getByRole("button", { name: /Moradia/i })
    fireEvent.click(moradiaButton)

    expect(pushMock).toHaveBeenCalledWith(
      "/transactions?month=2026-10&category=Moradia"
    )
  })

  it("preserves canonical category colors and mobile-safe touch height on BarList items", () => {
    const extendedCategories: CategoryMetric[] = [
      ...sampleCategories,
      { category: "Investimentos", amount: 800, percentage: 10 },
      { category: "Pagamento de Fatura", amount: 500, percentage: 6 },
    ]

    const { container } = render(
      <CategoryDonutChart categories={extendedCategories} month="2026-10" />
    )

    expect(screen.getByText("Investimentos")).toBeInTheDocument()
    expect(screen.getByText("Pagamento de Fatura")).toBeInTheDocument()

    const investBtn = screen.getByRole("button", { name: /Investimentos/i })
    const rowContainer = investBtn.firstElementChild as HTMLElement
    expect(rowContainer.className).toContain("min-h-11")
    expect(rowContainer.className).toContain("sm:min-h-0")

    const coloredDots = Array.from(container.querySelectorAll("span"))
    expect(
      coloredDots.some(
        (dot) =>
          (dot as HTMLElement).style.backgroundColor === "rgb(6, 182, 212)" ||
          (dot as HTMLElement).style.backgroundColor === "#06b6d4"
      )
    ).toBe(true)
  })
})
