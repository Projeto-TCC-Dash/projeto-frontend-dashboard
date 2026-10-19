"use client";

import * as React from "react";
import { Sparkles, Trash2, KeyRound, ExternalLink, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useChatStream } from "@/hooks/use-chat-stream";
import { ChatMessageList } from "./chat-message-list";
import { ChatInput } from "./chat-input";
import { QuickSuggestionChips } from "./quick-suggestion-chips";
import { AiKeyModal } from "@/components/ai-key/ai-key-modal";
import { cn } from "@/lib/utils";

export interface ChatPanelProps {
  className?: string;
  showHeader?: boolean;
  onClose?: () => void;
  headerAction?: React.ReactNode;
  emptyState?: React.ReactNode;
}

export function ChatPanel({
  className,
  showHeader = true,
  onClose,
  headerAction,
  emptyState,
}: ChatPanelProps) {
  const { user } = useAuth();
  const [aiKeyModalOpen, setAiKeyModalOpen] = React.useState(false);

  const {
    messages,
    isStreaming,
    sendMessage,
    stopStream,
    clearChat,
    retryLastMessage,
  } = useChatStream();

  const hasKey = user?.hasAiKey !== false;

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background border border-border/80 rounded-2xl overflow-hidden shadow-xs",
        className
      )}
      data-testid="chat-panel"
    >
      {/* Cabeçalho do Painel */}
      {showHeader && (
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
              <Sparkles className="size-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground tracking-tight">
                Consultor Financeiro IA
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Streaming em tempo real via Gemini
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearChat}
                disabled={isStreaming}
                aria-label="Nova consulta"
                data-testid="clear-chat-button"
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
                title="Limpar histórico e iniciar nova consulta"
              >
                <Trash2 className="size-3.5" />
                <span className="hidden sm:inline">Nova consulta</span>
              </button>
            )}

            {headerAction ? (
              headerAction
            ) : onClose ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar painel"
                data-testid="panel-close-button"
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* Bloqueio Pedagógico BYOK (caso usuário não tenha chave configurada) */}
      {!hasKey && (
        <div
          className="m-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 p-6 text-center"
          data-testid="byok-missing-banner"
        >
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <KeyRound className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            Chave do Google AI Studio Necessária
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mb-4 leading-relaxed">
            Para conversar com o consultor financeiro e receber conselhos orçamentários em tempo real, cadastre sua API Key gratuita do Google Gemini.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setAiKeyModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
              data-testid="configure-ai-key-button"
            >
              <KeyRound className="size-3.5" />
              <span>Configurar Chave de IA</span>
            </button>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <span>Obter chave gratuita</span>
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      )}

      {/* Lista de Mensagens */}
      {hasKey && (
        <ChatMessageList
          messages={messages}
          onRetry={retryLastMessage}
          emptyState={emptyState ?? <QuickSuggestionChips onSelect={sendMessage} />}
          className="flex-1"
        />
      )}

      {/* Barra de Entrada de Texto */}
      <div className="border-t border-border/70 p-3 bg-muted/20">
        <ChatInput
          onSend={sendMessage}
          onStop={stopStream}
          isStreaming={isStreaming}
          disabled={!hasKey}
          placeholder={
            !hasKey
              ? "Cadastre sua chave de IA acima para liberar o chat..."
              : "Digite sua dúvida financeira ou escolha uma sugestão..."
          }
        />
      </div>

      {/* Modal BYOK */}
      <AiKeyModal open={aiKeyModalOpen} onOpenChange={setAiKeyModalOpen} />
    </div>
  );
}
