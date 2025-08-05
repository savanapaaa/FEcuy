"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useResponsiveRedirect } from "@/hooks/use-responsive-redirect"
import DiskomInfoSplashScreenComponent from "@/components/diskominfo-splash-screen"
import { motion } from "framer-motion"
import { Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useAuth()
  const { isMobile, isInitialized } = useResponsiveRedirect({
    enableAutoRedirect: false, // Disable auto redirect for home page
    mobileBreakpoint: 768,
    debounceMs: 100,
  })

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Redirect authenticated users to their appropriate dashboard
      if (isMobile) {
        router.push("/mobile")
      } else {
        router.push("/desktop")
      }
    }
  }, [isAuthenticated, user, isLoading, router, isMobile])

  useEffect(() => {
    if (!isInitialized) return

    // Redirect based on screen size after initialization
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        if (isMobile) {
          router.push("/mobile")
        } else {
          router.push("/desktop")
        }
      }
    }, 2000) // Show splash screen for 2 seconds

        return () => clearTimeout(timer)
  }, [isMobile, isInitialized, router, isAuthenticated])

  const handleLogin = () => {
    router.push("/login")
  }

  if (isLoading || !isInitialized) {
    return <DiskomInfoSplashScreenComponent />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-300/20 to-purple-300/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-indigo-300/20 to-pink-300/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
            >
              <Shield className="h-12 w-12 text-white" />
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Platform Layanan Publik
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Sistem Multi-Role untuk Layanan Publik Digital - Diskominfo
            </p>
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
              Kelola pengajuan konten, review, validasi, dan rekap data dengan sistem role yang terintegrasi
            </p>

            <Button
              onClick={handleLogin}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Shield className="h-5 w-5 mr-2" />
              Masuk ke Sistem
            </Button>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center text-gray-500"
          >
            <p>&copy; 2024 Platform Layanan Publik - Diskominfo. All rights reserved.</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
