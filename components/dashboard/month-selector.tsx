"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatMonthYear, shiftYearMonth } from "@/lib/formatters"
import { cn } from "@/lib/utils"

export interface MonthSelectorProps {
  currentMonth: string
  onMonthChange: (month: string) => void
  disabled?: boolean
  className?: string
}

export function MonthSelector({
  currentMonth,
  onMonthChange,
  disabled = false,
  className,
}: MonthSelectorProps) {
  const handlePreviousMonth = () => {
    const previous = shiftYearMonth(currentMonth, -1)
    onMonthChange(previous)
  }

  const handleNextMonth = () => {
    const next = shiftYearMonth(currentMonth, 1)
    onMonthChange(next)
  }

  const formattedMonth = formatMonthYear(currentMonth)

  return (
    <div
      role="group"
      aria-label="Seletor de competência mensal"
      className={cn(
        "inline-flex w-full items-center justify-between gap-1.5 rounded-xl border border-border bg-card/60 p-1 shadow-sm backdrop-blur sm:w-auto",
        className
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={disabled}
        onClick={handlePreviousMonth}
        aria-label="Mês anterior"
        className="size-9 shrink-0 text-muted-foreground hover:text-foreground sm:size-8"
      >
        <ChevronLeft className="size-4" />
      </Button>

      <div className="flex min-w-0 flex-1 items-center justify-center gap-2 px-2 text-xs font-semibold text-foreground select-none sm:min-w-[170px] sm:flex-none sm:px-3 sm:text-sm">
        <Calendar className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <span className="truncate">{formattedMonth}</span>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={disabled}
        onClick={handleNextMonth}
        aria-label="Próximo mês"
        className="size-9 shrink-0 text-muted-foreground hover:text-foreground sm:size-8"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}
