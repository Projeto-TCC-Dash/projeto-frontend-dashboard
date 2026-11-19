"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  ReceiptText,
  Scale,
  Target,
  BotMessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"

export const SIDEBAR_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/accounts", label: "Contas e Cartões", icon: Wallet },
  { href: "/investments", label: "Investimentos", icon: TrendingUp },
  { href: "/transactions", label: "Extratos & Transações", icon: ReceiptText },
  { href: "/fiscal", label: "Planejamento Fiscal", icon: Scale },
  { href: "/settings/metas", label: "Perfil e Metas", icon: Target },
  { href: "/chat", label: "Consultor IA", icon: BotMessageSquare },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-64 flex-col space-y-4 border-r border-border bg-card p-4">
      <div className="px-2 py-3">
        <span className="text-base font-bold tracking-tight text-foreground">
          FinAI Dashboard
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
