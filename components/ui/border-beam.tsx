"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { BorderBeamState } from "@/src/types/charts"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"

export interface BorderBeamProps {
  state?: BorderBeamState
  size?: number
  duration?: number
  delay?: number
  colorFrom?: string
  colorTo?: string
  borderWidth?: number
  className?: string
}

export function BorderBeam({
  state = "active",
  size = 180,
  duration,
  delay = 0,
  colorFrom = "#10b981",
  colorTo = "#06b6d4",
  borderWidth = 1.5,
  className,
}: BorderBeamProps) {
  const prefersReducedMotion = usePrefersReducedMotion()

  if (state === "hidden" || prefersReducedMotion) {
    return null
  }

  const effectiveDuration = duration ?? (state === "active" ? 4.5 : 10)
  const opacityClass = state === "active" ? "opacity-90" : "opacity-35"

  return (
    <div
      aria-hidden="true"
      data-testid="border-beam"
      data-beam-state={state}
      style={
        {
          "--border-beam-duration": `${effectiveDuration}s`,
          "--border-beam-delay": `-${delay}s`,
          borderWidth: `${borderWidth}px`,
        } as React.CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] border-transparent [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)] [mask-composite:intersect] [mask-clip:padding-box,border-box]",
        opacityClass,
        className
      )}
    >
      <div
        className="animate-border-beam absolute aspect-square"
        style={{
          width: `${size}px`,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          background: `linear-gradient(to left, ${colorFrom}, ${colorTo}, transparent)`,
        }}
      />
    </div>
  )
}
