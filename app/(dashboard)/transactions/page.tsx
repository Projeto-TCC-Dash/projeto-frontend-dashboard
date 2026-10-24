"use client";

import * as React from "react";
import { ReceiptText, AlertCircle, Sparkles } from "lucide-react";
import { getCurrentYearMonth } from "@/lib/formatters";
import { useTransactions, TransactionFilters as ITransactionFilters } from "@/hooks/use-transactions";
import { useUploadTransactions } from "@/hooks/use-upload-transactions";
import { useUpdateTransaction } from "@/hooks/use-update-transaction";
import { useCategorizeTransactions } from "@/hooks/use-categorize-transactions";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { TransactionDropzone } from "@/components/transactions/transaction-dropzone";
import { UploadSummaryBanner } from "@/components/transactions/upload-summary-banner";
import { TransactionEditDialog } from "@/components/transactions/transaction-edit-dialog";
import { CategorizeButton } from "@/components/transactions/categorize-button";
import { AiKeyModal } from "@/components/ai-key/ai-key-modal";
import {
  Category,
  TransactionSource,
  Transaction,
  UploadTransactionsResponse,
  UpdateTransactionDTO,
  CategorizeResponse,
} from "@/src/types/api";

export default function TransactionsPage() {
  const [filters, setFilters] = React.useState<ITransactionFilters>({
    month: getCurrentYearMonth(),
    category: undefined,
    source: undefined,
    accountId: undefined,
  });

  const [uploadSummary, setUploadSummary] = React.useState<UploadTransactionsResponse | null>(null);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [categorizeSummary, setCategorizeSummary] = React.useState<CategorizeResponse | null>(null);
  const [categorizeError, setCategorizeError] = React.useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null);
  const [aiKeyModalOpen, setAiKeyModalOpen] = React.useState(false);

  const { transactions, isLoading, error } = useTransactions(filters);
  const { upload, isUploading } = useUploadTransactions();
  const { updateTransaction, isUpdating } = useUpdateTransaction();
  const {
    categorize,
    isCategorizing,
    hasAiKey,
  } = useCategorizeTransactions();

  const handleFilterChange = (newFilters: {
    month: string;
    category?: Category;
    source?: TransactionSource;
    accountId?: string;
  }) => {
    setFilters(newFilters);
  };

  const handleFileSelected = async (file: File, accountId?: string) => {
    setUploadError(null);
    setUploadSummary(null);
    try {
      const summary = await upload({ file, accountId });
      setUploadSummary(summary);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao processar o extrato.";
      setUploadError(message);
    }
  };

  const handleCategorize = async () => {
    setCategorizeError(null);
    setCategorizeSummary(null);
    try {
      const result = await categorize();
      setCategorizeSummary(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao categorizar transações.";
      setCategorizeError(message);
    }
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
  };

  const handleCloseEdit = () => {
    setEditingTransaction(null);
  };

  const handleSaveEdit = async (data: UpdateTransactionDTO) => {
    if (!editingTransaction) return;

    try {
      await updateTransaction({
        id: editingTransaction.id,
        data,
      });
      setEditingTransaction(null);
    } catch (err) {
      console.error("Falha ao salvar edição:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <ReceiptText className="size-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Gestão de Transações
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Audite, filtre e organize suas receitas e despesas por competência mensal.
          </p>
        </div>

        {/* Botão de Categorização Automática */}
        <div className="flex items-center gap-2">
          <CategorizeButton
            hasAiKey={hasAiKey}
            isCategorizing={isCategorizing}
            onCategorize={handleCategorize}
            onOpenAiKeyModal={() => setAiKeyModalOpen(true)}
          />
        </div>
      </div>

      {/* Área de Upload Drag-and-Drop */}
      <TransactionDropzone
        onFileSelected={handleFileSelected}
        isUploading={isUploading}
      />

      {/* Banner de Resumo Pós-Upload */}
      {uploadSummary && (
        <UploadSummaryBanner
          summary={uploadSummary}
          onDismiss={() => setUploadSummary(null)}
        />
      )}

      {/* Banner de Resumo Pós-Categorização por IA */}
      {categorizeSummary && (
        <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
          <div className="flex items-center gap-3">
            <Sparkles className="size-5 text-primary" />
            <div>
              <p className="font-semibold">Categorização Inteligente Concluída!</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {categorizeSummary.uniqueMerchantsAnalyzed} estabelecimentos comerciais analisados e{" "}
                <strong>{categorizeSummary.transactionsUpdated}</strong> transações reclassificadas em toda a sua conta.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCategorizeSummary(null)}
            className="text-xs text-muted-foreground hover:text-foreground font-medium"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Alerta de Erro no Upload */}
      {uploadError && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="size-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Alerta de Erro na Categorização */}
      {categorizeError && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="size-4 shrink-0" />
          <span>{categorizeError}</span>
        </div>
      )}

      {/* Barra de Filtros Dinâmicos */}
      <TransactionFilters
        month={filters.month}
        category={filters.category}
        source={filters.source}
        accountId={filters.accountId}
        onFilterChange={handleFilterChange}
      />

      {/* Erro de Requisição se houver */}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          Não foi possível carregar as transações: {error.message}
        </div>
      )}

      {/* Tabela de Transações */}
      <TransactionTable
        transactions={transactions}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
      />

      {/* Modal Acessível de Edição de Transação */}
      <TransactionEditDialog
        isOpen={Boolean(editingTransaction)}
        transaction={editingTransaction}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
        isSaving={isUpdating}
      />

      {/* Modal de Configuração de Chave de IA (BYOK) */}
      <AiKeyModal
        open={aiKeyModalOpen}
        onOpenChange={setAiKeyModalOpen}
      />
    </div>
  );
}
