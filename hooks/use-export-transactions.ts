"use client"

import * as React from "react"
import { rawApiFetch } from "@/lib/api-client"
import { triggerBlobDownload } from "@/lib/export-utils"
import type { ExportFilterParams, ExportFormat } from "@/src/types/api"

export function useExportTransactions() {
  const [isExporting, setIsExporting] = React.useState(false)
  const [exportFormat, setExportFormat] = React.useState<ExportFormat | null>(
    null
  )
  const [error, setError] = React.useState<string | null>(null)

  const exportTransactions = React.useCallback(
    async (params: ExportFilterParams): Promise<void> => {
      setIsExporting(true)
      setExportFormat(params.format)
      setError(null)

      try {
        const response = await rawApiFetch("/api/transactions/export", {
          method: "GET",
          params: {
            format: params.format,
            month: params.month,
            startDate: params.startDate,
            endDate: params.endDate,
            accountId: params.accountId,
            category: params.category,
          },
        })

        if (!response.ok) {
          let errorMessage = `Erro HTTP ${response.status}`
          try {
            const errData = await response.json()
            if (
              errData &&
              typeof errData === "object" &&
              "message" in errData
            ) {
              errorMessage = String(errData.message)
            }
          } catch {
            // Se não for JSON, mantém o erro com o código status
          }
          throw new Error(errorMessage)
        }

        // Tenta obter filename dos headers
        let filename = `extrato-financeiro.${params.format}`
        const disposition = response.headers.get("content-disposition")
        if (disposition && disposition.includes("filename=")) {
          const match = disposition.match(
            /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
          )
          if (match && match[1]) {
            filename = match[1].replace(/['"]/g, "").trim()
          }
        } else if (params.month) {
          filename = `extrato-financeiro-${params.month}.${params.format}`
        }

        const blob = await response.blob()
        triggerBlobDownload(blob, filename)
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Falha ao gerar e exportar lançamentos financeiros"
        setError(message)
        throw err
      } finally {
        setIsExporting(false)
        setExportFormat(null)
      }
    },
    []
  )

  return {
    exportTransactions,
    isExporting,
    exportFormat,
    error,
    clearError: () => setError(null),
  }
}
