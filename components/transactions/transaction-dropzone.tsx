"use client";

import * as React from "react";
import { UploadCloud, FileText, AlertCircle, Loader2, Building2 } from "lucide-react";
import { validateStatementFile } from "@/lib/validations/transaction";
import { useAccounts } from "@/hooks/use-accounts";

export interface TransactionDropzoneProps {
  onFileSelected: (file: File, accountId?: string) => void;
  isUploading?: boolean;
}

export function TransactionDropzone({
  onFileSelected,
  isUploading = false,
}: TransactionDropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = React.useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { accounts } = useAccounts();

  const processFile = (file: File) => {
    setErrorMessage(null);
    const validation = validateStatementFile(file);

    if (!validation.isValid) {
      setErrorMessage(validation.error ?? "Arquivo inválido");
      return;
    }

    onFileSelected(file, selectedAccountId ? selectedAccountId : undefined);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isUploading) return;

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    if (files.length > 1) {
      setErrorMessage("Por favor, selecione apenas um arquivo por vez.");
      return;
    }

    processFile(files[0]);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 1) {
      setErrorMessage("Por favor, selecione apenas um arquivo por vez.");
      return;
    }

    processFile(files[0]);
    // Reset file input so same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClickZone = () => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-3">
      {/* Seletor de Conta Bancária de Origem */}
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="flex items-center gap-2">
          <Building2 className="size-4 text-zinc-500 dark:text-zinc-400" />
          <label
            htmlFor="upload-account"
            className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
          >
            Conta Bancária de Origem (opcional)
          </label>
        </div>
        <select
          id="upload-account"
          aria-label="Conta Bancária de Origem"
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          disabled={isUploading}
          className="h-9 w-full sm:w-72 rounded-lg border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <option value="">Sem conta vinculada / Padrão</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name} ({acc.institution})
            </option>
          ))}
        </select>
      </div>

      <div
        data-testid="transaction-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickZone}
        className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 cursor-pointer ${
          isUploading
            ? "pointer-events-none border-zinc-300 bg-zinc-50/50 opacity-80 dark:border-zinc-800 dark:bg-zinc-900/20"
            : isDragging
            ? "border-emerald-500 bg-emerald-500/10 scale-[1.01] shadow-md dark:border-emerald-400 dark:bg-emerald-500/20"
            : "border-zinc-300 bg-white hover:border-emerald-500/60 hover:bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-500/40 dark:hover:bg-zinc-900/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".ofx,.csv"
          multiple={false}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="size-10 animate-spin text-emerald-500" />
            <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Processando e importando extrato...
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Extraindo lançamentos e conciliando duplicidades.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2">
            <div
              className={`flex size-12 items-center justify-center rounded-full transition-colors ${
                isDragging
                  ? "bg-emerald-500 text-white"
                  : "bg-zinc-100 text-zinc-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-600 dark:bg-zinc-900 dark:text-zinc-400 dark:group-hover:bg-emerald-500/20 dark:group-hover:text-emerald-400"
              }`}
            >
              <UploadCloud className="size-6" />
            </div>

            <h4 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Arraste seu extrato bancário ou{" "}
              <span className="text-emerald-600 underline underline-offset-2 dark:text-emerald-400">
                clique para selecionar
              </span>
            </h4>

            <div className="mt-1.5 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1 font-medium">
                <FileText className="size-3.5" /> .OFX ou .CSV
              </span>
              <span>•</span>
              <span>Até 10MB</span>
              <span>•</span>
              <span>Arquivo único</span>
            </div>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
