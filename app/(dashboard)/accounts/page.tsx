"use client";

import * as React from "react";
import {
  Wallet,
  Plus,
  Loader2,
  TrendingUp,
  TrendingDown,
  Building2,
  CheckCircle2,
} from "lucide-react";
import {
  useAccounts,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
} from "@/hooks/use-accounts";
import { formatCurrencyBRL } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccountSection } from "@/components/accounts/account-section";
import { AccountFormDialog } from "@/components/accounts/account-form-dialog";
import { AccountDeleteDialog } from "@/components/accounts/account-delete-dialog";
import { cn } from "@/lib/utils";
import {
  ACCOUNT_TYPES,
  type Account,
  type CreateAccountDTO,
} from "@/src/types/api";

export default function AccountsPage() {
  const { accounts, netWorth, isLoading, isError } = useAccounts();
  const { createAccount, isPending: isCreating } = useCreateAccount();
  const { updateAccount, isPending: isUpdating } = useUpdateAccount();
  const { deleteAccount, isPending: isDeleting } = useDeleteAccount();

  const [selectedAccountForEdit, setSelectedAccountForEdit] = React.useState<Account | null>(null);
  const [selectedAccountForDelete, setSelectedAccountForDelete] = React.useState<Account | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);

  const isNetWorthNegative = netWorth < 0;

  // Limpa feedback após 4 segundos
  React.useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => setFeedbackMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  // Agrupamento por tipo de conta
  const groupedAccounts = React.useMemo(() => {
    const groups: Record<string, Account[]> = {
      CHECKING: [],
      CREDIT_CARD: [],
      INVESTMENT: [],
      CASH: [],
      OTHER: [],
    };

    for (const acc of accounts) {
      if (groups[acc.type]) {
        groups[acc.type].push(acc);
      } else {
        groups.OTHER.push(acc);
      }
    }

    return groups;
  }, [accounts]);

  const handleOpenCreate = () => {
    setSelectedAccountForEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (account: Account) => {
    setSelectedAccountForEdit(account);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (account: Account) => {
    setSelectedAccountForDelete(account);
  };

  const handleFormSubmit = async (data: CreateAccountDTO) => {
    if (selectedAccountForEdit) {
      await updateAccount({
        id: selectedAccountForEdit.id,
        data,
      });
      setFeedbackMessage(`Conta "${data.name}" atualizada com sucesso!`);
    } else {
      await createAccount(data);
      setFeedbackMessage(`Conta "${data.name}" cadastrada com sucesso!`);
    }
  };

  const handleDeleteConfirm = async (accountId: string, cascade: boolean) => {
    await deleteAccount({ id: accountId, cascade });
    setFeedbackMessage("Conta removida com sucesso!");
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
        <span className="ml-3 text-sm text-muted-foreground">
          Carregando contas e patrimônio...
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-10">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Wallet className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Gestão de Contas & Cartões
            </h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe seu patrimônio líquido consolidado e controle saldos em cada instituição.
            </p>
          </div>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus className="size-4" />
          <span>Nova Conta</span>
        </Button>
      </div>

      {feedbackMessage && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar os dados de contas. Por favor, tente novamente mais tarde.
        </div>
      )}

      {/* Card de Destaque: Patrimônio Líquido Total */}
      <Card className="relative overflow-hidden border border-border/80 bg-gradient-to-br from-card via-card to-muted/20 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Patrimônio Líquido Total
              </span>
              <Badge variant="secondary" className="text-xs font-normal">
                {accounts.length} {accounts.length === 1 ? "conta" : "contas"}
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <p
                className={cn(
                  "text-3xl sm:text-4xl font-extrabold tracking-tight",
                  isNetWorthNegative ? "text-destructive" : "text-foreground"
                )}
              >
                {formatCurrencyBRL(netWorth)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Consolidação de ativos menos faturas e passivos de todas as suas contas.
            </p>
          </div>

          <div
            className={cn(
              "flex size-14 items-center justify-center rounded-2xl shrink-0 self-start sm:self-auto",
              isNetWorthNegative
                ? "bg-destructive/10 text-destructive"
                : "bg-emerald-500/10 text-emerald-500"
            )}
          >
            {isNetWorthNegative ? (
              <TrendingDown className="size-7" />
            ) : (
              <TrendingUp className="size-7" />
            )}
          </div>
        </div>
      </Card>

      {/* Seções Temáticas Verticais */}
      {accounts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Building2 className="size-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-foreground">
              Nenhuma conta cadastrada
            </h3>
            <p className="text-sm text-muted-foreground">
              Cadastre suas contas correntes, cartões de crédito e investimentos para começar a acompanhar seu patrimônio consolidado.
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="size-4" />
            <span>Criar Primeira Conta</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {ACCOUNT_TYPES.map((type) => (
            <AccountSection
              key={type}
              type={type}
              accounts={groupedAccounts[type] || []}
              onEditAccount={handleOpenEdit}
              onDeleteAccount={handleOpenDelete}
            />
          ))}
        </div>
      )}

      {/* Modal de Criação / Edição de Conta */}
      <AccountFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        accountToEdit={selectedAccountForEdit}
        onSubmit={handleFormSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Diálogo Seguro de Exclusão de Conta */}
      <AccountDeleteDialog
        isOpen={!!selectedAccountForDelete}
        account={selectedAccountForDelete}
        onClose={() => setSelectedAccountForDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
