"use client"

import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Detects if the current viewport width is below `MOBILE_BREAKPOINT`
 * and updates reactively on resize.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    const handleChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    // Initial check
    handleChange()
    mediaQuery.addEventListener("change", handleChange)

    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  return isMobile
}

/**
 * Alias kept for backward-compatibility with older imports.
 * You can safely remove this export after updating all callers.
 */
export { useIsMobile as useMobile }
