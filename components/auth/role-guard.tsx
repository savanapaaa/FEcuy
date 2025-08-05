"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { motion } from "framer-motion"
import { Shield, AlertTriangle, LogIn, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
  fallbackPath?: string
  showUnauthorized?: boolean
}

export function RoleGuard({
  children,
  allowedRoles,
  fallbackPath = "/desktop",
  showUnauthorized = true,
}: RoleGuardProps) {
  const { user, isLoading, isAuthenticated, hasRole } = useAuth()
  const router = useRouter()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (!hasRole(allowedRoles)) {
      if (!showUnauthorized) {
        router.push(fallbackPath)
        return
      }
      setShowContent(false)
      return
    }

    setShowContent(true)
  }, [user, isLoading, isAuthenticated, hasRole, allowedRoles, router, fallbackPath, showUnauthorized])

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

  // Unauthorized state
  if (!showContent && showUnauthorized) {
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
                <AlertTriangle className="h-10 w-10 text-white" />
              </motion.div>

              <h1 className="text-2xl font-bold text-gray-900 mb-3">Akses Ditolak</h1>
              <p className="text-gray-600 mb-6">
                Anda tidak memiliki izin untuk mengakses halaman ini.
                <span className="block mt-2 text-sm">
                  Role yang diperlukan: <span className="font-semibold text-red-600">{allowedRoles.join(", ")}</span>
                </span>
                <span className="block mt-1 text-sm">
                  Role Anda: <span className="font-semibold text-blue-600">{user?.role}</span>
                </span>
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push(fallbackPath)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Kembali ke Dashboard
                </Button>

                <Button variant="outline" onClick={() => router.push("/login")} className="w-full">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login dengan Akun Lain
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // If authorized or not showing unauthorized screen, render children
  return showContent ? <>{children}</> : null
}
