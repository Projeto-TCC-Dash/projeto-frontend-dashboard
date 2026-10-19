"use client";

import * as React from "react";
import { Sparkles, User, AlertCircle, RefreshCw, Square } from "lucide-react";
import { ChatMessage } from "@/src/types/api";
import { MarkdownRenderer } from "@/lib/markdown-renderer";
import { cn } from "@/lib/utils";

export interface ChatMessageItemProps {
  message: ChatMessage;
  onRetry?: () => void;
  className?: string;
}

export const ChatMessageItem = React.memo(function ChatMessageItem({
  message,
  onRetry,
  className,
}: ChatMessageItemProps) {
  const isUser = message.role === "user";
  const isStreaming = message.status === "streaming";
  const isInterrupted = message.status === "interrupted";
  const isError = message.status === "error";

  const formattedTime = React.useMemo(() => {
    if (!message.timestamp) return "";
    try {
      const d = new Date(message.timestamp);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }, [message.timestamp]);

  return (
    <div
      className={cn(
        "flex w-full gap-3 py-2",
        isUser ? "justify-end" : "justify-start",
        className
      )}
      data-testid={`chat-message-${message.role}`}
    >
      {/* Ícone do Assistente */}
      {!isUser && (
        <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-xs">
          <Sparkles className="size-4" />
        </div>
      )}

      {/* Conteúdo da Mensagem */}
      <div
        className={cn(
          "flex max-w-[85%] sm:max-w-[75%] flex-col rounded-2xl px-4 py-3 text-sm shadow-xs transition-all",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-xs"
            : "bg-card border border-border/70 text-card-foreground rounded-tl-xs"
        )}
      >
        {/* Cabeçalho do Papel */}
        <div className="mb-1 flex items-center justify-between gap-2 text-xs opacity-75">
          <span className="font-semibold">
            {isUser ? "Você" : "Consultor Financeiro"}
          </span>
          {formattedTime && <span>{formattedTime}</span>}
        </div>

        {/* Corpo do Texto */}
        <div className="leading-relaxed">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div>
              {message.content ? (
                <MarkdownRenderer content={message.content} />
              ) : isStreaming ? (
                <span className="text-muted-foreground italic flex items-center gap-1.5 py-1">
                  <span className="inline-block size-2 rounded-full bg-primary animate-ping" />
                  Analisando contexto financeiro...
                </span>
              ) : null}

              {/* Cursor pulsante durante digitação ativa */}
              {isStreaming && (
                <span
                  data-testid="streaming-cursor"
                  className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle"
                  aria-hidden="true"
                />
              )}
            </div>
          )}
        </div>

        {/* Indicador de Resposta Interrompida */}
        {isInterrupted && (
          <div
            className="mt-2.5 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium pt-2 border-t border-border/50"
            data-testid="message-interrupted-badge"
          >
            <Square className="size-3 fill-current" />
            <span>Geração interrompida</span>
          </div>
        )}

        {/* Alerta Inline de Erro com Botão "Tentar novamente" */}
        {isError && (
          <div
            className="mt-3 flex flex-col gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive"
            data-testid="message-error-box"
          >
            <div className="flex items-start gap-1.5">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{message.error || "Ocorreu uma falha na geração da resposta."}</span>
            </div>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors font-medium cursor-pointer shadow-xs"
                data-testid="message-retry-button"
              >
                <RefreshCw className="size-3" />
                <span>Tentar novamente</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Ícone do Usuário */}
      {isUser && (
        <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-lg bg-secondary text-secondary-foreground border border-border/80 shadow-xs">
          <User className="size-4" />
        </div>
      )}
    </div>
  );
});
