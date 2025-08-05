"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"
import { motion } from "framer-motion"
import { Shield, AlertCircle, Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  fallbackUrl?: string
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
  fallbackUrl = "/login",
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push(fallbackUrl)
        return
      }

      if (requireAdmin && (!user || user.role !== "admin")) {
        router.push("/admin/login")
        return
      }
    }
  }, [isLoading, isAuthenticated, user, requireAuth, requireAdmin, router, fallbackUrl])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/30"
        >
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Loader2 className="h-8 w-8 text-blue-600" />
            </motion.div>
            <p className="text-gray-600 font-medium">Memverifikasi akses...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  // Show access denied for unauthenticated users
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/30 max-w-md mx-4"
        >
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Akses Ditolak</h2>
            <p className="text-gray-600">Anda perlu login untuk mengakses halaman ini.</p>
          </div>
        </motion.div>
      </div>
    )
  }

  // Show access denied for non-admin users trying to access admin routes
  if (requireAdmin && (!user || user.role !== "admin")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/30 max-w-md mx-4"
        >
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Akses Admin Diperlukan</h2>
            <p className="text-gray-600">Anda perlu hak akses admin untuk mengakses halaman ini.</p>
          </div>
        </motion.div>
      </div>
    )
  }

  // Render children if all checks pass
  return <>{children}</>
}
