"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Monitor } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import DesktopForm from "@/components/forms/desktop/DesktopForm"
import { DiskomInfoLoading } from "@/components/global/diskominfo-loading"
import { useResponsiveRedirect } from "@/hooks/use-responsive-redirect"
import { showUnsavedFormAlert } from "@/lib/sweetalert-utils"

export default function DesktopFormPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isInitialized, setIsInitialized] = useState(false)
  const [hasFormData, setHasFormData] = useState<(() => boolean) | null>(null)

  // Disable responsive redirect if in edit mode to prevent redirect loops
  const urlParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
  const isEditMode = urlParams.get("edit") || urlParams.get("editId")
  
  useResponsiveRedirect({
    enableAutoRedirect: !isEditMode, // Disable if editing
    mobileBreakpoint: 768,
    debounceMs: 100,
  })

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
      } else {
        setIsInitialized(true)
      }
    }
  }, [user, isLoading, router])

  // Add browser navigation protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasFormData && hasFormData()) {
        e.preventDefault()
        e.returnValue = "Data yang sudah Anda isi akan hilang. Yakin ingin keluar?"
        return "Data yang sudah Anda isi akan hilang. Yakin ingin keluar?"
      }
    }

    const handlePopState = async (e: PopStateEvent) => {
      if (hasFormData && hasFormData()) {
        e.preventDefault()
        const result = await showUnsavedFormAlert()
        if (result.isConfirmed) {
          window.history.back()
        } else {
          // Push current state back to prevent navigation
          window.history.pushState(null, "", window.location.href)
        }
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("popstate", handlePopState)

    // Push current state to enable popstate detection
    window.history.pushState(null, "", window.location.href)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [hasFormData])

  // Handle back navigation with form data check
  const handleBackClick = async () => {
    if (hasFormData && hasFormData()) {
      const result = await showUnsavedFormAlert()
      if (result.isConfirmed) {
        router.push("/desktop")
      }
    } else {
      router.push("/desktop")
    }
  }

  // Callback to receive hasFormData function from DesktopForm
  const handleFormDataCheck = useCallback((hasDataFn: () => boolean) => {
    setHasFormData(() => () => hasDataFn())
  }, [])

  if (isLoading || !isInitialized) {
    return <DiskomInfoLoading />
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Monitor className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Form Pengajuan</h1>
                <p className="text-sm text-gray-600">Platform Desktop</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Desktop Form Component */}
          <DesktopForm onFormDataCheck={handleFormDataCheck} />
        </motion.div>
      </main>
    </div>
  )
}
