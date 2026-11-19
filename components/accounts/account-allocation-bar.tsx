"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { formatCurrencyBRL, formatPercentage } from "@/lib/formatters"
import type { AccountAllocationSegment } from "@/src/types/charts"

export interface AccountAllocationBarProps {
  segments: readonly AccountAllocationSegment[]
  totalBalance: number
  className?: string
}

export function AccountAllocationBar({
  segments,
  totalBalance,
  className,
}: AccountAllocationBarProps) {
  if (segments.length === 0 || totalBalance <= 0) return null

  return (
    <div
      data-testid="account-allocation-bar"
      className={cn("w-full space-y-3 pt-3", className)}
    >
      {/* Barra Proporcional Segmentada */}
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted/50">
        {segments.map((seg) => (
          <div
            key={seg.type}
            data-testid={`allocation-segment-${seg.type}`}
            style={{
              width: `${seg.percentage}%`,
              backgroundColor: seg.color,
            }}
            title={`${seg.label}: ${formatPercentage(seg.percentage)} (${formatCurrencyBRL(seg.balance)})`}
            className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
          />
        ))}
      </div>

      {/* Legenda de Alocação */}
      <div
        data-testid="allocation-legend"
        className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground"
      >
        {segments.map((seg) => (
          <div key={seg.type} className="flex items-center gap-1.5 tabular-nums">
            <span
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
              aria-hidden="true"
            />
            <span className="font-medium text-foreground">{seg.label}</span>
            <span className="text-muted-foreground">
              {formatPercentage(seg.percentage)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
