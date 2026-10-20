"use client";

import * as React from "react";
import { Edit2, Trash2, Building2 } from "lucide-react";
import { formatCurrencyBRL } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ACCOUNT_TYPE_LABELS, type Account } from "@/src/types/api";

export interface AccountCardProps {
  account: Account;
  onEdit?: (account: Account) => void;
  onDelete?: (account: Account) => void;
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const isNegative = account.balance < 0;

  return (
    <Card className="relative overflow-hidden border border-border/60 bg-card p-5 shadow-sm transition-all hover:shadow-md">
      {/* Barra de cor de destaque da conta */}
      <div
        className="absolute left-0 top-0 h-full w-1.5"
        style={{ backgroundColor: account.color || "#2563EB" }}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="size-3 rounded-full shrink-0"
              style={{ backgroundColor: account.color || "#2563EB" }}
            />
            <h4 className="font-semibold text-foreground tracking-tight truncate">
              {account.name}
            </h4>
          </div>

          {account.institution && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
              <Building2 className="size-3.5 shrink-0" />
              <span className="truncate">{account.institution}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(account)}
              className="size-8 p-0 text-muted-foreground hover:text-foreground"
              aria-label="Editar conta"
            >
              <Edit2 className="size-3.5" />
            </Button>
          )}

          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(account)}
              className="size-8 p-0 text-muted-foreground hover:text-destructive"
              aria-label="Excluir conta"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between pt-2 border-t border-border/40">
        <div>
          <Badge variant="secondary" className="text-xs font-normal">
            {ACCOUNT_TYPE_LABELS[account.type] || account.type}
          </Badge>
        </div>

        <div className="text-right">
          <p className="text-xs text-muted-foreground">Saldo Atual</p>
          <p
            className={cn(
              "text-lg font-bold tracking-tight",
              isNegative ? "text-destructive" : "text-foreground"
            )}
          >
            {formatCurrencyBRL(account.balance)}
          </p>
        </div>
      </div>
    </Card>
  );
}
