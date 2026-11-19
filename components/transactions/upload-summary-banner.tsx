"use client"

import * as React from "react"
import { CheckCircle2, X } from "lucide-react"
import { UploadTransactionsResponse } from "@/src/types/api"
import { Button } from "@/components/ui/button"

export interface UploadSummaryBannerProps {
  summary: UploadTransactionsResponse
  onDismiss: () => void
}

export function UploadSummaryBanner({
  summary,
  onDismiss,
}: UploadSummaryBannerProps) {
  return (
    <div className="relative flex flex-col justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm sm:flex-row sm:items-center dark:border-emerald-900/60 dark:bg-emerald-950/30">
      <div className="flex min-w-0 items-start gap-3 sm:items-center">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white">
          <CheckCircle2 className="size-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-emerald-950 dark:text-emerald-200">
            Extrato importado com sucesso!
          </h2>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
            <span>
              <strong>{summary.totalExtracted}</strong>{" "}
              {summary.totalExtracted === 1
                ? "movimentação extraída"
                : "movimentações extraídas"}
            </span>
            <span>•</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              +{summary.imported}{" "}
              {summary.imported === 1 ? "nova adicionada" : "novas adicionadas"}
            </span>
            <span>•</span>
            <span className="text-zinc-600 dark:text-zinc-400">
              {summary.duplicatesIgnored}{" "}
              {summary.duplicatesIgnored === 1
                ? "duplicada ignorada"
                : "duplicadas ignoradas"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:shrink-0 sm:self-auto">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Fechar resumo de importação"
          onClick={onDismiss}
          className="size-10 text-emerald-800 hover:bg-emerald-100 sm:size-8 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  )
}
