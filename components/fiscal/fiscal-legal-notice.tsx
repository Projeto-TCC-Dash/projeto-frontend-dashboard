import * as React from "react"
import { Scale } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FiscalLegalNoticeProps {
  className?: string
}

export const FISCAL_LEGAL_NOTICE_TEXT =
  "AVISO LEGAL: Esta ferramenta atua na organização e planejamento financeiro-tributário, não substituindo a escrituração nem o parecer formal de um contador legalmente habilitado."

export function FiscalLegalNotice({ className }: FiscalLegalNoticeProps) {
  return (
    <div
      role="note"
      data-testid="fiscal-legal-notice"
      className={cn(
        "flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-amber-900 dark:border-amber-500/25 dark:bg-amber-950/20 dark:text-amber-200",
        className
      )}
    >
      <Scale className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <p className="min-w-0 font-medium">{FISCAL_LEGAL_NOTICE_TEXT}</p>
    </div>
  )
}
