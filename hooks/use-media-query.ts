"use client"

import * as React from "react"

/**
 * SSR-safe media query hook that returns `false` during server rendering and
 * synchronizes cleanly with `window.matchMedia` on the client.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      if (
        typeof window === "undefined" ||
        typeof window.matchMedia !== "function"
      ) {
        return () => {}
      }

      const mediaQueryList = window.matchMedia(query)
      mediaQueryList.addEventListener("change", onStoreChange)

      return () => {
        mediaQueryList.removeEventListener("change", onStoreChange)
      }
    },
    [query]
  )

  const getSnapshot = React.useCallback((): boolean => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return false
    }

    return window.matchMedia(query).matches
  }, [query])

  const getServerSnapshot = React.useCallback((): boolean => false, [])

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
