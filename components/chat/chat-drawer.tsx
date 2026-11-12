"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { X, Maximize2 } from "lucide-react"
import { useChatDrawer } from "./chat-drawer-context"
import { ChatPanel } from "./chat-panel"
import { cn } from "@/lib/utils"

export function ChatDrawer() {
  const router = useRouter()
  const { isOpen, closeDrawer } = useChatDrawer()

  // Fecha gaveta com a tecla Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeDrawer()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, closeDrawer])

  if (!isOpen) return null

  const handleExpandToFullScreen = () => {
    closeDrawer()
    router.push("/chat")
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end overflow-hidden"
      data-testid="chat-drawer-overlay"
    >
      {/* Backdrop semi-transparente */}
      <div
        onClick={closeDrawer}
        data-testid="chat-drawer-backdrop"
        className="fixed inset-0 animate-in bg-background/60 backdrop-blur-xs transition-opacity duration-200 fade-in"
      />

      {/* Painel Lateral Deslizante */}
      <div
        data-testid="chat-drawer-container"
        className={cn(
          "relative z-10 flex h-dvh w-full flex-col border-l border-border/80 bg-background shadow-2xl sm:max-w-md md:max-w-lg",
          "animate-in duration-300 slide-in-from-right"
        )}
      >
        <ChatPanel
          showHeader={true}
          onClose={closeDrawer}
          className="h-full rounded-none border-0 shadow-none"
          headerAction={
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={handleExpandToFullScreen}
                aria-label="Expandir para tela cheia"
                data-testid="expand-to-fullscreen-button"
                className="flex size-10 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:size-8"
                title="Expandir para tela cheia (/chat)"
              >
                <Maximize2 className="size-4 sm:size-3.5" />
              </button>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Fechar painel"
                data-testid="close-drawer-button"
                className="flex size-10 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:size-8"
              >
                <X className="size-4" />
              </button>
            </div>
          }
        />
      </div>
    </div>
  )
}
