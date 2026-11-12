import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AnimatedNumberValue } from "@/components/ui/animated-number-value"

describe("AnimatedNumberValue", () => {
  it("renders NumberFlow formatted in pt-BR BRL currency when motion is enabled", () => {
    render(
      <AnimatedNumberValue
        value={4250.75}
        prefix="+"
        format={{ style: "currency", currency: "BRL" }}
      />
    )

    const node = screen.getByTestId("number-flow")
    expect(node).toHaveTextContent("+R$ 4.250,75")
    expect(node).toHaveAttribute("data-value", "4250.75")
    expect(node).toHaveAttribute("data-respect-motion", "true")
  })

  it("renders static tabular-nums span fallback when prefers-reduced-motion is active", () => {
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

    render(
      <AnimatedNumberValue
        value={10000}
        fallbackText="R$ 10.000,00"
        format={{ style: "currency", currency: "BRL" }}
      />
    )

    const staticEl = screen.getByTestId("animated-number-static")
    expect(staticEl).toHaveTextContent("R$ 10.000,00")
    expect(staticEl.className).toContain("tabular-nums")
    expect(screen.queryByTestId("number-flow")).toBeNull()
  })
})
