"use client";

import * as React from "react";
import { ArrowUp, Square } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatInputProps {
  onSend: (prompt: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({
  onSend,
  onStop,
  isStreaming = false,
  disabled = false,
  placeholder = "Pergunte algo sobre seu orçamento, metas ou gastos...",
  className,
}: ChatInputProps) {
  const [text, setText] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const canSubmit = text.trim().length > 0 && !disabled && !isStreaming;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;
    onSend(text.trim());
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Ajuste dinâmico de altura até 120px
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative flex items-end gap-2 rounded-2xl border border-border/80 bg-background/95 px-3 py-2 shadow-xs focus-within:ring-2 focus-within:ring-primary/30 transition-all",
        disabled && "opacity-60 pointer-events-none",
        className
      )}
      data-testid="chat-input-form"
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={isStreaming ? "Aguarde a resposta do consultor..." : placeholder}
        disabled={disabled || isStreaming}
        data-testid="chat-textarea"
        className="flex-1 max-h-[120px] resize-none border-0 bg-transparent py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 leading-relaxed"
      />

      {/* Botão Dinâmico: Parar Resposta (Streaming ativo) vs Enviar Mensagem */}
      {isStreaming ? (
        <button
          type="button"
          onClick={onStop}
          aria-label="Parar resposta"
          data-testid="chat-stop-button"
          className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <Square className="size-3.5 fill-current" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!canSubmit}
          aria-label="Enviar mensagem"
          data-testid="chat-send-button"
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-xl transition-all shadow-xs",
            canSubmit
              ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer active:scale-95"
              : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
          )}
        >
          <ArrowUp className="size-4 stroke-[2.5]" />
        </button>
      )}
    </form>
  );
}
