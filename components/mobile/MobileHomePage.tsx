"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import {
  FileText,
  History,
  Settings,
  Users,
  Bell,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  href: string
}

interface RecentSubmission {
  id: string
  title: string
  status: "pending" | "approved" | "rejected"
  date: string
  type: string
}

const quickActions: QuickAction[] = [
  {
    id: "new-form",
    title: "Buat Pengajuan Baru",
    description: "Ajukan konten baru untuk diproduksi",
    icon: FileText,
    color: "from-blue-500 to-cyan-500",
    href: "/mobile/form",
  },
  {
    id: "history",
    title: "Riwayat Pengajuan",
    description: "Lihat status pengajuan Anda",
    icon: History,
    color: "from-green-500 to-emerald-500",
    href: "/riwayat",
  },
  {
    id: "manage-roles",
    title: "Manage Role",
    description: "Kelola pengguna dan peran",
    icon: Users,
    color: "from-purple-500 to-indigo-500",
    href: "/role-management",
  },
  {
    id: "settings",
    title: "Pengaturan",
    description: "Atur preferensi akun Anda",
    icon: Settings,
    color: "from-orange-500 to-red-500",
    href: "/settings",
  },
]

const recentSubmissions: RecentSubmission[] = [
  {
    id: "1",
    title: "Kampanye Kesehatan Masyarakat",
    status: "approved",
    date: "2024-01-15",
    type: "Video",
  },
  {
    id: "2",
    title: "Promosi UMKM Lokal",
    status: "pending",
    date: "2024-01-14",
    type: "Infografis",
  },
  {
    id: "3",
    title: "Sosialisasi Program Lingkungan",
    status: "rejected",
    date: "2024-01-13",
    type: "Audio",
  },
]

export default function MobileHomePage() {
  const router = useRouter()
  const [notifications] = useState(3)

  const getStatusColor = (status: RecentSubmission["status"]) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: RecentSubmission["status"]) => {
    switch (status) {
      case "approved":
        return CheckCircle
      case "pending":
        return Clock
      case "rejected":
        return AlertCircle
      default:
        return Clock
    }
  }

  const getStatusText = (status: RecentSubmission["status"]) => {
    switch (status) {
      case "approved":
        return "Disetujui"
      case "pending":
        return "Menunggu"
      case "rejected":
        return "Ditolak"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Selamat datang kembali!</p>
            </div>
            <div className="relative">
              <Button variant="ghost" size="sm" className="p-2">
                <Bell className="h-5 w-5 text-gray-600" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {notifications}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                    <p className="text-xs text-gray-600">Total Pengajuan</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                    <p className="text-xs text-gray-600">Disetujui</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                    <p className="text-xs text-gray-600">Menunggu</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">85%</p>
                    <p className="text-xs text-gray-600">Tingkat Approval</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Aksi Cepat</h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card
                  className="bg-white/80 backdrop-blur-sm shadow-lg border-0 cursor-pointer hover:shadow-xl transition-all duration-300"
                  onClick={() => router.push(action.href)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color}`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Pengajuan Terbaru</h2>
            <Button variant="ghost" size="sm" onClick={() => router.push("/riwayat")} className="text-blue-600">
              Lihat Semua
            </Button>
          </div>

          <div className="space-y-3">
            {recentSubmissions.map((submission, index) => {
              const StatusIcon = getStatusIcon(submission.status)
              return (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{submission.title}</h3>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {submission.type}
                            </Badge>
                            <span className="text-xs text-gray-500">{submission.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="h-4 w-4 text-gray-400" />
                          <Badge className={getStatusColor(submission.status)}>
                            {getStatusText(submission.status)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Quick Create Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="fixed bottom-6 right-6"
        >
          <Button
            onClick={() => router.push("/mobile/form")}
            className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="h-6 w-6 text-white" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
