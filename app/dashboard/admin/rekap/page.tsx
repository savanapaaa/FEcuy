"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { FileText, Search, Filter, User, Clock, CheckCircle, AlertTriangle, Eye, Shield, RefreshCw, ArrowLeft, Download, BarChart3, TrendingUp, Activity, Globe, ChevronDown, ChevronUp, X, Users, Layers, FileSpreadsheet, FileDown, Sparkles, XCircle, CalendarDays, Briefcase } from 'lucide-react'
import { RekapDetailDialog } from "@/components/rekap-detail-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { Separator } from "@/components/ui/separator"

interface FileData {
  name: string
  size: number
  type: string
  lastModified: number
  base64?: string
  url?: string
}

interface ContentItem {
  id: string
  nama: string
  jenisKonten: string
  tema?: string
  mediaPemerintah: string[]
  mediaMassa: string[]
  nomorSurat: string
  narasiText: string
  tanggalOrderMasuk: Date | string | undefined
  tanggalJadi: Date | string | undefined
  tanggalTayang: Date | string | undefined
  keterangan: string
  status?: "pending" | "approved" | "rejected"
  alasanPenolakan?: string
  tanggalDiproses?: Date | string | undefined
  diprosesoleh?: string
  hasilProdukFile?: FileData | string
  hasilProdukLink?: string
  isTayang?: boolean
  tanggalValidasiTayang?: Date | string | undefined
  validatorTayang?: string
  keteranganValidasi?: string
  alasanTidakTayang?: string
  isConfirmed?: boolean
  tanggalKonfirmasi?: Date | string | undefined
}

interface Submission {
  id: number
  noComtab: string
  pin: string
  judul: string
  jenisMedia: string
  tanggalOrder: Date | string | undefined
  petugasPelaksana: string
  supervisor: string
  durasi: string
  jumlahProduksi: string
  tanggalSubmit: Date | string | undefined
  lastModified?: Date | string | undefined
  uploadedBuktiMengetahui?: FileData | string
  isOutputValidated?: boolean
  tanggalValidasiOutput?: Date | string | undefined
  contentItems?: ContentItem[]
  dokumenPendukung?: (FileData | string)[]
  suratPermohonan?: FileData | string
  proposalKegiatan?: FileData | string
  tanggalReview?: string
  tema?: string
  narasiFile?: FileData | string
  suratFile?: FileData | string
  audioDubbingFile?: FileData | string
  audioBacksoundFile?: FileData | string
  pendukungVideoFile?: FileData | string
  pendukungFotoFile?: FileData | string
  pendukungLainLainFile?: FileData | string
  workflowStage?: "submitted" | "review" | "validation" | "completed"
}

interface FilterState {
  search: string
  status: string
  period: string
  staff: string
  supervisor: string
  contentType: string
  mediaType: string
  priority: string
}

