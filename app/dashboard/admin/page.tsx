"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  BarChart3,
  Eye,
  Shield,
  Database,
  ArrowRight,
  RefreshCw,
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/hooks/use-auth"
import { RoleGuard } from "@/components/auth/role-guard"

// Types
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

  useEffect(() => {
    if (!authLoading) {
      // Load statistics logic
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
      loadStats()
    }
  }, [authLoading])

  const refreshStats = () => {
    setIsLoading(true)
    setTimeout(() => {
      // Refresh logic
      setIsLoading(false)
    }, 500)
  }

  const handleBack = () => {
    router.push(isMobile ? "/mobile" : "/desktop")
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-indigo-700">Memverifikasi akses...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <RoleGuard allowedRoles={["superadmin", "review", "validasi", "rekap"]}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
          {/* Header */}
          <motion.header
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative z-10 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0"
          >
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex items-center justify-between">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-4"
                >
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                  >
                    <Shield className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Admin Dashboard
                    </h1>
                    <p className="text-gray-600">Selamat datang, {user?.name || "Administrator"}</p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center space-x-3"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshStats}
                    className="hover:bg-green-50 hover:border-green-200 transition-all duration-300"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                    className="hover:bg-blue-50 hover:border-blue-200 transition-all duration-300"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Kembali
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.header>

          {/* Main Content */}
          <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8">
            {/* Overview Statistics */}
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-6 w-6 text-indigo-600" />
                    <span>Overview Statistik</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                      <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-900">{stats.totalSubmissions}</p>
                      <p className="text-sm text-blue-700">Total Pengajuan</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-900">{stats.approvedContent}</p>
                      <p className="text-sm text-green-700">Konten Disetujui</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                      <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-900">{stats.publishedContent}</p>
                      <p className="text-sm text-purple-700">Konten Tayang</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                      <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-orange-900">{stats.completed}</p>
                      <p className="text-sm text-orange-700">Selesai</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Content Analysis */}
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-6 w-6 text-green-600" />
                    <span>Analisis Konten</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-800">Status Konten</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Disetujui</span>
                          <span className="text-sm font-medium">{stats.approvedContent}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                            style={{
                              width: `${stats.totalContent > 0 ? (stats.approvedContent / stats.totalContent) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Ditolak</span>
                          <span className="text-sm font-medium">{stats.rejectedContent}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                            style={{
                              width: `${stats.totalContent > 0 ? (stats.rejectedContent / stats.totalContent) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl">
                        <TrendingUp className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                        <p className="text-xl font-bold text-indigo-900">{stats.totalContent}</p>
                        <p className="text-xs text-indigo-700">Total Konten</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
                        <Shield className="h-6 w-6 text-pink-600 mx-auto mb-2" />
                        <p className="text-xl font-bold text-pink-900">{stats.pendingValidation}</p>
                        <p className="text-xs text-pink-700">Menunggu Validasi</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Workflow Management */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Render cards based on user role */}
              {user?.role === "superadmin" && (
                <>
                  {/* Review Content */}
                  <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                    <Card
                      className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                      onClick={() => router.push("/dashboard/admin/review")}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-3 bg-blue-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                              <Eye className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-blue-900">Review Konten</CardTitle>
                              <p className="text-sm text-blue-700">Tinjau pengajuan masuk</p>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Pending Review</span>
                            <span className="text-sm font-medium">{stats.pendingReview}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  {/* Validation Content */}
                  <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                    <Card
                      className="border-0 shadow-xl bg-gradient-to-br from-pink-50 to-pink-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                      onClick={() => router.push("/dashboard/admin/validasi")}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-3 bg-pink-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                              <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-pink-900">Validasi Konten</CardTitle>
                              <p className="text-sm text-pink-700">Validasi pengajuan masuk</p>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-pink-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Pending Validation</span>
                            <span className="text-sm font-medium">{stats.pendingValidation}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  {/* Recap Content */}
                  <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                    <Card
                      className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                      onClick={() => router.push("/dashboard/admin/rekap")}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-3 bg-green-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                              <Database className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-green-900">Rekap Konten</CardTitle>
                              <p className="text-sm text-green-700">Rekap pengajuan masuk</p>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Completed</span>
                            <span className="text-sm font-medium">{stats.completed}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </>
              )}
              {user?.role === "review" && (
                <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                  {/* Review Content */}
                  <Card
                    className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                    onClick={() => router.push("/dashboard/admin/review")}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-blue-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                            <Eye className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-blue-900">Review Konten</CardTitle>
                            <p className="text-sm text-blue-700">Tinjau pengajuan masuk</p>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Pending Review</span>
                          <span className="text-sm font-medium">{stats.pendingReview}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              {user?.role === "validasi" && (
                <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                  {/* Validation Content */}
                  <Card
                    className="border-0 shadow-xl bg-gradient-to-br from-pink-50 to-pink-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                    onClick={() => router.push("/dashboard/admin/validasi")}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-pink-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                            <Shield className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-pink-900">Validasi Konten</CardTitle>
                            <p className="text-sm text-pink-700">Validasi pengajuan masuk</p>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-pink-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Pending Validation</span>
                          <span className="text-sm font-medium">{stats.pendingValidation}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              {user?.role === "rekap" && (
                <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                  {/* Recap Content */}
                  <Card
                    className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                    onClick={() => router.push("/dashboard/admin/rekap")}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-green-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                            <Database className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-green-900">Rekap Konten</CardTitle>
                            <p className="text-sm text-green-700">Rekap pengajuan masuk</p>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Completed</span>
                          <span className="text-sm font-medium">{stats.completed}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </main>
        </div>
      </RoleGuard>
    </>
  )
}
