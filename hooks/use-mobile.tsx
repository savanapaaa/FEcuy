"use client"

import { useState, useEffect } from "react"

export function useMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      if (typeof window !== "undefined") {
        return window.innerWidth < breakpoint
      }
      return false
    }

    // Set initial value
    setIsMobile(checkIsMobile())
    setIsInitialized(true)

    // Debounced resize handler
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setIsMobile(checkIsMobile())
      }, 150)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(timeoutId)
    }
  }, [breakpoint])

  return { isMobile, isInitialized }
}
