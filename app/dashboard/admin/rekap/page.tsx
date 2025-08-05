"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getReviews } from "@/lib/api-client"
import { RekapDetailDialog } from "@/components/rekap-detail-dialog"
import { MobileRekapDetailDialog } from "@/components/mobile-rekap-detail-dialog"
import { useMobile } from "@/hooks/use-mobile"
import {
  BarChart3,
  Calendar,
  User,
  Download,
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  FileText,
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface RekapItem {
  id: string
  noComtab: string
  tema: string
  judul: string
  submittedBy: string
  submittedAt: string
  status: "pending" | "approved" | "rejected" | "validated" | "published"
  priority: "low" | "medium" | "high"
  contentItems: any[]
  reviewNotes?: string
  validationNotes?: string
  publishDate?: string
  publishedContent?: any[]
}

export default function RekapPage() {
  const { toast } = useToast()
  const isMobile = useMobile()
  const [rekapItems, setRekapItems] = useState<RekapItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [selectedRekap, setSelectedRekap] = useState<RekapItem | null>(null)
  const [isRekapDialogOpen, setIsRekapDialogOpen] = useState(false)

  // Load rekap data on component mount
  useEffect(() => {
    loadRekapData()
  }, [])

  const loadRekapData = async () => {
    try {
      setLoading(true)
      const response = await getReviews()
      setRekapItems(response.data || [])
    } catch (error) {
      console.error("Error loading rekap data:", error)
      toast({
        title: "Error",
        description: "Failed to load recap data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const openRekapDialog = (rekap: RekapItem) => {
    setSelectedRekap(rekap)
    setIsRekapDialogOpen(true)
  }

  const exportData = () => {
    try {
      const dataToExport = filteredRekapItems.map((item) => ({
        "No COMTAB": item.noComtab,
        Tema: item.tema,
        Judul: item.judul,
        "Submitted By": item.submittedBy,
        "Submitted Date": new Date(item.submittedAt).toLocaleDateString(),
        Status: item.status,
        Priority: item.priority,
        "Content Items": item.contentItems.length,
        "Publish Date": item.publishDate ? new Date(item.publishDate).toLocaleDateString() : "-",
      }))

      const csvContent = [
        Object.keys(dataToExport[0]).join(","),
        ...dataToExport.map((row) => Object.values(row).join(",")),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `rekap-data-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Data exported successfully.",
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Error",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Filter rekap items based on search and filters
  const filteredRekapItems = rekapItems.filter((item) => {
    const matchesSearch =
      item.noComtab.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.submittedBy.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || item.status === statusFilter

    let matchesDate = true
    if (dateFilter !== "all") {
      const itemDate = new Date(item.submittedAt)
      const now = new Date()

      switch (dateFilter) {
        case "today":
          matchesDate = itemDate.toDateString() === now.toDateString()
          break
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDate = itemDate >= weekAgo
          break
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesDate = itemDate >= monthAgo
          break
      }
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200"
      case "validated":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "approved":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <Upload className="h-3 w-3" />
      case "validated":
        return <CheckCircle className="h-3 w-3" />
      case "approved":
        return <CheckCircle className="h-3 w-3" />
      case "rejected":
        return <XCircle className="h-3 w-3" />
      case "pending":
        return <Clock className="h-3 w-3" />
      default:
        return <FileText className="h-3 w-3" />
    }
  }

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending Review"
      case "approved":
        return "Approved"
      case "rejected":
        return "Rejected"
      case "validated":
        return "Validated"
      case "published":
        return "Published"
      default:
        return status
    }
  }

  // Calculate statistics
  const stats = {
    total: rekapItems.length,
    pending: rekapItems.filter((item) => item.status === "pending").length,
    approved: rekapItems.filter((item) => item.status === "approved").length,
    published: rekapItems.filter((item) => item.status === "published").length,
    rejected: rekapItems.filter((item) => item.status === "rejected").length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Loading recap data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span>Data Recap</span>
            </h1>
            <p className="text-gray-600 mt-1">Comprehensive overview of all submissions</p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={loadRekapData}
              variant="outline"
              size="sm"
              className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            <Button
              onClick={exportData}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={filteredRekapItems.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-5 gap-4"
        >
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Upload className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search submissions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="w-full lg:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="validated">Validated</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Filter */}
                <div className="w-full lg:w-48">
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rekap Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Submissions ({filteredRekapItems.length})</span>
                {filteredRekapItems.length !== rekapItems.length && (
                  <Badge variant="secondary" className="text-xs">
                    Filtered from {rekapItems.length} total
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredRekapItems.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No data found</p>
                  <p className="text-gray-400 text-sm">
                    {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                      ? "Try adjusting your filters"
                      : "No submissions available"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Content</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Submitted By</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Items</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Submitted</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Published</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRekapItems.map((item, index) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{item.judul}</p>
                              <p className="text-sm text-gray-500">{item.tema}</p>
                              <p className="text-xs text-gray-400">#{item.noComtab}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{item.submittedBy}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={cn("text-xs", getStatusBadgeColor(item.status))}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(item.status)}
                                <span>{getStatusDisplayName(item.status)}</span>
                              </div>
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="secondary" className="text-xs">
                              {item.contentItems.length} items
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {item.publishDate ? (
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span>{new Date(item.publishDate).toLocaleDateString()}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openRekapDialog(item)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Rekap Detail Dialog */}
      {selectedRekap && (
        <>
          {isMobile ? (
            <MobileRekapDetailDialog
              isOpen={isRekapDialogOpen}
              onClose={() => {
                setIsRekapDialogOpen(false)
                setSelectedRekap(null)
              }}
              submission={selectedRekap}
            />
          ) : (
            <RekapDetailDialog
              isOpen={isRekapDialogOpen}
              onClose={() => {
                setIsRekapDialogOpen(false)
                setSelectedRekap(null)
              }}
              submission={selectedRekap}
            />
          )}
        </>
      )}
    </div>
  )
}
