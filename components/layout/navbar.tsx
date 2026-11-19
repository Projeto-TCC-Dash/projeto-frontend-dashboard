"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Scale,
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
  { href: "/investments", label: "Investimentos", icon: TrendingUp },
  { href: "/transactions", label: "Extratos", icon: ReceiptText },
  { href: "/fiscal", label: "Fiscal", icon: Scale },
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
      <div className="mx-auto flex h-14 w-full items-center justify-between gap-3 px-3 sm:px-5 lg:px-8">
        {/* Lado Esquerdo: Marca (somente texto) e Navegação Desktop */}
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:gap-5 xl:gap-7">
          <Link
            href="/"
            className="shrink-0 whitespace-nowrap font-bold tracking-tight text-foreground"
          >
            <span className="text-sm font-bold tracking-tight sm:text-base">
              FinAI Dashboard
            </span>
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto text-sm font-medium lg:flex xl:gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative z-10 flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1.5 text-xs transition-colors xl:gap-2 xl:px-2.5 xl:text-sm",
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
                  <Icon className="size-3.5 shrink-0 xl:size-4" />
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
