"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMonthYear, shiftYearMonth } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export interface MonthSelectorProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
  disabled?: boolean;
  className?: string;
}

export function MonthSelector({
  currentMonth,
  onMonthChange,
  disabled = false,
  className,
}: MonthSelectorProps) {
  const handlePreviousMonth = () => {
    const previous = shiftYearMonth(currentMonth, -1);
    onMonthChange(previous);
  };

  const handleNextMonth = () => {
    const next = shiftYearMonth(currentMonth, 1);
    onMonthChange(next);
  };

  const formattedMonth = formatMonthYear(currentMonth);

  return (
    <div
      role="group"
      aria-label="Seletor de competência mensal"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/60 p-1 backdrop-blur shadow-sm",
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
        className="text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
      </Button>

      <div className="flex items-center gap-2 px-3 min-w-[170px] justify-center text-sm font-semibold text-foreground select-none">
        <Calendar className="size-4 text-primary shrink-0" aria-hidden="true" />
        <span>{formattedMonth}</span>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={disabled}
        onClick={handleNextMonth}
        aria-label="Próximo mês"
        className="text-muted-foreground hover:text-foreground"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
