import "@testing-library/jest-dom/vitest"
import React from "react"
import { vi } from "vitest"

class ResizeObserverStub implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = ResizeObserverStub
}

if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

if (
  typeof Element !== "undefined" &&
  typeof Element.prototype.animate === "function"
) {
  const nativeAnimate = Element.prototype.animate
  Element.prototype.animate = function (...args) {
    const animation = nativeAnimate.apply(this, args)
    animation?.finished?.catch(() => {})
    return animation
  }
}

vi.mock("@number-flow/react", () => ({
  __esModule: true,
  default: function MockNumberFlow({
    value,
    locales,
    format,
    prefix = "",
    suffix = "",
    animated = true,
    respectMotionPreference = true,
    className,
    "aria-label": ariaLabel,
    "data-testid": dataTestId,
  }: {
    value: number
    locales?: Intl.LocalesArgument
    format?: Intl.NumberFormatOptions
    prefix?: string
    suffix?: string
    animated?: boolean
    respectMotionPreference?: boolean
    className?: string
    "aria-label"?: string
    "data-testid"?: string
  }) {
    const formatted = new Intl.NumberFormat(locales ?? "pt-BR", format)
      .format(value)
      .replace(/[\u00a0\u202f]/g, " ")
    return React.createElement(
      "span",
      {
        className,
        "aria-label": ariaLabel,
        "data-testid": dataTestId ?? "number-flow",
        "data-value": String(value),
        "data-animated": String(animated),
        "data-respect-motion": String(respectMotionPreference),
      },
      `${prefix}${formatted}${suffix}`
    )
  },
  NumberFlowGroup: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}))
