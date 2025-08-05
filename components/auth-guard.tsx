"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { motion } from "framer-motion"
import { Shield, LogIn, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requiredRole?: string | string[]
  fallbackPath?: string
}

export function AuthGuard({ children, requireAuth = true, requiredRole, fallbackPath = "/desktop" }: AuthGuardProps) {
  const { user, isLoading, isAuthenticated, hasRole } = useAuth()
  const router = useRouter()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (isLoading) return

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push("/login")
      return
    }

    // If specific role is required but user doesn't have it
    if (requiredRole && !hasRole(requiredRole)) {
      router.push(fallbackPath)
      return
    }

    setShowContent(true)
  }, [user, isLoading, isAuthenticated, hasRole, requiredRole, requireAuth, router, fallbackPath])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Memverifikasi Akses</h2>
          <p className="text-gray-600">Mohon tunggu sebentar...</p>
          <div className="mt-4">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Not authenticated state
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
          <Card className="shadow-2xl border-0">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <LogIn className="h-10 w-10 text-white" />
              </motion.div>

              <h1 className="text-2xl font-bold text-gray-900 mb-3">Login Diperlukan</h1>
              <p className="text-gray-600 mb-6">Anda perlu login untuk mengakses halaman ini.</p>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login Sekarang
                </Button>

                <Button variant="outline" onClick={() => router.push("/")} className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Kembali ke Beranda
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return showContent ? <>{children}</> : null
}
