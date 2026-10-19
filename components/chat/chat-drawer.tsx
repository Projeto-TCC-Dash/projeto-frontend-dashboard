"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { X, Maximize2 } from "lucide-react";
import { useChatDrawer } from "./chat-drawer-context";
import { ChatPanel } from "./chat-panel";
import { cn } from "@/lib/utils";

export function ChatDrawer() {
  const router = useRouter();
  const { isOpen, closeDrawer } = useChatDrawer();

  // Fecha gaveta com a tecla Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeDrawer]);

  if (!isOpen) return null;

  const handleExpandToFullScreen = () => {
    closeDrawer();
    router.push("/chat");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end overflow-hidden"
      data-testid="chat-drawer-overlay"
    >
      {/* Backdrop semi-transparente */}
      <div
        onClick={closeDrawer}
        data-testid="chat-drawer-backdrop"
        className="fixed inset-0 bg-background/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Painel Lateral Deslizante */}
      <div
        data-testid="chat-drawer-container"
        className={cn(
          "relative z-10 flex h-full w-full max-w-md md:max-w-lg flex-col bg-background border-l border-border/80 shadow-2xl",
          "animate-in slide-in-from-right duration-300"
        )}
      >
        <ChatPanel
          showHeader={true}
          onClose={closeDrawer}
          className="h-full rounded-none border-0 shadow-none"
          headerAction={
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleExpandToFullScreen}
                aria-label="Expandir para tela cheia"
                data-testid="expand-to-fullscreen-button"
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Expandir para tela cheia (/chat)"
              >
                <Maximize2 className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Fechar painel"
                data-testid="close-drawer-button"
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          }
        />
      </div>
    </div>
  );
}
