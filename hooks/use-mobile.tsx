"use client"

import { useEffect, useState } from "react"

/**
 * useIsMobile – returns true when `window.innerWidth` is below the breakpoint.
 * Default breakpoint = 768 px (Tailwind’s md).
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return window.innerWidth < breakpoint
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const listener = () => setIsMobile(window.innerWidth < breakpoint)
    listener() // run once on mount
    window.addEventListener("resize", listener)
    return () => window.removeEventListener("resize", listener)
  }, [breakpoint])

  return isMobile
}

/**
 * Alias kept for older code that already migrated to useMobile().
 * New code should directly use useIsMobile for clarity.
 */
export const useMobile = useIsMobile
