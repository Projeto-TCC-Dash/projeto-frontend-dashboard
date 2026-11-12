"use client"

import * as React from "react"
import { useAuth } from "@/hooks/use-auth"
import { useAiKey } from "@/hooks/use-ai-key"
import { Badge } from "@/components/ui/badge"
import { AiKeyModal } from "./ai-key-modal"
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react"

export function AiKeyStatusBadge() {
  const { user } = useAuth()
  const { status } = useAiKey()
  const [modalOpen, setModalOpen] = React.useState(false)

  if (!user) return null

  const isVerified =
    status === "ACTIVE_VERIFIED" ||
    (user.hasAiKey && status !== "ACTIVE_PROVISIONAL_DEMAND")
  const isProvisional = status === "ACTIVE_PROVISIONAL_DEMAND"

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="inline-flex min-h-10 shrink-0 cursor-pointer items-center transition-transform hover:scale-105 focus:outline-none active:scale-95 sm:min-h-0"
        title="Clique para gerenciar ou testar a chave do Google AI Studio"
      >
        {isVerified && (
          <Badge
            variant="success"
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium whitespace-nowrap sm:gap-1.5 sm:px-2.5 sm:text-xs"
          >
            <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">IA Conectada</span>
            <span className="sm:hidden">IA</span>
          </Badge>
        )}

        {isProvisional && (
          <Badge
            variant="warning"
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium whitespace-nowrap sm:gap-1.5 sm:px-2.5 sm:text-xs"
          >
            <AlertTriangle className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Alta Demanda (Provisório)</span>
            <span className="sm:hidden">Demanda</span>
          </Badge>
        )}

        {!isVerified && !isProvisional && (
          <Badge
            variant="muted"
            className="flex items-center gap-1 border border-amber-500/30 px-2 py-1 text-[11px] font-medium whitespace-nowrap text-amber-600 sm:gap-1.5 sm:px-2.5 sm:text-xs dark:text-amber-400"
          >
            <AlertCircle className="size-3.5 shrink-0" />
            <span className="hidden sm:inline">IA não configurada</span>
            <span className="sm:hidden">Sem IA</span>
          </Badge>
        )}
      </button>

      <AiKeyModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}
