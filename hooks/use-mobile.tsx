"use client"

import { useEffect, useState } from "react"

/**
 * Responsive helper – returns `true` when `window.innerWidth` is below
 * the provided Tailwind breakpoint (default = 768 px = `md`).
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    function update() {
      setIsMobile(window.innerWidth < breakpoint)
    }

    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [breakpoint])

  return isMobile
}

/* alias kept for older imports */
export const useMobile = useIsMobile
