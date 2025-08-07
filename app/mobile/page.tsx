"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileText,
  History,
  Crown,
  Plus,
  Clock,
  Sparkles,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  ArrowRight,
  Star,
  Award,
  Calendar,
  CheckCircle,
  LogOut,
  User,
  Lock,
  Settings,
  Users,
} from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useResponsiveRedirect } from "@/hooks/use-responsive-redirect"
import Swal from "sweetalert2"
import { getSubmissions } from "@/lib/api-client"

// Time-based greeting function
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 11) {
    return {
      greeting: "Selamat Pagi",
      icon: Sunrise,
      color: "from-orange-400 to-yellow-400",
      bgGradient: "from-orange-50 to-yellow-50",
    }
  } else if (hour >= 11 && hour < 15) {
    return {
      greeting: "Selamat Siang",
      icon: Sun,
      color: "from-yellow-400 to-orange-400",
      bgGradient: "from-yellow-50 to-orange-50",
    }
  } else if (hour >= 15 && hour < 18) {
    return {
      greeting: "Selamat Sore",
      icon: Sunset,
      color: "from-orange-400 to-red-400",
      bgGradient: "from-orange-50 to-red-50",
    }
  } else {
    return {
      greeting: "Selamat Malam",
      icon: Moon,
      color: "from-indigo-400 to-purple-400",
      bgGradient: "from-indigo-50 to-purple-50",
    }
  }
}

// Get current date in Indonesian format
const getCurrentDate = () => {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ]

  const now = new Date()
  const dayName = days[now.getDay()]
  const day = now.getDate()
  const month = months[now.getMonth()]
  const year = now.getFullYear()

  return `${dayName}, ${day} ${month} ${year}`
}

