"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  History,
  LogOut,
  Monitor,
  User,
  Calendar,
  Shield,
  Zap,
  Target,
  Users,
  Crown,
  CheckCircle,
  BarChart3,
  Settings,
  Eye,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useResponsiveRedirect } from "@/hooks/use-responsive-redirect"
import { RoleGuard } from "@/components/auth/role-guard"
import Swal from "sweetalert2"

export default function DesktopPage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  // Enable responsive redirect
  useResponsiveRedirect({
    enableAutoRedirect: true,
    mobileBreakpoint: 768,
    debounceMs: 100,
  })


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
      logout()
    }
  }

  const navigateToForm = () => {
    router.push("/desktop/form")
  }

  const navigateToadmin = () => {
    router.push("/dashboard/admin")
  }

  const navigateToHistory = () => {
    router.push("/riwayat")
  }

  const navigateToReview = () => {
    router.push("/dashboard/admin/review")
  }

  const navigateToValidasi = () => {
    router.push("/dashboard/admin/validasi")
  }

  const navigateToRekap = () => {
    router.push("/dashboard/admin/rekap")
  }

  const navigateToRoleManagement = () => {
    router.push("/role-management")
  }

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      superadmin: "Super Administrator",
      form: "Form User",
      review: "Reviewer",
      validasi: "Validator",
      rekap: "Rekap User",
    }
    return roleNames[role as keyof typeof roleNames] || role
  }

  const getRoleColor = (role: string) => {
    const roleColors = {
      superadmin: "from-purple-600 to-pink-600",
      form: "from-blue-600 to-cyan-600",
      review: "from-green-600 to-emerald-600",
      validasi: "from-orange-600 to-red-600",
      rekap: "from-indigo-600 to-purple-600",
    }
    return roleColors[role as keyof typeof roleColors] || "from-gray-600 to-gray-700"
  }

  return (
    <RoleGuard allowedRoles={["superadmin", "form", "review", "validasi", "rekap"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-indigo-300/30 to-purple-300/30 rounded-full blur-3xl"
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
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-300/30 to-cyan-300/30 rounded-full blur-3xl"
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

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-white/30 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo & Title */}
              <div className="flex items-center space-x-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.8, type: "spring" }}
                  className={`p-3 bg-gradient-to-r ${getRoleColor(user?.role || "")} rounded-2xl shadow-lg`}
                >
                  <Monitor className="h-8 w-8 text-white" />
                </motion.div>
                <div>
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`text-2xl font-bold bg-gradient-to-r ${getRoleColor(user?.role || "")} bg-clip-text text-transparent`}
                  >
                    Dashboard {getRoleDisplayName(user?.role || "")}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-gray-600"
                  >
                    Platform Pengajuan Konten - Diskominfo Kota Batu
                  </motion.p>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-4">

                {/* User Menu */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-3 bg-white/50 hover:bg-white/70">
                        <div className={`p-2 bg-gradient-to-r ${getRoleColor(user?.role || "")} rounded-full`}>
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                          <p className="text-xs text-gray-600 capitalize">{getRoleDisplayName(user?.role || "")}</p>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />
                        Keluar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Selamat datang,{" "}
              <span className={`bg-gradient-to-r ${getRoleColor(user?.role || "")} bg-clip-text text-transparent`}>
                {user?.fullName}!
              </span>
            </h2>
          </motion.div>

          {/* Role-based Action Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          >
            {/* Superadmin Cards */}
            {user?.role === "superadmin" && (
              <>
                {/* Form Pengajuan Konten */}
                <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer">
                  <CardContent className="p-8 text-center" onClick={() => router.push("/desktop/form")}>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="p-6 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl mx-auto mb-6 w-fit group-hover:shadow-2xl"
                    >
                      <Plus className="h-12 w-12 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Form Pengajuan Konten</h3>
                    <div className="flex items-center justify-center space-x-2 text-blue-600 group-hover:text-cyan-600 transition-colors">
                      <Zap className="h-4 w-4" />
                      <span className="font-medium">Mulai Pengajuan</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Riwayat Pengajuan */}
                <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer">
                  <CardContent className="p-8 text-center" onClick={navigateToHistory}>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl mx-auto mb-6 w-fit group-hover:shadow-2xl"
                    >
                      <History className="h-12 w-12 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Riwayat Pengajuan</h3>
                    <div className="flex items-center justify-center space-x-2 text-green-600 group-hover:text-emerald-600 transition-colors">
                      <Target className="h-4 w-4" />
                      <span className="font-medium">Lihat Riwayat</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Dashboard Admin */}
                <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer">
                  <CardContent className="p-8 text-center" onClick={() => router.push("/dashboard/admin")}>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="p-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl mx-auto mb-6 w-fit group-hover:shadow-2xl"
                    >
                      <Shield className="h-12 w-12 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Dashboard Admin</h3>
                    <div className="flex items-center justify-center space-x-2 text-orange-600 group-hover:text-red-600 transition-colors">
                      <Settings className="h-4 w-4" />
                      <span className="font-medium">Panel Admin</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Manajemen Role */}
                <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer">
                  <CardContent className="p-8 text-center" onClick={navigateToRoleManagement}>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="p-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl mx-auto mb-6 w-fit group-hover:shadow-2xl"
                    >
                      <Crown className="h-12 w-12 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Manajemen Role</h3>
                    <div className="flex items-center justify-center space-x-2 text-purple-600 group-hover:text-pink-600 transition-colors">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">Kelola User</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Form Role Cards */}
            {user?.role === "form" && (
              <>
                {/* Form Pengajuan Konten */}
                <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer">
                  <CardContent className="p-8 text-center" onClick={() => router.push("/desktop/form")}>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="p-6 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl mx-auto mb-6 w-fit group-hover:shadow-2xl"
                    >
                      <Plus className="h-12 w-12 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Form Pengajuan Konten</h3>
                    <div className="flex items-center justify-center space-x-2 text-blue-600 group-hover:text-cyan-600 transition-colors">
                      <Zap className="h-4 w-4" />
                      <span className="font-medium">Mulai Pengajuan</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Riwayat Pengajuan */}
                <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer">
                  <CardContent className="p-8 text-center" onClick={navigateToHistory}>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl mx-auto mb-6 w-fit group-hover:shadow-2xl"
                    >
                      <History className="h-12 w-12 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Riwayat Pengajuan</h3>
                    <div className="flex items-center justify-center space-x-2 text-green-600 group-hover:text-emerald-600 transition-colors">
                      <Target className="h-4 w-4" />
                      <span className="font-medium">Lihat Riwayat</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Review Role Cards */}
            {user?.role === "review" && (
              <>
                {/* Review */}
                <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer">
                  <CardContent className="p-8 text-center" onClick={navigateToadmin}>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl mx-auto mb-6 w-fit group-hover:shadow-2xl"
                    >
                      <Eye className="h-12 w-12 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Review Konten</h3>
                    <div className="flex items-center justify-center space-x-2 text-green-600 group-hover:text-emerald-600 transition-colors">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Mulai Review</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Riwayat */}
                <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer">
                  <CardContent className="p-8 text-center" onClick={navigateToHistory}>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl mx-auto mb-6 w-fit group-hover:shadow-2xl"
                    >
                      <History className="h-12 w-12 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Riwayat</h3>
                    <div className="flex items-center justify-center space-x-2 text-blue-600 group-hover:text-indigo-600 transition-colors">
                      <Target className="h-4 w-4" />
                      <span className="font-medium">Lihat Riwayat</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Validasi Role Cards */}
            {user?.role === "validasi" && (
              <>
                {/* Validasi */}
                <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer">
                  <CardContent className="p-8 text-center" onClick={navigateToadmin}>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="p-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl mx-auto mb-6 w-fit group-hover:shadow-2xl"
                    >
                      <Shield className="h-12 w-12 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Validasi Konten</h3>
                    <div className="flex items-center justify-center space-x-2 text-orange-600 group-hover:text-red-600 transition-colors">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Mulai Validasi</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Riwayat */}
                <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer">
                  <CardContent className="p-8 text-center" onClick={navigateToHistory}>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl mx-auto mb-6 w-fit group-hover:shadow-2xl"
                    >
                      <History className="h-12 w-12 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Riwayat</h3>
                    <div className="flex items-center justify-center space-x-2 text-blue-600 group-hover:text-indigo-600 transition-colors">
                      <Target className="h-4 w-4" />
                      <span className="font-medium">Lihat Riwayat</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Rekap Role Cards */}
            {user?.role === "rekap" && (
              <>
                {/* Rekap */}
                <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer">
                  <CardContent className="p-8 text-center" onClick={navigateToadmin}>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl mx-auto mb-6 w-fit group-hover:shadow-2xl"
                    >
                      <BarChart3 className="h-12 w-12 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Rekap Data</h3>
                    <div className="flex items-center justify-center space-x-2 text-indigo-600 group-hover:text-purple-600 transition-colors">
                      <BarChart3 className="h-4 w-4" />
                      <span className="font-medium">Lihat Rekap</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Riwayat */}
                <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer">
                  <CardContent className="p-8 text-center" onClick={navigateToHistory}>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl mx-auto mb-6 w-fit group-hover:shadow-2xl"
                    >
                      <History className="h-12 w-12 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Riwayat</h3>
                    <div className="flex items-center justify-center space-x-2 text-blue-600 group-hover:text-indigo-600 transition-colors">
                      <Target className="h-4 w-4" />
                      <span className="font-medium">Lihat Riwayat</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </motion.div>
        </main>
      </div>
    </RoleGuard>
  )
}
