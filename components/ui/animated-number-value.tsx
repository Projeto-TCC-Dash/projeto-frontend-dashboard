"use client"

import * as React from "react"
import NumberFlow, { type Format } from "@number-flow/react"
import { cn } from "@/lib/utils"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"

export interface AnimatedNumberValueProps {
  value: number
  fallbackText?: string
  locales?: Intl.LocalesArgument
  format?: Format
  prefix?: string
  suffix?: string
  className?: string
}

export function AnimatedNumberValue({
  value,
  fallbackText,
  locales = "pt-BR",
  format,
  prefix,
  suffix,
  className,
}: AnimatedNumberValueProps) {
  const prefersReducedMotion = usePrefersReducedMotion()

  const staticFormatted = React.useMemo(() => {
    if (fallbackText !== undefined) return fallbackText
    const formatted = new Intl.NumberFormat(locales, format)
      .format(value)
      .replace(/[\u00a0\u202f]/g, " ")
    return `${prefix ?? ""}${formatted}${suffix ?? ""}`
  }, [fallbackText, value, locales, format, prefix, suffix])

  if (prefersReducedMotion) {
    return (
      <span
        data-testid="animated-number-static"
        className={cn("tabular-nums", className)}
      >
        {staticFormatted}
      </span>
    )
  }

  return (
    <NumberFlow
      value={value}
      locales={locales}
      format={format}
      prefix={prefix}
      suffix={suffix}
      respectMotionPreference
      className={cn("tabular-nums", className)}
    />
  )
}
