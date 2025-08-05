"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Monitor } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import DesktopForm from "@/components/forms/desktop/DesktopForm"
import { DiskomInfoLoading } from "@/components/global/diskominfo-loading"
import { useResponsiveRedirect } from "@/hooks/use-responsive-redirect"

export default function DesktopFormPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isInitialized, setIsInitialized] = useState(false)

  // Enable responsive redirect for this page
  useResponsiveRedirect({
    enableAutoRedirect: true,
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
                onClick={() => router.push("/desktop")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Kembali ke Dashboard</span>
              </Button>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Monitor className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Form Pengajuan</h1>
                <p className="text-sm text-gray-600">Platform Desktop</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{user?.username?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Desktop Form Component */}
          <DesktopForm />
        </motion.div>
      </main>
    </div>
  )
}
