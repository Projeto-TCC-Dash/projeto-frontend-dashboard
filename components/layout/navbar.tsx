"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { UserNav } from "./user-nav"
import { AiKeyStatusBadge } from "@/components/ai-key/ai-key-status-badge"
import { useChatDrawer } from "@/components/chat/chat-drawer-context"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/accounts", label: "Contas" },
  { href: "/investments", label: "Investimentos" },
  { href: "/transactions", label: "Extratos" },
  { href: "/fiscal", label: "Fiscal" },
  { href: "/settings/metas", label: "Metas" },
  { href: "/chat", label: "Consultor" },
]

export function Navbar() {
  const pathname = usePathname()
  const prefersReducedMotion = usePrefersReducedMotion()
  useChatDrawer()
  const headerRef = React.useRef<HTMLElement>(null)
  const [openPathname, setOpenPathname] = React.useState<string | null>(null)
  const mobileMenuOpen = openPathname === pathname

  React.useEffect(() => {
    if (!mobileMenuOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenPathname(null)
      }
    }

    function handleMouseDown(event: MouseEvent) {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setOpenPathname(null)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleMouseDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleMouseDown)
    }
  }, [mobileMenuOpen])

  React.useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return
    }

    const mediaQuery = window.matchMedia("(min-width: 1024px)")
    const handleViewportChange = () => {
      if (mediaQuery.matches) {
        setOpenPathname(null)
      }
    }

    mediaQuery.addEventListener("change", handleViewportChange)
    return () => {
      mediaQuery.removeEventListener("change", handleViewportChange)
    }
  }, [])

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="mx-auto flex h-14 w-full max-w-screen-2xl items-center justify-between gap-4 px-3 sm:px-6 lg:px-8">
        {/* Lado Esquerdo: Marca (somente texto) e Navegação Desktop */}
        <div className="flex min-w-0 flex-1 items-center gap-4 lg:gap-6 xl:gap-8">
          <Link
            href="/"
            className="shrink-0 whitespace-nowrap font-bold tracking-tight text-foreground"
          >
            <span className="text-sm font-bold tracking-tight sm:text-base">
              FinAI Dashboard
            </span>
          </Link>

          <nav className="hidden min-w-0 items-center gap-0.5 overflow-x-auto text-sm font-medium lg:flex xl:gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative z-10 shrink-0 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13px] transition-colors xl:px-3 xl:text-sm",
                    isActive
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="navbar-active-pill"
                      data-testid="navbar-active-pill"
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 380, damping: 32 }
                      }
                      className="absolute inset-0 -z-10 rounded-md bg-secondary"
                    />
                  ) : null}
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Lado Direito: Status da IA, Tema e Usuário */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <AiKeyStatusBadge />
          <ThemeToggle />
          <UserNav />

          {/* Botão de Menu Mobile */}
          <button
            type="button"
            onClick={() =>
              setOpenPathname((prev) => (prev === pathname ? null : pathname))
            }
            className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground lg:hidden"
            aria-label={
              mobileMenuOpen ? "Fechar menu móvel" : "Abrir menu móvel"
            }
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-menu"
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Menu Mobile Recolhível */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          className="space-y-1 border-b border-border bg-background px-3 py-3 sm:px-6 lg:hidden"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpenPathname(null)}
                className={cn(
                  "flex min-h-11 items-center rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-secondary font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </header>
  )
}
