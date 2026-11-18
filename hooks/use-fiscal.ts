"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient, apiRequest, getStoredToken } from "@/lib/api-client"
import { triggerBlobDownload } from "@/lib/export-utils"
import { useAuth } from "@/hooks/use-auth"
import type {
  FiscalAnnualSummary,
  FiscalDossierFormat,
  FiscalOcrResponse,
  UpdateTransactionFiscalDTO,
  UpdateTransactionFiscalResponse,
} from "@/src/types/api"

export function useFiscalSummary(year: string) {
  const { isAuthenticated } = useAuth()

  const query = useQuery<FiscalAnnualSummary, Error>({
    queryKey: ["fiscal", "summary", year],
    queryFn: async () => {
      return await apiClient.get<FiscalAnnualSummary>("/api/fiscal/summary", {
        params: { year },
      })
    },
    enabled: isAuthenticated && /^\d{4}$/.test(year),
    staleTime: 1000 * 60 * 2,
  })

  return {
    ...query,
    summary: query.data ?? null,
  }
}

export function useUpdateTransactionFiscal() {
  const queryClient = useQueryClient()

  const mutation = useMutation<
    UpdateTransactionFiscalResponse,
    Error,
    { transactionId: string; data: UpdateTransactionFiscalDTO }
  >({
    mutationFn: async ({ transactionId, data }) => {
      return await apiClient.patch<UpdateTransactionFiscalResponse>(
        `/api/transactions/${transactionId}/fiscal`,
        data
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fiscal"] })
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
    },
  })

  return {
    updateFiscal: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  }
}

export function useUploadFiscalOcr() {
  const mutation = useMutation<FiscalOcrResponse, Error, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)

      return await apiRequest<FiscalOcrResponse>("/api/fiscal/ocr", {
        method: "POST",
        body: formData,
      })
    },
  })

  return {
    uploadOcr: mutation.mutateAsync,
    isUploading: mutation.isPending,
    ocrResult: mutation.data ?? null,
    error: mutation.error,
    reset: mutation.reset,
  }
}

export function useExportFiscalDossier() {
  const [isExporting, setIsExporting] = React.useState(false)
  const [exportFormat, setExportFormat] =
    React.useState<FiscalDossierFormat | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const exportDossier = React.useCallback(
    async ({
      year,
      format,
    }: {
      year: string
      format: FiscalDossierFormat
    }): Promise<void> => {
      setIsExporting(true)
      setExportFormat(format)
      setError(null)

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
        const params = new URLSearchParams({ year, format })
        const token = getStoredToken()
        const headers = new Headers()
        if (token) {
          headers.set("Authorization", `Bearer ${token}`)
        }

        const response = await fetch(
          `${baseUrl}/api/fiscal/dossier?${params.toString()}`,
          {
            method: "GET",
            headers,
          }
        )

        if (!response.ok) {
          let message = `Erro HTTP ${response.status}`
          try {
            const errData = (await response.json()) as { message?: unknown }
            if (errData && typeof errData.message === "string") {
              message = errData.message
            }
          } catch {
            // Keep HTTP status fallback
          }
          throw new Error(message)
        }

        let filename = `dossie-fiscal-${year}.${format}`
        const disposition = response.headers.get("content-disposition")
        if (disposition && disposition.includes("filename=")) {
          const match = disposition.match(
            /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
          )
          if (match && match[1]) {
            filename = match[1].replace(/['"]/g, "").trim()
          }
        }

        const blob = await response.blob()
        triggerBlobDownload(blob, filename)
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Falha ao exportar dossiê fiscal anual"
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
    exportDossier,
    isExporting,
    exportFormat,
    error,
    clearError: () => setError(null),
  }
}
