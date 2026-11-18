"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export const SIDEBAR_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/accounts", label: "Contas e Cartões" },
  { href: "/investments", label: "Investimentos" },
  { href: "/transactions", label: "Extratos & Transações" },
  { href: "/fiscal", label: "Planejamento Fiscal" },
  { href: "/settings/metas", label: "Perfil e Metas" },
  { href: "/chat", label: "Consultor IA" },
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
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
