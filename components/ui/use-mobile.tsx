// This file is not used in the current project structure.
// It was likely a placeholder or part of a different design.
// Keeping it here for completeness but it can be removed if not needed.
"use client";

import { useState, useEffect } from "react";

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Example breakpoint for mobile
    };

    checkMobile(); // Check on mount
    window.addEventListener("resize", checkMobile); // Check on resize

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return isMobile;
}
