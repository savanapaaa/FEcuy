"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { motion } from "framer-motion"
import { Shield, Lock, Crown } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  redirectTo?: string
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = false,
  requireAdmin = false,
  redirectTo = "/login",
}) => {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (isLoading) return

    if (requireAuth && !user) {
      router.push(redirectTo)
      return
    }

    if (requireAdmin && (!user || user.role !== "admin")) {
      router.push("/admin/login")
      return
    }

    setIsChecking(false)
  }, [user, isLoading, requireAuth, requireAdmin, redirectTo, router])

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/30"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center"
          >
            <Shield className="h-8 w-8 text-white" />
          </motion.div>
          <p className="text-gray-600 font-medium">Memverifikasi akses...</p>
        </motion.div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/30"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600">Anda perlu login untuk mengakses halaman ini.</p>
        </motion.div>
      </div>
    )
  }

  if (requireAdmin && (!user || user.role !== "admin")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/30"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Akses Admin Diperlukan</h2>
          <p className="text-gray-600">Anda perlu hak akses admin untuk mengakses halaman ini.</p>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}

// Default export
export default AuthGuard
