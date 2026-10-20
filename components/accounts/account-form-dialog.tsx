"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatBrlCurrency, parseBrlToNumber } from "@/lib/formatters";
import {
  ACCOUNT_TYPES,
  ACCOUNT_TYPE_LABELS,
  type Account,
  type AccountType,
  type CreateAccountDTO,
} from "@/src/types/api";

export const PRESET_COLORS = [
  "#2563EB", // Azul Royal
  "#8B5CF6", // Roxo Violeta
  "#F97316", // Laranja
  "#10B981", // Verde Esmeralda
  "#06B6D4", // Ciano
  "#EF4444", // Vermelho
  "#F59E0B", // Âmbar
  "#64748B", // Grafite
];

export interface AccountFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  accountToEdit?: Account | null;
  onSubmit: (data: CreateAccountDTO) => Promise<void>;
  isSubmitting?: boolean;
}

export function AccountFormDialog({
  isOpen,
  onClose,
  accountToEdit,
  onSubmit,
  isSubmitting = false,
}: AccountFormDialogProps) {
  const [mounted, setMounted] = React.useState(false);
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<AccountType>("CHECKING");
  const [initialBalanceStr, setInitialBalanceStr] = React.useState("");
  const [institution, setInstitution] = React.useState("");
  const [color, setColor] = React.useState("#2563EB");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Preenche dados ao abrir/editar
  React.useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name);
      setType(accountToEdit.type);
      setInitialBalanceStr(formatBrlCurrency(accountToEdit.initialBalance));
      setInstitution(accountToEdit.institution || "");
      setColor(accountToEdit.color || "#2563EB");
    } else {
      setName("");
      setType("CHECKING");
      setInitialBalanceStr("");
      setInstitution("");
      setColor("#2563EB");
    }
    setErrorMsg(null);
  }, [accountToEdit, isOpen]);

  // Tecla Escape para fechar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMsg("O nome da conta é obrigatório.");
      return;
    }

    if (trimmedName.length > 50) {
      setErrorMsg("O nome deve ter no máximo 50 caracteres.");
      return;
    }

    const parsedBalance = parseBrlToNumber(initialBalanceStr) ?? 0;

    try {
      await onSubmit({
        name: trimmedName,
        type,
        initialBalance: parsedBalance,
        institution: institution.trim() || undefined,
        color,
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Ocorreu um erro ao salvar a conta.");
      }
    }
  };

  const isEditing = !!accountToEdit;

  const dialogContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {isEditing ? "Editar Conta Financeira" : "Nova Conta Financeira"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEditing
                ? "Atualize os metadados e saldo inicial da conta."
                : "Informe os dados da instituição para controle de saldos."}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="size-8 p-0 text-muted-foreground hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </Button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Nome da Conta */}
          <div className="space-y-1.5">
            <label
              htmlFor="account-name"
              className="text-xs font-semibold text-foreground uppercase tracking-wider"
            >
              Nome da Conta *
            </label>
            <Input
              id="account-name"
              placeholder="Ex: Nubank Principal, Reserva Inter..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              maxLength={50}
              required
            />
          </div>

          {/* Tipo de Conta */}
          <div className="space-y-1.5">
            <label
              htmlFor="account-type"
              className="text-xs font-semibold text-foreground uppercase tracking-wider"
            >
              Tipo de Conta *
            </label>
            <select
              id="account-type"
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              disabled={isSubmitting}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {ACCOUNT_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Saldo Inicial */}
            <div className="space-y-1.5">
              <label
                htmlFor="account-balance"
                className="text-xs font-semibold text-foreground uppercase tracking-wider"
              >
                Saldo Inicial (R$)
              </label>
              <Input
                id="account-balance"
                placeholder="R$ 0,00"
                value={initialBalanceStr}
                onChange={(e) => setInitialBalanceStr(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Instituição Financeira */}
            <div className="space-y-1.5">
              <label
                htmlFor="account-institution"
                className="text-xs font-semibold text-foreground uppercase tracking-wider"
              >
                Instituição Financeira
              </label>
              <Input
                id="account-institution"
                placeholder="Ex: Nubank, Itaú, XP..."
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                disabled={isSubmitting}
                maxLength={50}
              />
            </div>
          </div>

          {/* Seletor de Cores */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Cor de Identificação
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setColor(preset)}
                  disabled={isSubmitting}
                  className={cn(
                    "size-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring",
                    color.toUpperCase() === preset.toUpperCase() && "ring-2 ring-primary ring-offset-2"
                  )}
                  style={{ backgroundColor: preset }}
                  aria-label={`Cor ${preset}`}
                >
                  {color.toUpperCase() === preset.toUpperCase() && (
                    <Check className="size-4 text-white drop-shadow-sm" />
                  )}
                </button>
              ))}

              <div className="flex items-center gap-1.5 ml-1">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  disabled={isSubmitting}
                  className="size-8 rounded-lg cursor-pointer border border-input bg-background p-0.5"
                  aria-label="Escolher cor personalizada"
                />
                <span className="text-xs font-mono text-muted-foreground uppercase">
                  {color}
                </span>
              </div>
            </div>
          </div>

          {/* Rodapé e Ações */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-28">
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : isEditing ? (
                "Salvar Alterações"
              ) : (
                "Salvar Conta"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
}
