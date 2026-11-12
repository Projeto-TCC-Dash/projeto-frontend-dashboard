"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { TremorColor } from "@/src/types/charts"
import { getTremorColorTokens } from "@/lib/chart-utils"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"

export interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showAnimation?: boolean
  color?: TremorColor
  className?: string
  "aria-label"?: string
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showAnimation = true,
  color = "emerald",
  className,
  "aria-label": ariaLabel,
}: ProgressBarProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const safeMax = max > 0 ? max : 100
  const safeValue = Number.isFinite(value)
    ? Math.min(safeMax, Math.max(0, value))
    : 0
  const percentage = (safeValue / safeMax) * 100
  const colorTokens = getTremorColorTokens(color)
  const animateBar = showAnimation && !prefersReducedMotion

  return (
    <div className={cn("flex w-full items-center gap-2", className)}>
      <div
        role="progressbar"
        aria-valuenow={Math.round(safeValue * 10) / 10}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-label={ariaLabel ?? label ?? "Progresso"}
        className={cn(
          "relative flex h-2 w-full items-center overflow-hidden rounded-full",
          colorTokens.bgMuted
        )}
      >
        <div
          className={cn(
            "h-full flex-col rounded-full",
            colorTokens.bg,
            animateBar && "transition-[width] duration-500 ease-out"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {label ? (
        <span className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
          {label}
        </span>
      ) : null}
    </div>
  )
}
