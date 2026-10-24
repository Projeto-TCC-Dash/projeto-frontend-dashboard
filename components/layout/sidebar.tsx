"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  ReceiptText,
  Target,
  BotMessageSquare,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const SIDEBAR_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/accounts", label: "Contas e Cartões", icon: Wallet },
  { href: "/transactions", label: "Extratos & Transações", icon: ReceiptText },
  { href: "/settings/metas", label: "Perfil e Metas", icon: Target },
  { href: "/chat", label: "Consultor IA", icon: BotMessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card p-4 flex flex-col space-y-4">
      <div className="flex items-center gap-2 px-2 py-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Sparkles className="size-4" />
        </div>
        <span className="font-semibold tracking-tight text-foreground">
          FinAI Dashboard
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