export default function RekapPage() {
  const router = useRouter()
  const isMobile = useMobile()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showStats, setShowStats] = useState(true)
  const [toast, setToast] = useState<{
    message: string
    type: "success" | "error" | "info"
    isVisible: boolean
  }>({
    message: "",
    type: "info",
    isVisible: false,
  })

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    period: "all",
    staff: "all",
    supervisor: "all",
    contentType: "all",
    mediaType: "all",
    priority: "all",
  })

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type, isVisible: true })
    setTimeout(() => setToast((prev) => ({ ...prev, isVisible: false })), 3000)
  }

  // Load submissions from localStorage - show ALL completed submissions
  const loadSubmissions = () => {
    try {
      const savedSubmissions = localStorage.getItem("submissions")
      if (savedSubmissions) {
        const parsedSubmissions: Submission[] = JSON.parse(savedSubmissions)

        // Show all submissions that have been completed (validated)
        // This includes submissions that have workflowStage as "completed"
        const completedSubmissions = parsedSubmissions.filter((sub: Submission) => {
          // Show submissions that have been validated (completed workflow)
          return sub.workflowStage === "completed" && sub.isOutputValidated
        })

        setSubmissions(completedSubmissions)
        setFilteredSubmissions(completedSubmissions)
      }
    } catch (error) {
      console.error("Error loading submissions:", error)
      showToast("Gagal memuat data submissions", "error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSubmissions()
  }, [])

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "Belum diisi"

    try {
      let dateObj: Date

      if (typeof date === "string") {
        dateObj = new Date(date)
      } else if (date instanceof Date) {
        dateObj = date
      } else {
        return "Tanggal tidak valid"
      }

      if (isNaN(dateObj.getTime())) {
        return "Tanggal tidak valid"
      }

      return dateObj.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Tanggal tidak valid"
    }
  }

  // Filter submissions
  useEffect(() => {
    let filtered = submissions

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(
        (submission) =>
          submission.noComtab.toLowerCase().includes(filters.search.toLowerCase()) ||
          submission.judul.toLowerCase().includes(filters.search.toLowerCase()) ||
          submission.petugasPelaksana.toLowerCase().includes(filters.search.toLowerCase()) ||
          submission.supervisor.toLowerCase().includes(filters.search.toLowerCase()),
      )
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((submission) => {
        switch (filters.status) {
          case "pending":
            return !submission.tanggalReview && !submission.isOutputValidated
          case "review":
            return submission.tanggalReview && !submission.isOutputValidated
          case "validated":
            return submission.isOutputValidated && !submission.tanggalReview
          case "completed":
            return submission.tanggalReview && submission.isOutputValidated
          default:
            return true
        }
      })
    }

    // Period filter
    if (filters.period !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (filters.period) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
        case "quarter":
          filterDate.setMonth(now.getMonth() - 3)
          break
        default:
          filterDate.setFullYear(1970)
      }

      filtered = filtered.filter((submission) => {
        const submitDate = submission.tanggalSubmit ? new Date(submission.tanggalSubmit) : new Date(0)
        return submitDate >= filterDate
      })
    }

    // Staff filter
    if (filters.staff !== "all") {
      filtered = filtered.filter((submission) => submission.petugasPelaksana === filters.staff)
    }

    // Supervisor filter
    if (filters.supervisor !== "all") {
      filtered = filtered.filter((submission) => submission.supervisor === filters.supervisor)
    }

    // Content type filter
    if (filters.contentType !== "all") {
      filtered = filtered.filter((submission) =>
        submission.contentItems?.some((item) =>
          item.jenisKonten.toLowerCase().includes(filters.contentType.toLowerCase()),
        ),
      )
    }

    // Media type filter
    if (filters.mediaType !== "all") {
      filtered = filtered.filter((submission) => submission.jenisMedia === filters.mediaType)
    }

    setFilteredSubmissions(filtered)
  }, [submissions, filters])

  const handleViewDetail = (submission: Submission) => {
    setSelectedSubmission(submission)
    setIsDialogOpen(true)
  }

  const getWorkflowStatus = (submission: Submission) => {
    if (submission.tanggalReview && submission.isOutputValidated) {
      return {
        status: "completed",
        label: "Selesai",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
      }
    } else if (submission.isOutputValidated) {
      return {
        status: "validated",
        label: "Tervalidasi",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Shield,
      }
    } else if (submission.tanggalReview) {
      return {
        status: "reviewed",
        label: "Direview",
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: Eye,
      }
    } else {
      return {
        status: "pending",
        label: "Menunggu Review",
        color: "bg-orange-100 text-orange-800 border-orange-200",
        icon: Clock,
      }
    }
  }

  // Get unique values for filter options
  const getUniqueStaff = () => {
    const staff = submissions.map((s) => s.petugasPelaksana).filter(Boolean)
    return [...new Set(staff)].sort()
  }

  const getUniqueSupervisors = () => {
    const supervisors = submissions.map((s) => s.supervisor).filter(Boolean)
    return [...new Set(supervisors)].sort()
  }

  const getUniqueMediaTypes = () => {
    const mediaTypes = submissions.map((s) => s.jenisMedia).filter(Boolean)
    return [...new Set(mediaTypes)].sort()
  }

  const getUniqueContentTypes = () => {
    const contentTypes = submissions.flatMap((s) => s.contentItems?.map((c) => c.jenisKonten) || []).filter(Boolean)
    return [...new Set(contentTypes)].sort()
  }

  // Calculate statistics
  const stats = {
    workflow: {
      total: submissions.length,
      pending: submissions.filter((s) => !s.tanggalReview && !s.isOutputValidated).length,
      review: submissions.filter((s) => s.tanggalReview && !s.isOutputValidated).length,
      validated: submissions.filter((s) => s.isOutputValidated && !s.tanggalReview).length,
      completed: submissions.filter((s) => s.tanggalReview && s.isOutputValidated).length,
    },
    content: {
      total: submissions.reduce((acc, s) => acc + (s.contentItems?.length || 0), 0),
      approved: submissions.reduce(
        (acc, s) => acc + (s.contentItems?.filter((c) => c.status === "approved").length || 0),
        0,
      ),
      rejected: submissions.reduce(
        (acc, s) => acc + (s.contentItems?.filter((c) => c.status === "rejected").length || 0),
        0,
      ),
      published: submissions.reduce(
        (acc, s) => acc + (s.contentItems?.filter((c) => c.isTayang === true).length || 0),
        0,
      ),
    },
  }

  const filteredStats = {
    workflow: {
      total: filteredSubmissions.length,
      pending: filteredSubmissions.filter((s) => !s.tanggalReview && !s.isOutputValidated).length,
      review: filteredSubmissions.filter((s) => s.tanggalReview && !s.isOutputValidated).length,
      validated: filteredSubmissions.filter((s) => s.isOutputValidated && !s.tanggalReview).length,
      completed: filteredSubmissions.filter((s) => s.tanggalReview && s.isOutputValidated).length,
    },
    content: {
      total: filteredSubmissions.reduce((acc, s) => acc + (s.contentItems?.length || 0), 0),
      approved: filteredSubmissions.reduce(
        (acc, s) => acc + (s.contentItems?.filter((c) => c.status === "approved").length || 0),
        0,
      ),
      rejected: filteredSubmissions.reduce(
        (acc, s) => acc + (s.contentItems?.filter((c) => c.status === "rejected").length || 0),
        0,
      ),
      published: filteredSubmissions.reduce(
        (acc, s) => acc + (s.contentItems?.filter((c) => c.isTayang === true).length || 0),
        0,
      ),
    },
  }

  const handleExportCSV = () => {
    try {
      const exportData: any[] = []

      filteredSubmissions.forEach((submission) => {
        const contentItems = submission.contentItems || []

        if (contentItems.length === 0) {
          exportData.push({
            "No Comtab": submission.noComtab,
            PIN: submission.pin,
            Tema: submission.tema || "",
            Judul: submission.judul,
            "Petugas Pelaksana": submission.petugasPelaksana,
            Supervisor: submission.supervisor,
            "Jenis Media": submission.jenisMedia,
            Durasi: submission.durasi,
            "Jumlah Produksi": submission.jumlahProduksi,
            "Tanggal Order": formatDate(submission.tanggalOrder),
            "Tanggal Submit": formatDate(submission.tanggalSubmit),
            "Tanggal Review": formatDate(submission.tanggalReview),
            "Tanggal Validasi Output": formatDate(submission.tanggalValidasiOutput),
            "Status Workflow": getWorkflowStatus(submission).label,
            "Bukti Mengetahui": submission.uploadedBuktiMengetahui
              ? typeof submission.uploadedBuktiMengetahui === "string"
                ? submission.uploadedBuktiMengetahui
                : submission.uploadedBuktiMengetahui.name
              : "Tidak ada",
            "Surat Permohonan": submission.suratPermohonan
              ? typeof submission.suratPermohonan === "string"
                ? submission.suratPermohonan
                : submission.suratPermohonan.name
              : "Tidak ada",
            "Proposal Kegiatan": submission.proposalKegiatan
              ? typeof submission.proposalKegiatan === "string"
                ? submission.proposalKegiatan
                : submission.proposalKegiatan.name
              : "Tidak ada",
            "Dokumen Pendukung":
              submission.dokumenPendukung && submission.dokumenPendukung.length > 0
                ? submission.dokumenPendukung.map((doc) => (typeof doc === "string" ? doc : doc.name)).join("; ")
                : "Tidak ada",
          })
        } else {
          // Export each content item as separate row
          contentItems.forEach((item, index) => {
            exportData.push({
              "No Comtab": submission.noComtab,
              PIN: submission.pin,
              Tema: submission.tema || "",
              Judul: submission.judul,
              "Petugas Pelaksana": submission.petugasPelaksana,
              Supervisor: submission.supervisor,
              "Jenis Media": submission.jenisMedia,
              Durasi: submission.durasi,
              "Jumlah Produksi": submission.jumlahProduksi,
              "Tanggal Order": formatDate(submission.tanggalOrder),
              "Tanggal Submit": formatDate(submission.tanggalSubmit),
              "Tanggal Review": formatDate(submission.tanggalReview),
              "Tanggal Validasi Output": formatDate(submission.tanggalValidasiOutput),
              "Status Workflow": getWorkflowStatus(submission).label,
              "Nama Konten": item.nama || "",
              "Jenis Konten": item.jenisKonten || "",
              "Status Konten": item.status || "pending",
              "Media Pemerintah": item.mediaPemerintah ? item.mediaPemerintah.join("; ") : "",
              "Media Massa": item.mediaMassa ? item.mediaMassa.join("; ") : "",
              "Tanggal Order Masuk": formatDate(item.tanggalOrderMasuk),
              "Tanggal Jadi": formatDate(item.tanggalJadi),
              "Tanggal Tayang": formatDate(item.tanggalTayang),
              "Status Tayang": item.isTayang !== undefined ? (item.isTayang ? "Tayang" : "Tidak Tayang") : "",
            })
          })
        }
      })

      const headers = Object.keys(exportData[0] || {})
      const csvContent = [
        headers.join(","),
        ...exportData.map((row) =>
          headers.map((header) => `"${(row[header] || "").toString().replace(/"/g, '""')}"`).join(","),
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `rekap-data-detail-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      showToast("Data detail berhasil diexport ke CSV", "success")
    } catch (error) {
      console.error("Error exporting CSV:", error)
      showToast("Gagal mengexport data ke CSV", "error")
    }
  }

  const handleExportExcel = async () => {
    try {
      let XLSX;
      try {
        // Dynamically import XLSX to avoid SSR issues
        XLSX = await import("xlsx");
      } catch (error) {
        console.error("Error importing XLSX module:", error);
        showToast(
          "Gagal mengexport data ke Excel: Modul XLSX tidak ditemukan. Silakan install dengan 'npm install xlsx'.",
          "error"
        );
        return;
      }

      const exportData: any[] = []

      filteredSubmissions.forEach((submission) => {
        const contentItems = submission.contentItems || []

        if (contentItems.length === 0) {
          // If no content items, export document info only
          exportData.push({
            "No Comtab": submission.noComtab,
            PIN: submission.pin,
            Tema: submission.tema || "",
            Judul: submission.judul,
            "Petugas Pelaksana": submission.petugasPelaksana,
            Supervisor: submission.supervisor,
            "Jenis Media": submission.jenisMedia,
            Durasi: submission.durasi,
            "Jumlah Produksi": submission.jumlahProduksi,
            "Tanggal Order": formatDate(submission.tanggalOrder),
            "Tanggal Submit": formatDate(submission.tanggalSubmit),
            "Tanggal Review": formatDate(submission.tanggalReview),
            "Tanggal Validasi Output": formatDate(submission.tanggalValidasiOutput),
            "Status Workflow": getWorkflowStatus(submission).label,
          })
        } else {
          // Export each content item as separate row
          contentItems.forEach((item, index) => {
            exportData.push({
              "No Comtab": submission.noComtab,
              PIN: submission.pin,
              Tema: submission.tema || "",
              Judul: submission.judul,
              "Petugas Pelaksana": submission.petugasPelaksana,
              Supervisor: submission.supervisor,
              "Jenis Media": submission.jenisMedia,
              Durasi: submission.durasi,
              "Jumlah Produksi": submission.jumlahProduksi,
              "Tanggal Order": formatDate(submission.tanggalOrder),
              "Tanggal Submit": formatDate(submission.tanggalSubmit),
              "Tanggal Review": formatDate(submission.tanggalReview),
              "Tanggal Validasi Output": formatDate(submission.tanggalValidasiOutput),
              "Status Workflow": getWorkflowStatus(submission).label,
              "Nama Konten": item.nama || "",
              "Jenis Konten": item.jenisKonten || "",
              "Status Konten": item.status || "pending",
              "Media Pemerintah": item.mediaPemerintah ? item.mediaPemerintah.join("; ") : "",
              "Media Massa": item.mediaMassa ? item.mediaMassa.join("; ") : "",
              "Tanggal Order Masuk": formatDate(item.tanggalOrderMasuk),
              "Tanggal Jadi": formatDate(item.tanggalJadi),
              "Tanggal Tayang": formatDate(item.tanggalTayang),
              "Status Tayang": item.isTayang !== undefined ? (item.isTayang ? "Tayang" : "Tidak Tayang") : "",
            })
          })
        }
      })

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Data Detail")

      // Convert workbook to binary array
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

      // Create blob and download
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `rekap-data-detail-${new Date().toISOString().split("T")[0]}.xlsx`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      showToast("Data detail berhasil diexport ke Excel", "success")
    } catch (error) {
      console.error("Error exporting Excel:", error)
      showToast("Gagal mengexport data ke Excel", "error")
    }
  }

  const clearFilter = (filterKey: keyof FilterState) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: filterKey === "search" ? "" : "all",
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      search: "",
      status: "all",
      period: "all",
      staff: "all",
      supervisor: "all",
      contentType: "all",
      mediaType: "all",
      priority: "all",
    })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.status !== "all") count++
    if (filters.period !== "all") count++
    if (filters.staff !== "all") count++
    if (filters.supervisor !== "all") count++
    if (filters.contentType !== "all") count++
    if (filters.mediaType !== "all") count++
    if (filters.priority !== "all") count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-green-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
          <span className="text-xl font-semibold text-green-900">Memuat data rekap...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-green-50">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-4"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/admin")}
                className="text-green-600 hover:text-green-700 hover:bg-green-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
              <Separator orientation="vertical" className="h-6 bg-green-300" />
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg"
              >
                <BarChart3 className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-green-900">Rekap Data</h1>
                <p className="text-sm text-green-600">Lihat ringkasan dan laporan data</p>
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
                onClick={() => setShowStats(!showStats)}
                className="border-green-200 text-green-600 hover:bg-green-50"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {showStats ? "Sembunyikan" : "Tampilkan"} Statistik
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-200 text-green-600 hover:bg-green-50 bg-transparent"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => window.location.reload()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportCSV}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportExcel}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Statistics Cards */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              {/* Workflow Statistics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-green-600" />
                  Status Workflow
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      title: "Total Dokumen",
                      value: filteredStats.workflow.total,
                      total: stats.workflow.total,
                      icon: FileText,
                      color: "from-green-500 to-green-600",
                      bgColor: "from-green-50 to-green-100",
                    },
                    {
                      title: "Menunggu Review",
                      value: filteredStats.workflow.pending,
                      total: stats.workflow.pending,
                      icon: Clock,
                      color: "from-orange-500 to-orange-600",
                      bgColor: "from-orange-50 to-orange-100",
                    },
                    {
                      title: "Tervalidasi",
                      value: filteredStats.workflow.validated,
                      total: stats.workflow.validated,
                      icon: Shield,
                      color: "from-blue-500 to-blue-600",
                      bgColor: "from-blue-50 to-blue-100",
                    },
                    {
                      title: "Selesai",
                      value: filteredStats.workflow.completed,
                      total: stats.workflow.completed,
                      icon: CheckCircle,
                      color: "from-purple-500 to-purple-600",
                      bgColor: "from-purple-50 to-purple-100",
                    },
                  ].map((card, index) => {
                    const Icon = card.icon
                    return (
                      <motion.div
                        key={card.title}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={cn(
                            "bg-gradient-to-br border-0 shadow-md hover:shadow-lg transition-all duration-300",
                            card.bgColor,
                          )}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div
                                className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r shadow-lg",
                                  card.color,
                                )}
                              >
                                <Icon className="h-6 w-6 text-white" />
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                                {card.value !== card.total && (
                                  <p className="text-sm text-gray-500">dari {card.total}</p>
                                )}
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-gray-700">{card.title}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Content Statistics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Layers className="h-5 w-5 mr-2 text-green-600" />
                  Status Konten
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      title: "Total Konten",
                      value: filteredStats.content.total,
                      total: stats.content.total,
                      icon: FileText,
                      color: "from-gray-500 to-gray-600",
                      bgColor: "from-gray-50 to-gray-100",
                    },
                    {
                      title: "Disetujui",
                      value: filteredStats.content.approved,
                      total: stats.content.approved,
                      icon: CheckCircle,
                      color: "from-green-500 to-green-600",
                      bgColor: "from-green-50 to-green-100",
                    },
                    {
                      title: "Ditolak",
                      value: filteredStats.content.rejected,
                      total: stats.content.rejected,
                      icon: XCircle,
                      color: "from-red-500 to-red-600",
                      bgColor: "from-red-50 to-red-100",
                    },
                    {
                      title: "Tayang",
                      value: filteredStats.content.published,
                      total: stats.content.published,
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
                        transition={{ delay: index * 0.1 + 0.4 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={cn(
                            "bg-gradient-to-br border-0 shadow-md hover:shadow-lg transition-all duration-300",
                            card.bgColor,
                          )}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div
                                className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r shadow-lg",
                                  card.color,
                                )}
                              >
                                <Icon className="h-6 w-6 text-white" />
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                                {card.value !== card.total && (
                                  <p className="text-sm text-gray-500">dari {card.total}</p>
                                )}
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-gray-700">{card.title}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-green-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Main Search */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari berdasarkan No. Comtab, judul, petugas, atau supervisor..."
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    className="pl-10 pr-4 bg-white border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                  {filters.search && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter("search")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-green-200 text-green-600 hover:bg-green-50 bg-transparent"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Filter Lanjutan
                        {activeFilterCount > 0 && (
                          <Badge className="ml-2 bg-green-600 text-white text-xs px-1.5 py-0.5">
                            {activeFilterCount}
                          </Badge>
                        )}
                        {showAdvancedFilters ? (
                          <ChevronUp className="h-3 w-3 ml-2" />
                        ) : (
                          <ChevronDown className="h-3 w-3 ml-2" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </Collapsible>

                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Hapus Semua
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-auto min-w-[140px] bg-white border-green-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Menunggu Review ({stats.workflow.pending})</SelectItem>
                    <SelectItem value="review">Direview ({stats.workflow.review})</SelectItem>
                    <SelectItem value="validated">Tervalidasi ({stats.workflow.validated})</SelectItem>
                    <SelectItem value="completed">Selesai ({stats.workflow.completed})</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.period}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, period: value }))}
                >
                  <SelectTrigger className="w-auto min-w-[140px] bg-white border-green-200">
                    <SelectValue placeholder="Periode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Periode</SelectItem>
                    <SelectItem value="today">Hari Ini</SelectItem>
                    <SelectItem value="week">7 Hari Terakhir</SelectItem>
                    <SelectItem value="month">30 Hari Terakhir</SelectItem>
                    <SelectItem value="quarter">3 Bulan Terakhir</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Advanced Filters */}
              <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                <CollapsibleContent className="space-y-4">
                  <Separator className="bg-green-200" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Petugas</label>
                      <Select
                        value={filters.staff}
                        onValueChange={(value) => setFilters((prev) => ({ ...prev, staff: value }))}
                      >
                        <SelectTrigger className="bg-white border-green-200">
                          <SelectValue placeholder="Pilih petugas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Petugas</SelectItem>
                          {getUniqueStaff().map((staff) => (
                            <SelectItem key={staff} value={staff}>
                              {staff}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Supervisor</label>
                      <Select
                        value={filters.supervisor}
                        onValueChange={(value) => setFilters((prev) => ({ ...prev, supervisor: value }))}
                      >
                        <SelectTrigger className="bg-white border-green-200">
                          <SelectValue placeholder="Pilih supervisor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Supervisor</SelectItem>
                          {getUniqueSupervisors().map((supervisor) => (
                            <SelectItem key={supervisor} value={supervisor}>
                              {supervisor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Jenis Konten</label>
                      <Select
                        value={filters.contentType}
                        onValueChange={(value) => setFilters((prev) => ({ ...prev, contentType: value }))}
                      >
                        <SelectTrigger className="bg-white border-green-200">
                          <SelectValue placeholder="Pilih jenis konten" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Jenis Konten</SelectItem>
                          {getUniqueContentTypes().map((contentType) => (
                            <SelectItem key={contentType} value={contentType}>
                              {contentType}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Active Filters Display */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-green-200">
                  <span className="text-sm font-medium text-gray-700">Filter aktif:</span>
                  {filters.search && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      Pencarian: "{filters.search}"
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearFilter("search")}
                        className="ml-1 h-3 w-3 p-0 hover:bg-green-200"
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  )}
                  {filters.status !== "all" && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      Status: {filters.status}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearFilter("status")}
                        className="ml-1 h-3 w-3 p-0 hover:bg-green-200"
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  )}
                  {filters.period !== "all" && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      Periode: {filters.period}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearFilter("period")}
                        className="ml-1 h-3 w-3 p-0 hover:bg-green-200"
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  )}
                  {filters.staff !== "all" && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      Petugas: {filters.staff}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearFilter("staff")}
                        className="ml-1 h-3 w-3 p-0 hover:bg-green-200"
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  )}
                  {filters.supervisor !== "all" && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      Supervisor: {filters.supervisor}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearFilter("supervisor")}
                        className="ml-1 h-3 w-3 p-0 hover:bg-green-200"
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  )}
                  {filters.contentType !== "all" && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      Konten: {filters.contentType}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearFilter("contentType")}
                        className="ml-1 h-3 w-3 p-0 hover:bg-green-200"
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Menampilkan <span className="font-semibold text-green-600">{filteredSubmissions.length}</span> dari{" "}
            <span className="font-semibold">{submissions.length}</span> dokumen
          </p>
          {activeFilterCount > 0 && (
            <p className="text-sm text-green-600">
              <Filter className="h-3 w-3 inline mr-1" />
              {activeFilterCount} filter aktif
            </p>
          )}
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <Card className="bg-white/80 backdrop-blur-sm border-green-200/50 shadow-lg">
                <CardContent className="p-12">
                  <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {submissions.length === 0 ? "Belum ada data" : "Tidak ditemukan"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {submissions.length === 0
                      ? "Belum ada dokumen yang selesai diproses untuk ditampilkan."
                      : "Tidak ditemukan dokumen yang sesuai dengan kriteria pencarian dan filter."}
                  </p>
                  {activeFilterCount > 0 && (
                    <Button
                      onClick={clearAllFilters}
                      variant="outline"
                      className="border-green-200 text-green-600 hover:bg-green-50 bg-transparent"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Hapus Semua Filter
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredSubmissions.map((submission, index) => {
                const workflowStatus = getWorkflowStatus(submission)
                const contentItems = submission.contentItems || []
                const approvedItems = contentItems.filter((item) => item.status === "approved")
                const rejectedItems = contentItems.filter((item) => item.status === "rejected")
                const publishedItems = contentItems.filter((item) => item.isTayang === true)
                const outputItems = approvedItems.filter((item) => item.hasilProdukFile || item.hasilProdukLink)
                const StatusIcon = workflowStatus.icon

                return (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="p-2 bg-gradient-to-r from-green-100 to-green-200 rounded-xl">
                              <FileText className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg font-bold text-green-900 truncate">
                                {submission.noComtab}
                              </CardTitle>
                              <CardDescription className="text-sm text-gray-600 line-clamp-2">
                                {submission.judul}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                            <Badge className={workflowStatus.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {workflowStatus.label}
                            </Badge>
                            {outputItems.length > 0 && (
                              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                <Sparkles className="h-3 w-3 mr-1" />
                                {outputItems.length} Output
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Content Statistics */}
                        <div className="grid grid-cols-4 gap-3">
                          <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                            <p className="text-lg font-bold text-gray-900">{contentItems.length}</p>
                            <p className="text-xs text-gray-600">Total</p>
                          </div>
                          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                            <p className="text-lg font-bold text-green-600">{approvedItems.length}</p>
                            <p className="text-xs text-green-700">Disetujui</p>
                          </div>
                          <div className="text-center p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                            <p className="text-lg font-bold text-red-600">{rejectedItems.length}</p>
                            <p className="text-xs text-red-700">Ditolak</p>
                          </div>
                          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                            <p className="text-lg font-bold text-blue-600">{publishedItems.length}</p>
                            <p className="text-xs text-blue-700">Tayang</p>
                          </div>
                        </div>

                        {/* Document Information */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <User className="h-4 w-4" />
                              <span>Petugas:</span>
                            </div>
                            <span className="font-medium text-gray-900 truncate max-w-48">
                              {submission.petugasPelaksana}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Users className="h-4 w-4" />
                              <span>Supervisor:</span>
                            </div>
                            <span className="font-medium text-gray-900 truncate max-w-48">{submission.supervisor}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <CalendarDays className="h-4 w-4" />
                              <span>Submit:</span>
                            </div>
                            <span className="font-medium text-gray-900">{formatDate(submission.tanggalSubmit)}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Briefcase className="h-4 w-4" />
                              <span>Media:</span>
                            </div>
                            <Badge variant="outline" className="border-green-200 text-green-700">
                              {submission.jenisMedia}
                            </Badge>
                          </div>
                        </div>

                        {/* Progress Timeline */}
                        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Progress Workflow</span>
                            <span className="text-xs text-gray-500">
                              {submission.tanggalReview && submission.isOutputValidated
                                ? "100%"
                                : submission.isOutputValidated || submission.tanggalReview
                                  ? "66%"
                                  : submission.tanggalSubmit
                                    ? "33%"
                                    : "0%"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-1">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  submission.tanggalSubmit ? "bg-green-500" : "bg-gray-300"
                                }`}
                              />
                              <span className="text-gray-600">Submit</span>
                            </div>
                            <div className="flex-1 h-0.5 bg-gray-200 mx-2">
                              <div
                                className={`h-full bg-green-500 transition-all duration-300 ${
                                  submission.tanggalReview ? "w-full" : "w-0"
                                }`}
                              />
                            </div>
                            <div className="flex items-center space-x-1">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  submission.tanggalReview ? "bg-green-500" : "bg-gray-300"
                                }`}
                              />
                              <span className="text-gray-600">Review</span>
                            </div>
                            <div className="flex-1 h-0.5 bg-gray-200 mx-2">
                              <div
                                className={`h-full bg-green-500 transition-all duration-300 ${
                                  submission.isOutputValidated ? "w-full" : "w-0"
                                }`}
                              />
                            </div>
                            <div className="flex items-center space-x-1">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  submission.isOutputValidated ? "bg-green-500" : "bg-gray-300"
                                }`}
                              />
                              <span className="text-gray-600">Validasi</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-end pt-2">
                          <Button
                            onClick={() => handleViewDetail(submission)}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Lihat Detail
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      {isDialogOpen &&
        (isMobile ? (
          <MobileRekapDetailDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            submission={selectedSubmission}
            onToast={showToast}
          />
        ) : (
          <RekapDetailDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            submission={selectedSubmission}
            onToast={showToast}
          />
        ))}

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Card
              className={cn(
                "shadow-lg border-0",
                toast.type === "success" && "bg-green-50 border-green-200",
                toast.type === "error" && "bg-red-50 border-red-200",
                toast.type === "info" && "bg-blue-50 border-blue-200",
              )}
            >
              <CardContent className="p-4 flex items-center space-x-3">
                {toast.type === "success" && <CheckCircle className="h-5 w-5 text-green-600" />}
                {toast.type === "error" && <XCircle className="h-5 w-5 text-red-600" />}
                {toast.type === "info" && <AlertTriangle className="h-5 w-5 text-blue-600" />}
                <span
                  className={cn(
                    "font-medium",
                    toast.type === "success" && "text-green-800",
                    toast.type === "error" && "text-red-800",
                    toast.type === "info" && "text-blue-800",
                  )}
                >
                  {toast.message}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setToast((prev) => ({ ...prev, isVisible: false }))}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
