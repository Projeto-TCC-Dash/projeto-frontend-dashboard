import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"
import * as React from "react"
import { Navbar } from "./navbar"

let currentPathname = "/"

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
}))

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: "light",
    setTheme: vi.fn(),
  }),
}))

vi.mock("@/components/chat/chat-drawer-context", () => ({
  useChatDrawer: () => ({
    toggleDrawer: vi.fn(),
  }),
}))

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "1", email: "debora@exemplo.com", hasAiKey: true },
    logout: vi.fn(),
  }),
}))

vi.mock("@/hooks/use-user-profile", () => ({
  useUserProfile: () => ({
    data: {
      id: "1",
      email: "debora@exemplo.com",
      name: "Débora Goulart",
      avatarUrl: null,
      hasAiKey: true,
    },
  }),
}))

vi.mock("@/hooks/use-ai-key", () => ({
  useAiKey: () => ({
    status: "ACTIVE_VERIFIED",
  }),
}))

describe("Navbar Component", () => {
  const originalMatchMedia = window.matchMedia

  beforeEach(() => {
    currentPathname = "/"
    vi.clearAllMocks()
  })

  afterEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: originalMatchMedia,
    })
  })

  it("uses lg breakpoint for full horizontal navigation and touch-sized hamburger button", () => {
    const { container } = render(<Navbar />)

    const desktopNav = container.querySelector("header nav")
    expect(desktopNav).not.toBeNull()
    expect(desktopNav?.className).toContain("hidden")
    expect(desktopNav?.className).toContain("lg:flex")
    expect(desktopNav?.className).not.toContain("md:flex")

    const toggleBtn = screen.getByRole("button", { name: /Abrir menu móvel/i })
    expect(toggleBtn.className).toContain("lg:hidden")
    expect(toggleBtn.className).toContain("size-10")
    expect(toggleBtn).toHaveAttribute("aria-expanded", "false")
    expect(toggleBtn).toHaveAttribute("aria-controls", "mobile-navigation-menu")
  })

  it("opens mobile menu with all main routes and closes on route selection, Escape, and outside click", () => {
    render(
      <div>
        <Navbar />
        <button type="button" data-testid="outside-target">
          Fora do cabeçalho
        </button>
      </div>
    )

    const toggleBtn = screen.getByRole("button", { name: /Abrir menu móvel/i })
    fireEvent.click(toggleBtn)

    expect(toggleBtn).toHaveAttribute("aria-expanded", "true")
    const mobileMenu = document.getElementById("mobile-navigation-menu")
    expect(mobileMenu).not.toBeNull()
    expect(mobileMenu?.className).toContain("lg:hidden")

    expect(
      mobileMenu?.querySelector('a[href="/accounts"]')?.textContent
    ).toContain("Contas")
    expect(
      mobileMenu?.querySelector('a[href="/transactions"]')?.textContent
    ).toContain("Extratos")
    expect(
      mobileMenu?.querySelector('a[href="/settings/metas"]')?.textContent
    ).toContain("Metas")
    expect(mobileMenu?.querySelector('a[href="/chat"]')?.textContent).toContain(
      "Consultor"
    )

    // Fecha com Escape
    fireEvent.keyDown(document, { key: "Escape" })
    expect(document.getElementById("mobile-navigation-menu")).toBeNull()

    // Reabre e fecha ao clicar fora do header
    fireEvent.click(screen.getByRole("button", { name: /Abrir menu móvel/i }))
    expect(document.getElementById("mobile-navigation-menu")).not.toBeNull()
    fireEvent.mouseDown(screen.getByTestId("outside-target"))
    expect(document.getElementById("mobile-navigation-menu")).toBeNull()

    // Reabre e fecha ao clicar em link do menu
    fireEvent.click(screen.getByRole("button", { name: /Abrir menu móvel/i }))
    const accountsLink = document
      .getElementById("mobile-navigation-menu")
      ?.querySelector('a[href="/accounts"]')
    expect(accountsLink).not.toBeNull()
    fireEvent.click(accountsLink as Element)
    expect(document.getElementById("mobile-navigation-menu")).toBeNull()
  })

  it("closes automatically on pathname change and when viewport crosses lg threshold", () => {
    let isDesktop = false
    const changeListeners = new Set<EventListenerOrEventListenerObject>()

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        get matches() {
          return isDesktop
        },
        media: query,
        addEventListener: (
          event: string,
          listener: EventListenerOrEventListenerObject
        ) => {
          if (event === "change") changeListeners.add(listener)
        },
        removeEventListener: (
          event: string,
          listener: EventListenerOrEventListenerObject
        ) => {
          if (event === "change") changeListeners.delete(listener)
        },
      })),
    })

    const { rerender } = render(<Navbar />)

    fireEvent.click(screen.getByRole("button", { name: /Abrir menu móvel/i }))
    expect(document.getElementById("mobile-navigation-menu")).not.toBeNull()

    // Mudança de rota fecha automaticamente
    currentPathname = "/transactions"
    rerender(<Navbar />)
    expect(document.getElementById("mobile-navigation-menu")).toBeNull()

    // Reabre em /transactions e simula resize para >= 1024px
    fireEvent.click(screen.getByRole("button", { name: /Abrir menu móvel/i }))
    expect(document.getElementById("mobile-navigation-menu")).not.toBeNull()

    act(() => {
      isDesktop = true
      changeListeners.forEach((listener) => {
        if (typeof listener === "function") {
          listener(new Event("change"))
        }
      })
    })

    expect(document.getElementById("mobile-navigation-menu")).toBeNull()
  })
})
