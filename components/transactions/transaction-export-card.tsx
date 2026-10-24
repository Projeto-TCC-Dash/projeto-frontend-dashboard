"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccounts } from "@/hooks/use-accounts";
import { useExportTransactions } from "@/hooks/use-export-transactions";
import {
  CANONICAL_CATEGORIES,
  Category,
  ExportFilterParams,
  ExportFormat,
} from "@/src/types/api";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Filter,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface TransactionExportCardProps {
  onExport?: (params: ExportFilterParams) => Promise<void>;
  isExporting?: boolean;
  exportFormat?: ExportFormat | null;
  className?: string;
}

export function TransactionExportCard({
  onExport: propOnExport,
  isExporting: propIsExporting,
  exportFormat: propExportFormat,
  className,
}: TransactionExportCardProps) {
  const { accounts, isLoading: isLoadingAccounts } = useAccounts();
  const hook = useExportTransactions();

  const handleExportAction = propOnExport || hook.exportTransactions;
  const isExporting = propIsExporting ?? hook.isExporting;
  const activeFormat = propExportFormat ?? hook.exportFormat;

  const currentMonthStr = React.useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }, []);

  const [periodType, setPeriodType] = React.useState<"month" | "range" | "all">(
    "month"
  );
  const [selectedMonth, setSelectedMonth] = React.useState(currentMonthStr);
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [selectedAccount, setSelectedAccount] = React.useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");

  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const buildFilterParams = (format: ExportFormat): ExportFilterParams => {
    const params: ExportFilterParams = { format };

    if (periodType === "month" && selectedMonth) {
      params.month = selectedMonth;
    } else if (periodType === "range") {
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
    }

    if (selectedAccount !== "ALL") {
      params.accountId = selectedAccount;
    }

    if (selectedCategory !== "ALL") {
      params.category = selectedCategory as Category;
    }

    return params;
  };

  const executeExport = async (format: ExportFormat) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const params = buildFilterParams(format);

    try {
      await handleExportAction(params);
      setSuccessMessage(
        `Exportação em ${format.toUpperCase()} iniciada com sucesso!`
      );
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Falha ao gerar o arquivo de exportação"
      );
    }
  };

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Download className="size-5 text-primary" />
          <span>Filtros & Opções de Exportação</span>
        </CardTitle>
        <CardDescription>
          Selecione os parâmetros e escolha o formato ideal para download do extrato ou relatório financeiro consolidado.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {successMessage && (
          <div
            data-testid="export-success-message"
            className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-600 dark:text-emerald-400"
          >
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div
            data-testid="export-error-message"
            className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive"
          >
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Bloco de Filtros */}
        <div className="rounded-lg border border-border/70 bg-card/60 p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground pb-1 border-b border-border/50">
            <Filter className="size-4 text-primary" />
            <span>Configurar Escopo de Dados</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro de Período */}
            <div className="space-y-2">
              <label
                htmlFor="period-type-select"
                className="text-xs font-medium text-foreground flex items-center gap-1.5"
              >
                <Calendar className="size-3.5 text-muted-foreground" />
                <span>Tipo de Período</span>
              </label>
              <select
                id="period-type-select"
                data-testid="period-type-select"
                value={periodType}
                onChange={(e) =>
                  setPeriodType(e.target.value as "month" | "range" | "all")
                }
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="month">Mês Específico</option>
                <option value="range">Intervalo Customizado</option>
                <option value="all">Todo o Histórico</option>
              </select>

              {periodType === "month" && (
                <div className="pt-1">
                  <Input
                    type="month"
                    data-testid="month-input"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              )}

              {periodType === "range" && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Input
                    type="date"
                    data-testid="start-date-input"
                    placeholder="Início"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-xs h-9 px-2"
                  />
                  <Input
                    type="date"
                    data-testid="end-date-input"
                    placeholder="Fim"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-xs h-9 px-2"
                  />
                </div>
              )}
            </div>

            {/* Filtro de Conta Bancária */}
            <div className="space-y-2">
              <label
                htmlFor="account-filter-select"
                className="text-xs font-medium text-foreground block"
              >
                Conta Bancária
              </label>
              <select
                id="account-filter-select"
                data-testid="account-filter-select"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                disabled={isLoadingAccounts}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="ALL">Todas as Contas</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground">
                Filtre por uma conta específica ou consolide todas.
              </p>
            </div>

            {/* Filtro de Categoria */}
            <div className="space-y-2">
              <label
                htmlFor="category-filter-select"
                className="text-xs font-medium text-foreground block"
              >
                Categoria
              </label>
              <select
                id="category-filter-select"
                data-testid="category-filter-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="ALL">Todas as Categorias</option>
                {CANONICAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground">
                Exporte lançamentos de um grupo de despesa/receita.
              </p>
            </div>
          </div>
        </div>

        {/* Opções de Formato com Cards de Ação */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">
            Escolha o formato de saída:
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card CSV */}
            <div className="flex flex-col justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors shadow-xs">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                    CSV
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-foreground">
                      Planilha CSV
                    </h5>
                    <span className="text-[11px] text-muted-foreground">
                      Ponto e vírgula & UTF-8
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ideal para importação universal em Excel, Google Planilhas, Notion e softwares de contabilidade.
                </p>
              </div>

              <div className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => executeExport("csv")}
                  disabled={isExporting}
                  data-testid="export-csv-button"
                  className="w-full gap-2 text-xs"
                >
                  {isExporting && activeFormat === "csv" ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <FileText className="size-3.5 text-emerald-600" />
                  )}
                  <span>Exportar CSV</span>
                </Button>
              </div>
            </div>

            {/* Card XLSX */}
            <div className="flex flex-col justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors shadow-xs">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                    XLSX
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-foreground">
                      Pasta de Trabalho Excel
                    </h5>
                    <span className="text-[11px] text-muted-foreground">
                      Formatado em Moeda (BRL)
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pasta estruturada com cores, cabeçalhos destacados e aba de KPIs consolidados por categoria.
                </p>
              </div>

              <div className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => executeExport("xlsx")}
                  disabled={isExporting}
                  data-testid="export-xlsx-button"
                  className="w-full gap-2 text-xs"
                >
                  {isExporting && activeFormat === "xlsx" ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="size-3.5 text-blue-600" />
                  )}
                  <span>Exportar XLSX</span>
                </Button>
              </div>
            </div>

            {/* Card PDF */}
            <div className="flex flex-col justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors shadow-xs">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">
                    PDF
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-foreground">
                      Relatório em PDF
                    </h5>
                    <span className="text-[11px] text-muted-foreground">
                      Pronto para Impressão
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Documento formal diagramado com cabeçalho institucional, sumário executivo e extrato completo.
                </p>
              </div>

              <div className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => executeExport("pdf")}
                  disabled={isExporting}
                  data-testid="export-pdf-button"
                  className="w-full gap-2 text-xs"
                >
                  {isExporting && activeFormat === "pdf" ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Printer className="size-3.5 text-rose-600" />
                  )}
                  <span>Exportar PDF</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
