"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"
import {
  Sparkles,
  LayoutDashboard,
  Wallet,
  ReceiptText,
  BotMessageSquare,
  UserCheck,
  Menu,
  X,
} from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { UserNav } from "./user-nav"
import { AiKeyStatusBadge } from "@/components/ai-key/ai-key-status-badge"
import { useChatDrawer } from "@/components/chat/chat-drawer-context"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/accounts", label: "Contas", icon: Wallet },
  { href: "/transactions", label: "Extratos", icon: ReceiptText },
  { href: "/settings/metas", label: "Metas", icon: UserCheck },
  { href: "/chat", label: "Consultor", icon: BotMessageSquare },
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
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
        {/* Lado Esquerdo: Logo e Navegação Desktop */}
        <div className="flex min-w-0 items-center gap-4 lg:gap-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 font-bold text-foreground"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="size-4" />
            </div>
            <span className="hidden font-semibold tracking-tight sm:inline-block">
              FinAI Dashboard
            </span>
          </Link>

          <nav className="hidden items-center gap-1 text-sm font-medium lg:flex">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative z-10 flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
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
                  <Icon className="size-4" />
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
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpenPathname(null)}
                className={cn(
                  "flex min-h-11 items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-secondary font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </header>
  )
}
