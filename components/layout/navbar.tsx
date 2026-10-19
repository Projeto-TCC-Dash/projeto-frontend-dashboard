"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, LayoutDashboard, ReceiptText, BotMessageSquare, Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { UserNav } from "./user-nav";
import { AiKeyStatusBadge } from "@/components/ai-key/ai-key-status-badge";
import { useChatDrawer } from "@/components/chat/chat-drawer-context";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Extratos & Transações", icon: ReceiptText },
  { href: "/chat", label: "Consultor IA", icon: BotMessageSquare },
];

export function Navbar() {
  const pathname = usePathname();
  const { toggleDrawer } = useChatDrawer();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Lado Esquerdo: Logo e Navegação Desktop */}
        <div className="flex items-center gap-6 md:gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="size-4" />
            </div>
            <span className="hidden sm:inline-block tracking-tight font-semibold">
              FinAI Dashboard
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-secondary text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Lado Direito: Status da IA, Tema e Usuário */}
        <div className="flex items-center gap-2 sm:gap-3">
          {pathname !== "/chat" && (
            <button
              type="button"
              onClick={toggleDrawer}
              aria-label="Abrir consultor financeiro"
              data-testid="navbar-chat-drawer-button"
              className="hidden sm:flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
              title="Abrir Consultor IA"
            >
              <BotMessageSquare className="size-4.5" />
            </button>
          )}
          <AiKeyStatusBadge />
          <ThemeToggle />
          <UserNav />

          {/* Botão de Menu Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60"
            aria-label="Abrir menu móvel"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile Recolhível */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-secondary text-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
