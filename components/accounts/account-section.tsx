"use client";

import * as React from "react";
import {
  Landmark,
  CreditCard,
  TrendingUp,
  Banknote,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { formatCurrencyBRL } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { AccountCard } from "./account-card";
import { cn } from "@/lib/utils";
import {
  ACCOUNT_TYPE_LABELS,
  type Account,
  type AccountType,
} from "@/src/types/api";

const SECTION_ICONS: Record<AccountType, LucideIcon> = {
  CHECKING: Landmark,
  CREDIT_CARD: CreditCard,
  INVESTMENT: TrendingUp,
  CASH: Banknote,
  OTHER: Wallet,
};

export interface AccountSectionProps {
  type: AccountType;
  accounts: Account[];
  onEditAccount?: (account: Account) => void;
  onDeleteAccount?: (account: Account) => void;
}

export function AccountSection({
  type,
  accounts,
  onEditAccount,
  onDeleteAccount,
}: AccountSectionProps) {
  const Icon = SECTION_ICONS[type] || Wallet;
  const label = ACCOUNT_TYPE_LABELS[type] || type;

  const subtotal = React.useMemo(() => {
    return accounts.reduce((acc, account) => acc + (account.balance || 0), 0);
  }, [accounts]);

  const isNegative = subtotal < 0;

  return (
    <section className="space-y-3">
      {/* Cabeçalho da Seção Temática */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground tracking-tight flex items-center gap-2">
              {label}
              <Badge variant="outline" className="text-xs font-normal">
                {accounts.length}
              </Badge>
            </h3>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-muted-foreground mr-1.5">Subtotal:</span>
          <span
            className={cn(
              "font-semibold text-sm tracking-tight",
              isNegative ? "text-destructive" : "text-foreground"
            )}
          >
            {formatCurrencyBRL(subtotal)}
          </span>
        </div>
      </div>

      {/* Grid de Cards ou Estado Vazio da Seção */}
      {accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={onEditAccount}
              onDelete={onDeleteAccount}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border/60 p-4 text-center text-sm text-muted-foreground">
          Nenhuma conta cadastrada nesta categoria.
        </div>
      )}
    </section>
  );
}
