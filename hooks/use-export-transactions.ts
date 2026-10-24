"use client";

import * as React from "react";
import { getStoredToken } from "@/lib/api-client";
import { triggerBlobDownload } from "@/lib/export-utils";
import type { ExportFilterParams, ExportFormat } from "@/src/types/api";

export function useExportTransactions() {
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportFormat, setExportFormat] = React.useState<ExportFormat | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const exportTransactions = React.useCallback(
    async (params: ExportFilterParams): Promise<void> => {
      setIsExporting(true);
      setExportFormat(params.format);
      setError(null);

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const searchParams = new URLSearchParams();
        searchParams.set("format", params.format);
        if (params.month) searchParams.set("month", params.month);
        if (params.startDate) searchParams.set("startDate", params.startDate);
        if (params.endDate) searchParams.set("endDate", params.endDate);
        if (params.accountId) searchParams.set("accountId", params.accountId);
        if (params.category) searchParams.set("category", params.category);

        const token = getStoredToken();
        const headers = new Headers();
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }

        const url = `${baseUrl}/api/transactions/export?${searchParams.toString()}`;
        const response = await fetch(url, {
          method: "GET",
          headers,
        });

        if (!response.ok) {
          let errorMessage = `Erro HTTP ${response.status}`;
          try {
            const errData = await response.json();
            if (errData && typeof errData === "object" && "message" in errData) {
              errorMessage = String(errData.message);
            }
          } catch {
            // Se não for JSON, mantém o erro com o código status
          }
          throw new Error(errorMessage);
        }

        // Tenta obter filename dos headers
        let filename = `extrato-financeiro.${params.format}`;
        const disposition = response.headers.get("content-disposition");
        if (disposition && disposition.includes("filename=")) {
          const match = disposition.match(
            /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
          );
          if (match && match[1]) {
            filename = match[1].replace(/['"]/g, "").trim();
          }
        } else if (params.month) {
          filename = `extrato-financeiro-${params.month}.${params.format}`;
        }

        const blob = await response.blob();
        triggerBlobDownload(blob, filename);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Falha ao gerar e exportar lançamentos financeiros";
        setError(message);
        throw err;
      } finally {
        setIsExporting(false);
        setExportFormat(null);
      }
    },
    []
  );

  return {
    exportTransactions,
    isExporting,
    exportFormat,
    error,
    clearError: () => setError(null),
  };
}
