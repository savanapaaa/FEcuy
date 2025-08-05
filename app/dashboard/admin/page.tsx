"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  CheckCircle,
  Clock,
  Eye,
  Shield,
  BarChart3,
  UserCheck,
  FileCheck,
  TrendingUp,
  Activity,
  Globe,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Calendar,
  Target,
  ArrowLeft,
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/hooks/use-auth"
import { EnhancedLoadingSpinner } from "@/components/enhanced-loading-spinner"
import { RoleGuard } from "@/components/auth/role-guard"

interface DashboardStats {
  totalSubmissions: number
  pendingReview: number
  pendingValidation: number
  completed: number
  totalContent: number
  approvedContent: number
  rejectedContent: number
  publishedContent: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const isMobile = useMobile()
  const { user, isLoading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalSubmissions: 0,
    pendingReview: 0,
    pendingValidation: 0,
    completed: 0,
    totalContent: 0,
    approvedContent: 0,
    rejectedContent: 0,
    publishedContent: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Load statistics from localStorage
  const loadStats = () => {
    try {
      const savedSubmissions = localStorage.getItem("submissions")
      if (savedSubmissions) {
        const submissions = JSON.parse(savedSubmissions)

        const totalSubmissions = submissions.length
        const pendingReview = submissions.filter((s: any) => !s.tanggalReview && !s.isOutputValidated).length
        const pendingValidation = submissions.filter((s: any) => s.tanggalReview && !s.isOutputValidated).length
        const completed = submissions.filter((s: any) => s.tanggalReview && s.isOutputValidated).length

        const allContent = submissions.flatMap((s: any) => s.contentItems || [])
        const totalContent = allContent.length
        const approvedContent = allContent.filter((c: any) => c.status === "approved").length
        const rejectedContent = allContent.filter((c: any) => c.status === "rejected").length
        const publishedContent = allContent.filter((c: any) => c.isTayang === true).length

        setStats({
          totalSubmissions,
          pendingReview,
          pendingValidation,
          completed,
          totalContent,
          approvedContent,
          rejectedContent,
          publishedContent,
        })
      }
    } catch (error) {
      console.error("Error loading stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      loadStats()
    }
  }, [authLoading])

  const refreshStats = () => {
    setIsLoading(true)
    setTimeout(() => {
      loadStats()
    }, 500)
  }

  const handleBack = () => {
    router.back()
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-green-50 flex items-center justify-center">
        <EnhancedLoadingSpinner size="lg" text="Memuat dashboard..." />
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={["superadmin", "review", "validasi", "rekap"]}>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-green-50">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-50"
        >
          <div className={`mx-auto px-4 py-4 ${isMobile ? "max-w-full" : "max-w-4xl"}`}>
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-3 flex-1"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(isMobile ? "/mobile" : "/desktop")}
                  className="text-green-600 hover:bg-green-50 p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg w-10 h-10"
                >
                  <BarChart3 className="text-white h-5 w-5" />
                </motion.div>
                <div>
                  <h1 className="font-bold text-green-900 text-xl">Dashboard Admin</h1>
                  <p className="text-green-600 text-sm">Selamat datang, {user?.name || "Admin"}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshStats}
                  disabled={isLoading}
                  className="border-green-200 text-green-600 hover:bg-green-50 bg-transparent text-sm"
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                  Refresh Data
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <div className={`space-y-6 pb-20 ${isMobile ? "px-4 py-4" : "max-w-4xl mx-auto px-4 py-6"}`}>
          {/* Quick Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="font-semibold text-gray-900 mb-4 text-lg">Ringkasan Statistik</h2>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Total Dokumen",
                  value: stats.totalSubmissions,
                  icon: FileText,
                  color: "from-green-500 to-green-600",
                  bgColor: "from-green-50 to-green-100",
                  change: "+12%",
                  trend: "up",
                },
                {
                  title: "Menunggu Review",
                  value: stats.pendingReview,
                  icon: Clock,
                  color: "from-orange-500 to-orange-600",
                  bgColor: "from-orange-50 to-orange-100",
                  change: "+8%",
                  trend: "up",
                },
                {
                  title: "Menunggu Validasi",
                  value: stats.pendingValidation,
                  icon: Shield,
                  color: "from-blue-500 to-blue-600",
                  bgColor: "from-blue-50 to-blue-100",
                  change: "-5%",
                  trend: "down",
                },
                {
                  title: "Selesai",
                  value: stats.completed,
                  icon: CheckCircle,
                  color: "from-purple-500 to-purple-600",
                  bgColor: "from-purple-50 to-purple-100",
                  change: "+15%",
                  trend: "up",
                },
              ].map((card, index) => {
                const Icon = card.icon
                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={cn(
                        "bg-gradient-to-br border-0 shadow-md hover:shadow-lg transition-all duration-300",
                        card.bgColor,
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={cn(
                              "rounded-xl flex items-center justify-center bg-gradient-to-r shadow-lg w-10 h-10",
                              card.color,
                            )}
                          >
                            <Icon className="text-white h-5 w-5" />
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-800 text-xl">{isLoading ? "..." : card.value}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-700 text-sm">{card.title}</p>
                          <div className="flex items-center space-x-1">
                            <TrendingUp
                              className={cn(
                                "h-3 w-3",
                                card.trend === "up" ? "text-green-500" : "text-red-500 rotate-180",
                              )}
                            />
                            <span
                              className={cn(
                                "text-xs font-semibold",
                                card.trend === "up" ? "text-green-600" : "text-red-600",
                              )}
                            >
                              {card.change}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Content Statistics */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="font-semibold text-gray-900 mb-4 text-lg">Statistik Konten</h2>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Total Konten",
                  value: stats.totalContent,
                  icon: FileText,
                  color: "from-gray-500 to-gray-600",
                  bgColor: "from-gray-50 to-gray-100",
                },
                {
                  title: "Disetujui",
                  value: stats.approvedContent,
                  icon: CheckCircle,
                  color: "from-green-500 to-green-600",
                  bgColor: "from-green-50 to-green-100",
                },
                {
                  title: "Ditolak",
                  value: stats.rejectedContent,
                  icon: AlertTriangle,
                  color: "from-red-500 to-red-600",
                  bgColor: "from-red-50 to-red-100",
                },
                {
                  title: "Tayang",
                  value: stats.publishedContent,
                  icon: Globe,
                  color: "from-blue-500 to-blue-600",
                  bgColor: "from-blue-50 to-blue-100",
                },
              ].map((card, index) => {
                const Icon = card.icon
                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={cn(
                        "bg-gradient-to-br border-0 shadow-md hover:shadow-lg transition-all duration-300",
                        card.bgColor,
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={cn(
                              "rounded-xl flex items-center justify-center bg-gradient-to-r shadow-lg w-10 h-10",
                              card.color,
                            )}
                          >
                            <Icon className="text-white h-5 w-5" />
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-800 text-xl">{isLoading ? "..." : card.value}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-700 text-sm">{card.title}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <h2 className="font-semibold text-gray-900 mb-4 text-lg">Aksi Cepat</h2>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
              {/* Review Content */}
              {(user?.role === "superadmin" || user?.role === "review") && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => router.push("/dashboard/admin/review")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                          <Eye className="text-white h-5 w-5" />
                        </div>
                        <div className="text-right">
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                            {stats.pendingReview} pending
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-blue-900 text-base">Review Konten</h3>
                        <p className="text-blue-700 text-sm">Tinjau dan setujui konten yang masuk</p>
                        <div className="flex items-center text-blue-600 font-medium text-sm">
                          <span>Mulai Review</span>
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Validate Output */}
              {(user?.role === "superadmin" || user?.role === "validasi") && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => router.push("/dashboard/admin/validasi")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                          <Shield className="text-white h-5 w-5" />
                        </div>
                        <div className="text-right">
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                            {stats.pendingValidation} pending
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-purple-900 text-base">Validasi Output</h3>
                        <p className="text-purple-700 text-sm">Validasi hasil produksi konten</p>
                        <div className="flex items-center text-purple-600 font-medium text-sm">
                          <span>Mulai Validasi</span>
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* View Reports */}
              {(user?.role === "superadmin" || user?.role === "rekap") && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => router.push("/dashboard/admin/rekap")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                          <BarChart3 className="text-white h-5 w-5" />
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Laporan
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-green-900 text-base">Rekap Data</h3>
                        <p className="text-green-700 text-sm">Lihat laporan dan statistik lengkap</p>
                        <div className="flex items-center text-green-600 font-medium text-sm">
                          <span>Lihat Rekap</span>
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
            <Card className="bg-white/80 backdrop-blur-sm border-green-200/50 shadow-lg">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Activity className="text-green-600 h-4 w-4" />
                  <span>Aktivitas Terbaru</span>
                </CardTitle>
                <CardDescription className="text-sm">Ringkasan aktivitas sistem dalam 24 jam terakhir</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileCheck className="text-green-600 h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-green-900 text-sm">
                        {stats.completed} dokumen telah selesai diproses
                      </p>
                      <p className="text-green-600 text-xs">Hari ini</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserCheck className="text-blue-600 h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-blue-900 text-sm">
                        {stats.approvedContent} konten telah disetujui
                      </p>
                      <p className="text-blue-600 text-xs">24 jam terakhir</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Globe className="text-purple-600 h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-purple-900 text-sm">
                        {stats.publishedContent} konten telah tayang
                      </p>
                      <p className="text-purple-600 text-xs">Minggu ini</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* System Status */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
            <Card className="bg-white/80 backdrop-blur-sm border-green-200/50 shadow-lg">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Target className="text-green-600 h-4 w-4" />
                  <span>Status Sistem</span>
                </CardTitle>
                <CardDescription className="text-sm">Informasi kesehatan dan performa sistem</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 w-10 h-10">
                      <CheckCircle className="text-green-600 h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-green-900 text-sm">Sistem Normal</h4>
                    <p className="text-green-600 text-xs">Semua layanan berjalan lancar</p>
                  </div>

                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 w-10 h-10">
                      <Calendar className="text-blue-600 h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-blue-900 text-sm">Backup Terjadwal</h4>
                    <p className="text-blue-600 text-xs">Backup otomatis setiap hari</p>
                  </div>

                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 w-10 h-10">
                      <Sparkles className="text-purple-600 h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-purple-900 text-sm">Performa Optimal</h4>
                    <p className="text-purple-600 text-xs">Response time &lt; 200 ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </RoleGuard>
  )
}