export default function MobileHomePage() {
  const router = useRouter()
  const { user, isAuthenticated, logout, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [timeGreeting, setTimeGreeting] = useState(getTimeBasedGreeting())
  const [currentDate, setCurrentDate] = useState(getCurrentDate())
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pendingReview: 0,
    completed: 0,
  })

  // Enable responsive redirect
  useResponsiveRedirect({
    enableAutoRedirect: true,
    mobileBreakpoint: 768,
    debounceMs: 100,
  })

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update greeting every minute
  useEffect(() => {
    if (!mounted) return

    const interval = setInterval(() => {
      setTimeGreeting(getTimeBasedGreeting())
      setCurrentDate(getCurrentDate())
    }, 60000)

    return () => clearInterval(interval)
  }, [mounted])

  // Load statistics from server instead of localStorage
  useEffect(() => {
    if (!mounted) return

    const loadStats = async () => {
      try {
        const response = await getSubmissions()
        const submissions = response.success ? response.data || [] : []
        
        const pendingCount = submissions.filter(
          (sub: any) => sub.status === "submitted" || sub.status === "review",
        ).length
        const completedCount = submissions.filter((sub: any) => sub.status === "approved").length

        setStats({
          totalSubmissions: submissions.length,
          pendingReview: pendingCount,
          completed: completedCount,
        })
      } catch (error) {
        console.error("Error loading submissions from server:", error)
        setStats({
          totalSubmissions: 0,
          pendingReview: 0,
          completed: 0,
        })
      }
    }
    
    loadStats()
  }, [mounted])

  // Handle logout with SweetAlert2
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Konfirmasi Logout",
      text: "Apakah Anda yakin ingin keluar dari sistem?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
      reverseButtons: true,
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "rounded-xl px-6 py-2",
        cancelButton: "rounded-xl px-6 py-2",
      },
    })

    if (result.isConfirmed) {
      // Show loading
      Swal.fire({
        title: "Logging out...",
        text: "Mohon tunggu sebentar",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        logout()

        // Show success message
        await Swal.fire({
          title: "Logout Berhasil!",
          text: "Anda telah berhasil keluar dari sistem",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: "rounded-2xl",
          },
        })

        // Redirect to login page after successful logout
        router.push("/login")
      } catch (error) {
        console.error("Logout error:", error)
        await Swal.fire({
          title: "Error",
          text: "Terjadi kesalahan saat logout",
          icon: "error",
          confirmButtonText: "OK",
          customClass: {
            popup: "rounded-2xl",
            confirmButton: "rounded-xl px-6 py-2",
          },
        })
      }
    }
  }

  // Handle navigation to mobile form
  const handleCreateSubmission = () => {
    if (!isAuthenticated) {
      Swal.fire({
        title: "Login Diperlukan",
        text: "Silakan login terlebih dahulu untuk membuat pengajuan",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Login Sekarang",
        cancelButtonText: "Batal",
        confirmButtonColor: "#3b82f6",
        customClass: {
          popup: "rounded-2xl",
          confirmButton: "rounded-xl px-6 py-2",
          cancelButton: "rounded-xl px-6 py-2",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/login?returnUrl=" + encodeURIComponent("/mobile/form"))
        }
      })
      return
    }

    // Navigate directly to mobile form
    router.push("/mobile/form")
  }

  // Handle navigation with auth check
  const handleNavigation = (path: string, requireAuth = false) => {
    if (requireAuth && !isAuthenticated) {
      Swal.fire({
        title: "Login Diperlukan",
        text: "Silakan login terlebih dahulu untuk mengakses fitur ini",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Login Sekarang",
        cancelButtonText: "Batal",
        confirmButtonColor: "#3b82f6",
        customClass: {
          popup: "rounded-2xl",
          confirmButton: "rounded-xl px-6 py-2",
          cancelButton: "rounded-xl px-6 py-2",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/login?returnUrl=" + encodeURIComponent(path))
        }
      })
      return
    }
    router.push(path)
  }

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const GreetingIcon = timeGreeting.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-blue-300/20 to-purple-300/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -25, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-r from-green-300/20 to-teal-300/20 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 25, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Header with User Info and Logout */}
      {isAuthenticated && user && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 px-4 pt-4 pb-2"
        >
          <div className="flex items-center justify-between bg-white/90 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-white/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{user.username}</p>
                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                  {user.role}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span className="text-sm">Logout</span>
            </Button>
          </div>
        </motion.div>
      )}

      {/* Header with Greeting */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative z-10 px-4 pt-4 pb-6"
      >
        <Card className={cn("border-0 shadow-xl bg-gradient-to-r", timeGreeting.bgGradient, "overflow-hidden")}>
          <CardContent className="p-6 relative">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <GreetingIcon className="w-full h-full" />
              </motion.div>
            </div>

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-r",
                  timeGreeting.color,
                  "shadow-lg",
                )}
              >
                <GreetingIcon className="h-8 w-8 text-white" />
              </motion.div>

              <motion.h1
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-gray-800 mb-2"
              >
                {timeGreeting.greeting}! 👋
              </motion.h1>

              <motion.p
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 mb-1 flex items-center"
              >
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                {currentDate}
              </motion.p>

              <motion.p
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-gray-500 flex items-center"
              >
                <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                {isAuthenticated ? `Selamat datang, ${user?.username}` : "Selamat datang di Sistem Pelayanan Publik"}
              </motion.p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Navigation Buttons */}
      <div className="px-4 space-y-4">
        {/* Buat Pengajuan Konten */}
        <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
          <Card
            className="border-0 shadow-xl bg-gradient-to-r from-indigo-500 to-purple-600 overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 active:scale-95"
            onClick={handleCreateSubmission}
          >
            <CardContent className="p-6 relative">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Plus className="w-full h-full text-white" />
                </motion.div>
              </div>

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 90 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                  >
                    <Plus className="h-7 w-7 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Buat Pengajuan</h3>
                    <p className="text-white/80 text-sm">Ajukan konten komunikasi publik</p>
                    {!isAuthenticated && (
                      <div className="flex items-center mt-1">
                        <Lock className="h-3 w-3 text-white/60 mr-1" />
                        <span className="text-xs text-white/60">Login diperlukan</span>
                      </div>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-6 w-6 text-white/80" />
              </div>

              {/* Floating elements */}
              <motion.div
                className="absolute top-4 right-16 w-2 h-2 bg-white/40 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
              <motion.div
                className="absolute bottom-6 right-8 w-1 h-1 bg-white/60 rounded-full"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Histori */}
        <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
          <Card
            className="border-0 shadow-xl bg-gradient-to-r from-emerald-500 to-teal-600 overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 active:scale-95"
            onClick={() => handleNavigation("/riwayat", true)}
          >
            <CardContent className="p-6 relative">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                >
                  <History className="w-full h-full text-white" />
                </motion.div>
              </div>

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotateY: 180 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                  >
                    <History className="h-7 w-7 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Riwayat</h3>
                    <p className="text-white/80 text-sm">Lihat riwayat pengajuan Anda</p>
                    {!isAuthenticated && (
                      <div className="flex items-center mt-1">
                        <Lock className="h-3 w-3 text-white/60 mr-1" />
                        <span className="text-xs text-white/60">Login diperlukan</span>
                      </div>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-6 w-6 text-white/80" />
              </div>

              {/* Badge for pending items */}
              {stats.pendingReview > 0 && isAuthenticated && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-4 right-4">
                  <Badge className="bg-orange-500 text-white border-0 shadow-lg">{stats.pendingReview} pending</Badge>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Admin - Only show if user is authenticated */}
        {isAuthenticated && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }}>
            <Card
              className="border-0 shadow-xl bg-gradient-to-r from-amber-500 to-orange-600 overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={() => router.push("/dashboard/admin")}
            >
              <CardContent className="p-6 relative">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <Crown className="w-full h-full text-white" />
                  </motion.div>
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                    >
                      <Crown className="h-7 w-7 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Admin Panel</h3>
                      <p className="text-white/80 text-sm">Kelola dan review pengajuan</p>
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-white/80" />
                </div>

                {/* VIP indicator */}
                <motion.div
                  className="absolute top-2 left-2"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Star className="h-4 w-4 text-yellow-300" />
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Role Management - Only show for superadmin */}
        {isAuthenticated && user?.role === "superadmin" && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.0 }}>
            <Card
              className="border-0 shadow-xl bg-gradient-to-r from-pink-500 to-rose-600 overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={() => router.push("/role-management")}
            >
              <CardContent className="p-6 relative">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <Users className="w-full h-full text-white" />
                  </motion.div>
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                    >
                      <Users className="h-7 w-7 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Manage Role</h3>
                      <p className="text-white/80 text-sm">Kelola pengguna dan role sistem</p>
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-white/80" />
                </div>

                {/* Super admin indicator */}
                <motion.div
                  className="absolute top-2 left-2"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Settings className="h-4 w-4 text-pink-300" />
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Login Button - Only show if not authenticated
        {!isAuthenticated && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }}>
            <Card
              className="border-0 shadow-xl bg-gradient-to-r from-blue-500 to-indigo-600 overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={() => router.push("/login")}
            >
              <CardContent className="p-6 relative">
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                    >
                      <User className="h-7 w-7 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Login</h3>
                      <p className="text-white/80 text-sm">Masuk untuk mengakses fitur lengkap</p>
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-white/80" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )} */}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="px-4 py-8 text-center"
      >
        <p className="text-xs text-gray-500 flex items-center justify-center">
          <Award className="h-3 w-3 mr-1" />
          Platform Pengajuan Konten - Kota Batu
        </p>
      </motion.div>
    </div>
  )
}
