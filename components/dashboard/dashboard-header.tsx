"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { MonthSelector } from "./month-selector";
import { cn } from "@/lib/utils";

export interface DashboardHeaderProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
  isLoading?: boolean;
  hasAiKey?: boolean;
  className?: string;
}

export function DashboardHeader({
  currentMonth,
  onMonthChange,
  isLoading = false,
  hasAiKey = true,
  className,
}: DashboardHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20",
        className
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Bloco de Título e Status */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Painel Financeiro Inteligente
            </h1>
            {hasAiKey ? (
              <Badge variant="success" className="gap-1 font-medium">
                <Sparkles className="size-3" />
                IA Ativa
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 border-amber-500/30 text-amber-500 bg-amber-500/10 font-medium">
                <AlertTriangle className="size-3" />
                IA Desativada (BYOK Pendente)
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Acompanhe o fluxo de caixa mensal, a taxa de poupança e as análises geradas pelo Gemini.
          </p>
        </div>

        {/* Bloco de Ações e Navegação por Mês */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <MonthSelector
            currentMonth={currentMonth}
            onMonthChange={onMonthChange}
            disabled={isLoading}
          />

          <Link
            href="/transactions"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1.5 font-medium shadow-sm"
            )}
          >
            <span>Extratos & Transações</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
