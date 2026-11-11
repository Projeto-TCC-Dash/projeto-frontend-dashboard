"use client"

import * as React from "react"
import { Sparkles, Trash2, KeyRound, ExternalLink, X } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useChatStream } from "@/hooks/use-chat-stream"
import { ChatMessageList } from "./chat-message-list"
import { ChatInput } from "./chat-input"
import { QuickSuggestionChips } from "./quick-suggestion-chips"
import { AiKeyModal } from "@/components/ai-key/ai-key-modal"
import { cn } from "@/lib/utils"

export interface ChatPanelProps {
  className?: string
  showHeader?: boolean
  onClose?: () => void
  headerAction?: React.ReactNode
  emptyState?: React.ReactNode
}

export function ChatPanel({
  className,
  showHeader = true,
  onClose,
  headerAction,
  emptyState,
}: ChatPanelProps) {
  const { user } = useAuth()
  const [aiKeyModalOpen, setAiKeyModalOpen] = React.useState(false)

  const {
    messages,
    isStreaming,
    sendMessage,
    stopStream,
    clearChat,
    retryLastMessage,
  } = useChatStream()

  const hasKey = user?.hasAiKey !== false

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-background shadow-xs",
        className
      )}
      data-testid="chat-panel"
    >
      {/* Cabeçalho do Painel */}
      {showHeader && (
        <div className="flex items-center justify-between border-b border-border/70 bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
              <Sparkles className="size-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
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
                className="flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
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
                className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
          <h3 className="mb-1 text-base font-semibold text-foreground">
            Chave do Google AI Studio Necessária
          </h3>
          <p className="mb-4 max-w-sm text-xs leading-relaxed text-muted-foreground">
            Para conversar com o consultor financeiro e receber conselhos
            orçamentários em tempo real, cadastre sua API Key gratuita do Google
            Gemini.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setAiKeyModalOpen(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
              data-testid="configure-ai-key-button"
            >
              <KeyRound className="size-3.5" />
              <span>Configurar Chave de IA</span>
            </button>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
          emptyState={
            emptyState ?? <QuickSuggestionChips onSelect={sendMessage} />
          }
          className="flex-1"
        />
      )}

      {/* Barra de Entrada de Texto */}
      <div className="border-t border-border/70 bg-muted/20 p-3">
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
  )
}
