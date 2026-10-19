"use client";

import * as React from "react";
import { ArrowDown } from "lucide-react";
import { ChatMessage } from "@/src/types/api";
import { ChatMessageItem } from "./chat-message-item";
import { cn } from "@/lib/utils";

export interface ChatMessageListProps {
  messages: ChatMessage[];
  onRetry?: () => void;
  className?: string;
  emptyState?: React.ReactNode;
}

export function ChatMessageList({
  messages,
  onRetry,
  className,
  emptyState,
}: ChatMessageListProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = React.useState(false);
  const userScrolledUpRef = React.useRef(false);

  // Monitora rolagem manual para pausar/retomar o auto-scroll
  const handleScroll = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isAtBottom = distanceFromBottom < 80;

    userScrolledUpRef.current = !isAtBottom;
    setShowScrollBottom(!isAtBottom);
  }, []);

  // Rola para o fundo ao receber novos fragmentos ou mensagens
  React.useEffect(() => {
    if (!userScrolledUpRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const scrollToBottom = React.useCallback(() => {
    userScrolledUpRef.current = false;
    setShowScrollBottom(false);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  if (messages.length === 0 && emptyState) {
    return (
      <div
        ref={containerRef}
        className={cn("flex flex-1 flex-col items-center justify-center p-4 overflow-y-auto", className)}
      >
        {emptyState}
      </div>
    );
  }

  return (
    <div className="relative flex-1 min-h-0">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        data-testid="chat-message-list-container"
        className={cn(
          "h-full overflow-y-auto px-4 py-4 space-y-2 scroll-smooth",
          className
        )}
      >
        {messages.map((msg, index) => {
          const isLast = index === messages.length - 1;
          return (
            <ChatMessageItem
              key={msg.id ?? `msg-${index}`}
              message={msg}
              onRetry={isLast ? onRetry : undefined}
            />
          );
        })}
        <div ref={bottomRef} aria-hidden="true" className="h-px" />
      </div>

      {/* Botão Flutuante de Rolar para Baixo */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          aria-label="Rolar para o final da conversa"
          data-testid="scroll-to-bottom-button"
          className="absolute bottom-4 right-6 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-all cursor-pointer z-10"
        >
          <ArrowDown className="size-4" />
        </button>
      )}
    </div>
  );
}
