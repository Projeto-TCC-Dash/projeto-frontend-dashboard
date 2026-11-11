import { Metadata } from "next"
import { Sparkles } from "lucide-react"
import { ChatPanel } from "@/components/chat/chat-panel"

export const metadata: Metadata = {
  title: "Consultor IA | FinAI Dashboard",
  description:
    "Consultoria financeira virtual com streaming em tempo real via Server-Sent Events",
}

export default function ChatPage() {
  return (
    <div className="flex h-[calc(100vh-6.5rem)] flex-col space-y-4">
      {/* Cabeçalho da Página */}
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Consultor Financeiro Virtual
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Sparkles className="size-3" />
              Gemini Streaming
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            Tire dúvidas, simule cenários de economia e receba diagnósticos
            personalizados sobre suas movimentações.
          </p>
        </div>
      </div>

      {/* Painel do Chat em Tela Cheia */}
      <div className="min-h-0 flex-1">
        <ChatPanel
          showHeader={false}
          className="h-full border border-border/80 shadow-sm"
        />
      </div>
    </div>
  )
}
