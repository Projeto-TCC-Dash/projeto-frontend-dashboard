"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Sparkles } from "lucide-react"
import { useChatDrawer } from "./chat-drawer-context"
import { cn } from "@/lib/utils"

export function ChatFloatingButton({ className }: { className?: string }) {
  const pathname = usePathname()
  const { isOpen, toggleDrawer } = useChatDrawer()

  // Não renderiza o botão flutuante se o usuário já estiver na rota dedicada /chat ou com o drawer aberto
  if (pathname === "/chat" || isOpen) {
    return null
  }

  return (
    <button
      type="button"
      onClick={toggleDrawer}
      aria-label="Abrir consultor financeiro com IA"
      data-testid="chat-floating-button"
      className={cn(
        "fixed right-4 bottom-4 z-40 flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3.5 py-2.5 sm:right-6 sm:bottom-6 sm:px-4 sm:py-3",
        "bg-primary text-primary-foreground shadow-lg hover:scale-105 hover:bg-primary/90 hover:shadow-xl active:scale-95",
        "cursor-pointer border border-primary/20 transition-all duration-200",
        "animate-in duration-300 zoom-in-90 fade-in",
        className
      )}
    >
      <div className="flex size-6 items-center justify-center rounded-full bg-primary-foreground/20">
        <Sparkles className="size-3.5 fill-current" />
      </div>
      <span className="hidden pr-1 text-xs font-semibold tracking-tight sm:inline">
        Consultor IA
      </span>
    </button>
  )
}
