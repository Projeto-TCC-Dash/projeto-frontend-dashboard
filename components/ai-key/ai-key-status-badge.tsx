"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAiKey } from "@/hooks/use-ai-key";
import { Badge } from "@/components/ui/badge";
import { AiKeyModal } from "./ai-key-modal";
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

export function AiKeyStatusBadge() {
  const { user } = useAuth();
  const { status } = useAiKey();
  const [modalOpen, setModalOpen] = React.useState(false);

  if (!user) return null;

  const isVerified = status === "ACTIVE_VERIFIED" || (user.hasAiKey && status !== "ACTIVE_PROVISIONAL_DEMAND");
  const isProvisional = status === "ACTIVE_PROVISIONAL_DEMAND";

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none"
        title="Clique para gerenciar ou testar a chave do Google AI Studio"
      >
        {isVerified && (
          <Badge
            variant="success"
            className="flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium"
          >
            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">IA Conectada</span>
            <span className="sm:hidden">IA</span>
          </Badge>
        )}

        {isProvisional && (
          <Badge
            variant="warning"
            className="flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium"
          >
            <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Alta Demanda (Provisório)</span>
            <span className="sm:hidden">Demanda</span>
          </Badge>
        )}

        {!isVerified && !isProvisional && (
          <Badge
            variant="muted"
            className="flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium text-amber-600 dark:text-amber-400 border border-amber-500/30"
          >
            <AlertCircle className="size-3.5" />
            <span className="hidden sm:inline">IA não configurada</span>
            <span className="sm:hidden">Sem IA</span>
          </Badge>
        )}
      </button>

      <AiKeyModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
