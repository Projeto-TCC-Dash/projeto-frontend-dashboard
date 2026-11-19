"use client"

import * as React from "react"
import { Building2, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProgressBar } from "@/components/ui/tremor/progress-bar"
import { formatCurrencyBRL, formatPercentage } from "@/lib/formatters"
import type { FiscalPjSummary } from "@/src/types/api"

export interface FiscalPjPanelProps {
  pjSummary: FiscalPjSummary | null | undefined
}

export function FiscalPjPanel({ pjSummary }: FiscalPjPanelProps) {
  if (!pjSummary || !pjSummary.applicable) {
    return null
  }

  const ceilingPct = pjSummary.ceilingPercentage
  const isNearOrAboveCeiling = ceilingPct >= 80
  const isExceeded = ceilingPct >= 100

  return (
    <Card
      data-testid="fiscal-pj-panel"
      className={
        isNearOrAboveCeiling
          ? "border-amber-500/40 bg-amber-500/5"
          : undefined
      }
    >
      <CardHeader className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">
              Painel PJ / MEI — Faturamento & Teto Anual
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Acompanhamento frente ao teto referencial MEI (
              {formatCurrencyBRL(pjSummary.annualLimit)})
            </p>
          </div>
        </div>

        {isNearOrAboveCeiling ? (
          <Badge
            data-testid="mei-ceiling-alert"
            variant={isExceeded ? "destructive" : "warning"}
            className="gap-1 self-start sm:self-auto"
          >
            <AlertTriangle className="size-3" />
            {isExceeded
              ? "Teto MEI ultrapassado"
              : "Atenção: ≥ 80% do teto MEI"}
          </Badge>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs tabular-nums">
            <span className="text-muted-foreground">
              Faturamento Bruto Acumulado
            </span>
            <span className="font-semibold text-foreground">
              {formatCurrencyBRL(pjSummary.grossRevenueYearToDate)} /{" "}
              {formatCurrencyBRL(pjSummary.annualLimit)} (
              {formatPercentage(ceilingPct)})
            </span>
          </div>
          <ProgressBar
            value={Math.min(100, ceilingPct)}
            max={100}
            color={isExceeded ? "rose" : isNearOrAboveCeiling ? "amber" : "emerald"}
            aria-label={`Consumo do teto MEI: ${formatPercentage(ceilingPct)}`}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">Pró-Labore Total</p>
            <p className="mt-1 text-base font-bold tabular-nums text-foreground">
              {formatCurrencyBRL(pjSummary.proLaboreTotal)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">
              Distribuição de Lucros / Dividendos
            </p>
            <p className="mt-1 text-base font-bold tabular-nums text-foreground">
              {formatCurrencyBRL(pjSummary.dividendsTotal)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
