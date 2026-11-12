"use client"

import { useEffect } from "react"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import type { AutoAnimateOptions } from "@formkit/auto-animate"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"

export function useSafeAutoAnimate<T extends Element>(
  options?: Partial<AutoAnimateOptions>
) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [parent, enable] = useAutoAnimate<T>({
    duration: 180,
    easing: "ease-out",
    ...options,
  })

  useEffect(() => {
    enable(!prefersReducedMotion)
  }, [enable, prefersReducedMotion])

  return [parent, !prefersReducedMotion] as const
}
