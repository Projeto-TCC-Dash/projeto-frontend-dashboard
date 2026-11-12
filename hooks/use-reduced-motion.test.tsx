import { act, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"
import { useSafeAutoAnimate } from "@/hooks/use-safe-auto-animate"

function ReducedMotionProbe() {
  const reduced = usePrefersReducedMotion()
  const [listRef, enabled] = useSafeAutoAnimate<HTMLUListElement>()

  return (
    <div>
      <span data-testid="reduced-state">{String(reduced)}</span>
      <span data-testid="auto-animate-enabled">{String(enabled)}</span>
      <ul ref={listRef}>
        <li>Item 1</li>
      </ul>
    </div>
  )
}

describe("usePrefersReducedMotion and useSafeAutoAnimate", () => {
  it("returns false when prefers-reduced-motion is inactive", () => {
    render(<ReducedMotionProbe />)

    expect(screen.getByTestId("reduced-state")).toHaveTextContent("false")
    expect(screen.getByTestId("auto-animate-enabled")).toHaveTextContent("true")
  })

  it("returns true and reacts to media query changes when prefers-reduced-motion is active", () => {
    let matches = true
    const listeners = new Set<(event: MediaQueryListEvent) => void>()

    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: (
            _event: string,
            listener: (e: MediaQueryListEvent) => void
          ) => {
            listeners.add(listener)
          },
          removeEventListener: (
            _event: string,
            listener: (e: MediaQueryListEvent) => void
          ) => {
            listeners.delete(listener)
          },
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList
    )

    render(<ReducedMotionProbe />)

    expect(screen.getByTestId("reduced-state")).toHaveTextContent("true")
    expect(screen.getByTestId("auto-animate-enabled")).toHaveTextContent(
      "false"
    )

    act(() => {
      matches = false
      listeners.forEach((listener) =>
        listener({ matches: false } as MediaQueryListEvent)
      )
    })

    expect(screen.getByTestId("reduced-state")).toHaveTextContent("false")
    expect(screen.getByTestId("auto-animate-enabled")).toHaveTextContent("true")
  })
})
