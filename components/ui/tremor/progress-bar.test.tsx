import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ProgressBar } from "@/components/ui/tremor/progress-bar"

describe("Tremor ProgressBar", () => {
  it("renders accessible progressbar clamping value between 0 and max", () => {
    const { rerender } = render(
      <ProgressBar value={65.4} max={100} label="65,4%" />
    )

    const bar = screen.getByRole("progressbar")
    expect(bar).toHaveAttribute("aria-valuenow", "65.4")
    expect(bar).toHaveAttribute("aria-valuemin", "0")
    expect(bar).toHaveAttribute("aria-valuemax", "100")
    expect(screen.getByText("65,4%")).toBeInTheDocument()

    rerender(<ProgressBar value={140} max={100} aria-label="Meta" />)
    expect(screen.getByRole("progressbar", { name: "Meta" })).toHaveAttribute(
      "aria-valuenow",
      "100"
    )

    rerender(<ProgressBar value={-10} max={100} aria-label="Negativo" />)
    expect(
      screen.getByRole("progressbar", { name: "Negativo" })
    ).toHaveAttribute("aria-valuenow", "0")
  })
})
