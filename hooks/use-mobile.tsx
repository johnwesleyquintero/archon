"use client"

import { useState, useEffect } from "react"

/**
 * Custom hook to detect if the current viewport width is considered "mobile".
 * This is based on Tailwind's 'md' breakpoint (768px) by default.
 * @param breakpoint The maximum width for mobile, defaults to 768.
 * @returns `true` if the screen width is less than the breakpoint, `false` otherwise.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Set initial value
    checkMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile)

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [breakpoint])

  return isMobile
}

/**
 * Alias for useIsMobile for backward compatibility.
 * @deprecated Use `useIsMobile` directly.
 */
export const useMobile = useIsMobile
