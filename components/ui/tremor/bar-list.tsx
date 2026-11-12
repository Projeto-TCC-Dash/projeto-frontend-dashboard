"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { BarListItem } from "@/src/types/charts"
import { formatCurrencyBRL, formatPercentage } from "@/lib/formatters"
import { useSafeAutoAnimate } from "@/hooks/use-safe-auto-animate"

export interface BarListProps {
  data: readonly BarListItem[]
  activeKey?: string | null
  onItemHover?: (key: string | null) => void
  onItemSelect?: (item: BarListItem) => void
  valueFormatter?: (value: number) => string
  showAnimation?: boolean
  className?: string
  ariaLabel?: string
}

export function BarList({
  data,
  activeKey = null,
  onItemHover,
  onItemSelect,
  valueFormatter = formatCurrencyBRL,
  showAnimation = true,
  className,
  ariaLabel = "Lista proporcional por categoria",
}: BarListProps) {
  const [listRef, autoAnimateEnabled] = useSafeAutoAnimate<HTMLUListElement>()

  const maxValue = React.useMemo(
    () => Math.max(...data.map((item) => item.value), 0),
    [data]
  )

  return (
    <ul
      ref={showAnimation && autoAnimateEnabled ? listRef : undefined}
      aria-label={ariaLabel}
      data-testid="tremor-bar-list"
      className={cn("space-y-1.5", className)}
    >
      {data.map((item) => {
        const widthPercent =
          maxValue > 0 ? Math.max(4, (item.value / maxValue) * 100) : 0
        const isActive = activeKey === item.key
        const isDimmed = activeKey !== null && !isActive

        const rowContent = (
          <div
            className={cn(
              "group relative flex min-h-11 w-full items-center justify-between gap-3 overflow-hidden rounded-lg border border-transparent px-3 py-2 text-sm transition-colors sm:min-h-0",
              isActive
                ? "border-border/80 bg-muted/60 shadow-xs"
                : "hover:border-border/50 hover:bg-muted/40",
              isDimmed && "opacity-55"
            )}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0.5 left-0.5 rounded-md opacity-15 transition-[width] duration-300 ease-out"
              style={{
                width: `calc(${widthPercent}% - 4px)`,
                backgroundColor: item.color,
              }}
            />

            <div className="relative z-10 flex min-w-0 items-center gap-2.5">
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate font-medium text-foreground">
                {item.name}
              </span>
            </div>

            <div className="relative z-10 flex shrink-0 items-center gap-2 tabular-nums">
              <span className="font-semibold text-foreground">
                {valueFormatter(item.value)}
              </span>
              {typeof item.percentage === "number" ? (
                <span className="min-w-[3.25rem] text-right text-xs text-muted-foreground">
                  {formatPercentage(item.percentage)}
                </span>
              ) : null}
            </div>
          </div>
        )

        if (item.href) {
          return (
            <li
              key={item.key}
              onMouseEnter={() => onItemHover?.(item.key)}
              onMouseLeave={() => onItemHover?.(null)}
            >
              <Link
                href={item.href}
                onFocus={() => onItemHover?.(item.key)}
                onBlur={() => onItemHover?.(null)}
                onClick={() => onItemSelect?.(item)}
                data-active={isActive ? "true" : "false"}
                className="block rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {rowContent}
              </Link>
            </li>
          )
        }

        return (
          <li
            key={item.key}
            onMouseEnter={() => onItemHover?.(item.key)}
            onMouseLeave={() => onItemHover?.(null)}
          >
            <button
              type="button"
              onFocus={() => onItemHover?.(item.key)}
              onBlur={() => onItemHover?.(null)}
              onClick={() => onItemSelect?.(item)}
              data-active={isActive ? "true" : "false"}
              className="block w-full rounded-lg text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {rowContent}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
