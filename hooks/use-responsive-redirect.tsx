"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

interface UseResponsiveRedirectOptions {
  enableAutoRedirect?: boolean
  mobileBreakpoint?: number
  debounceMs?: number
}

export function useResponsiveRedirect(options: UseResponsiveRedirectOptions = {}) {
  const { enableAutoRedirect = true, mobileBreakpoint = 768, debounceMs = 100 } = options

  const [isMobile, setIsMobile] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= mobileBreakpoint
      setIsMobile(mobile)
      setIsInitialized(true)
    }

    // Initial check
    checkScreenSize()

    let timeoutId: NodeJS.Timeout
    const debouncedResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(checkScreenSize, debounceMs)
    }

    window.addEventListener("resize", debouncedResize)
    return () => {
      window.removeEventListener("resize", debouncedResize)
      clearTimeout(timeoutId)
    }
  }, [mobileBreakpoint, debounceMs])

  useEffect(() => {
    if (!enableAutoRedirect || !isInitialized) return

    const currentPath = pathname
    const isMobilePath = currentPath.startsWith("/mobile")
    const isDesktopPath = currentPath.startsWith("/desktop")

    // Only redirect if we're on a mobile/desktop specific path and screen size doesn't match
    if (isMobile && isDesktopPath) {
      const mobilePath = currentPath.replace("/desktop", "/mobile")
      router.push(mobilePath)
    } else if (!isMobile && isMobilePath) {
      const desktopPath = currentPath.replace("/mobile", "/desktop")
      router.push(desktopPath)
    }
  }, [isMobile, isInitialized, enableAutoRedirect, pathname, router])

  return {
    isMobile,
    isInitialized,
  }
}
