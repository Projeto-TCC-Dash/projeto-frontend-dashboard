"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useChatDrawer } from "./chat-drawer-context";
import { cn } from "@/lib/utils";

export function ChatFloatingButton({ className }: { className?: string }) {
  const pathname = usePathname();
  const { isOpen, toggleDrawer } = useChatDrawer();

  // Não renderiza o botão flutuante se o usuário já estiver na rota dedicada /chat ou com o drawer aberto
  if (pathname === "/chat" || isOpen) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggleDrawer}
      aria-label="Abrir consultor financeiro com IA"
      data-testid="chat-floating-button"
      className={cn(
        "fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full px-4 py-3",
        "bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:bg-primary/90 hover:scale-105 active:scale-95",
        "transition-all duration-200 cursor-pointer border border-primary/20",
        "animate-in fade-in zoom-in-90 duration-300",
        className
      )}
    >
      <div className="flex size-6 items-center justify-center rounded-full bg-primary-foreground/20">
        <Sparkles className="size-3.5 fill-current" />
      </div>
      <span className="text-xs font-semibold tracking-tight pr-1 hidden sm:inline">
        Consultor IA
      </span>
    </button>
  );
}
