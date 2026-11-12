import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, act } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import * as React from "react"
import { useMediaQuery } from "./use-media-query"

function Probe({ query }: { query: string }) {
  const matches = useMediaQuery(query)
  return <span data-testid="match-result">{matches ? "true" : "false"}</span>
}

describe("useMediaQuery", () => {
  const originalMatchMedia = window.matchMedia

  afterEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: originalMatchMedia,
    })
    vi.restoreAllMocks()
  })

  it("returns false during SSR even when client matchMedia matches", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: true,
        media: "(max-width: 767px)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    })

    const html = renderToString(<Probe query="(max-width: 767px)" />)
    expect(html).toContain(">false<")
  })

  it("falls back safely to false when window.matchMedia is unavailable", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: undefined,
    })

    render(<Probe query="(max-width: 767px)" />)
    expect(screen.getByTestId("match-result")).toHaveTextContent("false")
  })

  it("reads initial match state and updates on change events, removing listener on unmount", () => {
    let matches = true
    const listeners = new Set<EventListenerOrEventListenerObject>()

    const addEventListener = vi.fn(
      (event: string, listener: EventListenerOrEventListenerObject) => {
        if (event === "change") {
          listeners.add(listener)
        }
      }
    )

    const removeEventListener = vi.fn(
      (event: string, listener: EventListenerOrEventListenerObject) => {
        if (event === "change") {
          listeners.delete(listener)
        }
      }
    )

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        get matches() {
          return matches
        },
        media: query,
        addEventListener,
        removeEventListener,
      })),
    })

    const { unmount } = render(<Probe query="(max-width: 767px)" />)
    expect(screen.getByTestId("match-result")).toHaveTextContent("true")
    expect(addEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    )

    act(() => {
      matches = false
      listeners.forEach((listener) => {
        if (typeof listener === "function") {
          listener(new Event("change"))
        }
      })
    })

    expect(screen.getByTestId("match-result")).toHaveTextContent("false")

    unmount()
    expect(removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    )
    expect(listeners.size).toBe(0)
  })
})
