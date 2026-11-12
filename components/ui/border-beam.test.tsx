import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { BorderBeam } from "@/components/ui/border-beam"

describe("BorderBeam", () => {
  it("renders subtle or active animated border beam states when reduced motion is off", () => {
    const { rerender } = render(<BorderBeam state="subtle" />)
    expect(screen.getByTestId("border-beam")).toHaveAttribute(
      "data-beam-state",
      "subtle"
    )

    rerender(<BorderBeam state="active" />)
    expect(screen.getByTestId("border-beam")).toHaveAttribute(
      "data-beam-state",
      "active"
    )
  })

  it("renders null when state is hidden", () => {
    render(<BorderBeam state="hidden" />)
    expect(screen.queryByTestId("border-beam")).toBeNull()
  })

  it("renders null when prefers-reduced-motion is active", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: true,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList
    )

    render(<BorderBeam state="active" />)
    expect(screen.queryByTestId("border-beam")).toBeNull()
  })
})
