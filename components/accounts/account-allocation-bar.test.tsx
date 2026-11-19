import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import * as React from "react"
import { AccountAllocationBar } from "./account-allocation-bar"
import type { AccountAllocationSegment } from "@/src/types/charts"

describe("AccountAllocationBar", () => {
  const sampleSegments: AccountAllocationSegment[] = [
    {
      type: "CHECKING",
      label: "Conta Corrente",
      balance: 5000,
      percentage: 50,
      color: "#3b82f6",
      tremorColor: "blue",
    },
    {
      type: "INVESTMENT",
      label: "Investimentos",
      balance: 3000,
      percentage: 30,
      color: "#8b5cf6",
      tremorColor: "violet",
    },
    {
      type: "CASH",
      label: "Dinheiro em Espécie",
      balance: 2000,
      percentage: 20,
      color: "#10b981",
      tremorColor: "emerald",
    },
  ]

  it("renders segmented allocation bar and legend with formatted percentages", () => {
    render(
      <AccountAllocationBar segments={sampleSegments} totalBalance={10000} />
    )

    expect(screen.getByTestId("account-allocation-bar")).toBeInTheDocument()
    expect(screen.getByTestId("allocation-legend")).toBeInTheDocument()

    expect(screen.getByText("Conta Corrente")).toBeInTheDocument()
    expect(screen.getByText("50,0%")).toBeInTheDocument()

    expect(screen.getByText("Investimentos")).toBeInTheDocument()
    expect(screen.getByText("30,0%")).toBeInTheDocument()

    expect(screen.getByText("Dinheiro em Espécie")).toBeInTheDocument()
    expect(screen.getByText("20,0%")).toBeInTheDocument()

    const checkingSeg = screen.getByTestId("allocation-segment-CHECKING")
    expect(checkingSeg).toHaveStyle({ width: "50%" })
  })

  it("returns null or empty message when segments are empty", () => {
    const { container } = render(
      <AccountAllocationBar segments={[]} totalBalance={0} />
    )
    expect(container.firstChild).toBeNull()
  })
})
