"use client"

import { useEffect, useState } from "react"

/**
 * Screens ≤ 768 px are considered “mobile”.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(typeof window === "undefined" ? false : window.innerWidth <= 768)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)")
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)

    // Initial value & listener
    setIsMobile(mq.matches)
    mq.addEventListener("change", handler)

    return () => mq.removeEventListener("change", handler)
  }, [])

  return isMobile
}

/* Older components import { useMobile } – keep alias. */
export const useMobile = useIsMobile
