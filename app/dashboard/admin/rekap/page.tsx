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
import { MobileRekapDetailDialog } from "@/components/mobile-rekap-detail-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { Separator } from "@/components/ui/separator"
import { getSubmissions } from "@/lib/api-client"

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
  tema: string
}

export default function RekapPage() {
  const router = useRouter()
  const { isMobile, isInitialized } = useMobile()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showStats, setShowStats] = useState(false)
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
    tema: "all",
  })

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type, isVisible: true })
    setTimeout(() => setToast((prev) => ({ ...prev, isVisible: false })), 3000)
  }

  const loadSubmissions = async () => {
    try {
      setIsLoading(true)
      console.log("🔄 Loading completed submissions from server...")
      
      // Get only completed submissions from API
      const response = await getSubmissions({ workflow_stage: 'completed' })
      
      if (response.success && response.data) {
        console.log("✅ Completed submissions loaded from server")

        // Support paginated response formats: either array or { data: [] }
        const raw = response.data as any
        const items: any[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw.data)
          ? raw.data
          : raw.data
          ? [raw.data]
          : []

        // Normalize each item to frontend Submission shape and backend naming variations
        const normalized = items.map((sub: any) => {
          const workflowStage = sub.workflowStage || sub.workflow_stage || sub.status || "completed"

          // Gather content items from various possible field names
          const rawContentItems = sub.content_items || sub.contentItems || []

          // Determine if any content item has been validated
          const hasValidatedContent = Array.isArray(rawContentItems)
            ? rawContentItems.some((ci: any) =>
                ci.validation_status === "validated" || ci.validationStatus === "validated" || !!ci.validated_at || !!ci.validatedAt,
              )
            : false

          let isOutputValidated = false
          if (sub.isOutputValidated !== undefined) {
            isOutputValidated = !!sub.isOutputValidated
          } else if (sub.is_output_validated !== undefined) {
            isOutputValidated = !!sub.is_output_validated
          } else if (sub.validated_at || sub.validatedAt) {
            isOutputValidated = true
          } else if (hasValidatedContent) {
            // If individual content items are validated, consider submission validated
            isOutputValidated = true
          }

          return {
            ...sub,
            id: sub.id !== undefined ? (typeof sub.id === "string" ? parseInt(sub.id, 10) || sub.id : sub.id) : sub.id,
            noComtab: sub.noComtab || sub.comtab_number || sub.comtab || String(sub.id).padStart(4, "0"),
            tanggalSubmit: sub.tanggalSubmit ? new Date(sub.tanggalSubmit) : sub.created_at ? new Date(sub.created_at) : undefined,
            tanggalOrder: sub.tanggalOrder ? new Date(sub.tanggalOrder) : sub.order_date ? new Date(sub.order_date) : undefined,
            lastModified: sub.lastModified ? new Date(sub.lastModified) : sub.updated_at ? new Date(sub.updated_at) : undefined,
            workflowStage: "completed", // Force completed status since we're filtering for completed
            isOutputValidated: true, // All completed submissions should be validated
            // Map content_items to contentItems for UI usage
            contentItems: Array.isArray(rawContentItems)
              ? rawContentItems.map((ci: any) => ({
                  id: ci.id?.toString() || String(ci.id || ""),
                  nama: ci.title || ci.nama || ci.name || `Konten ${ci.id}`,
                  jenisKonten: ci.type || ci.jenisKonten || ci.mime_type || "content",
                  tanggalTayang: ci.publish_date || ci.publishDate || ci.tanggalTayang || undefined,
                  status: ci.review_status || ci.validation_status || ci.status || "approved",
                  isTayang: ci.is_published !== undefined ? !!ci.is_published : !!ci.isPublished,
                  hasilProdukLink: ci.file_url || ci.published_content || ci.hasilProdukLink || null,
                  mediaPemerintah: ci.government_media || ci.mediaPemerintah || [],
                  mediaMassa: ci.mass_media || ci.mediaMassa || [],
                  nomorSurat: ci.letter_number || ci.nomorSurat || "",
                  narasiText: ci.narrative || ci.narasiText || ci.description || "",
                  tanggalOrderMasuk: ci.order_date || ci.tanggalOrderMasuk || undefined,
                  tanggalJadi: ci.completion_date || ci.tanggalJadi || undefined,
                  keterangan: ci.notes || ci.keterangan || ""
                }))
              : [],
          }
        })

        // Set completed submissions data
        const transformedSubmissions = normalized

        setSubmissions(transformedSubmissions)
        setFilteredSubmissions(transformedSubmissions)

        // Update cache
        if (typeof window !== "undefined") {
          localStorage.setItem("rekap_cache", JSON.stringify(transformedSubmissions))
        }

        return
      }
      
      throw new Error("Server response not successful")
      
    } catch (error) {
      console.error("❌ Failed to load completed submissions from server:", error)
      showToast("Gagal memuat data rekap submissions yang sudah selesai", "error")
      
      // Try to load from cache as fallback
      try {
        const savedSubmissions = localStorage.getItem("rekap_cache")
        
        if (savedSubmissions) {
          const parsedSubmissions: Submission[] = JSON.parse(savedSubmissions)
          // Filter for completed submissions only from cache
          const completedSubmissions = parsedSubmissions.filter(sub => 
            sub.workflowStage === "completed"
          )
          
          setSubmissions(completedSubmissions)
          setFilteredSubmissions(completedSubmissions)
          showToast("Data dimuat dari cache (offline)", "info")
        } else {
          // No cache available
          setSubmissions([])
          setFilteredSubmissions([])
          showToast("Tidak ada data rekap yang tersedia", "info")
        }
        
      } catch (cacheError) {
        console.error("❌ Failed to load from cache:", cacheError)
        setSubmissions([])
        setFilteredSubmissions([])
        showToast("Gagal memuat data submissions", "error")
      }
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
        if (filters.status === "validated") return submission.isOutputValidated
        if (filters.status === "not-validated") return !submission.isOutputValidated
        return true
      })
    }

    // Period filter
    if (filters.period !== "all") {
      const now = new Date()
      filtered = filtered.filter((submission) => {
        const submitDate = submission.tanggalSubmit ? new Date(submission.tanggalSubmit) : null
        if (!submitDate) return false

        switch (filters.period) {
          case "today":
            return submitDate.toDateString() === now.toDateString()
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            return submitDate >= weekAgo
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            return submitDate >= monthAgo
          default:
            return true
        }
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
        submission.contentItems?.some((item) => item.jenisKonten === filters.contentType),
      )
    }

    // Media type filter
    if (filters.mediaType !== "all") {
      filtered = filtered.filter((submission) => submission.jenisMedia === filters.mediaType)
    }

    // Tema filter
    if (filters.tema !== "all") {
      filtered = filtered.filter((submission) => submission.tema === filters.tema)
    }

    setFilteredSubmissions(filtered)
  }, [submissions, filters])

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      period: "all",
      staff: "all",
      supervisor: "all",
      contentType: "all",
      mediaType: "all",
      priority: "all",
      tema: "all",
    })
  }

  const exportToCSV = () => {
    const csvData = filteredSubmissions.map((submission) => ({
      "No COMTAB": submission.noComtab,
      "Judul": submission.judul,
      "Jenis Media": submission.jenisMedia,
      "Petugas": submission.petugasPelaksana,
      "Supervisor": submission.supervisor,
      "Tanggal Order": formatDate(submission.tanggalOrder),
      "Tanggal Submit": formatDate(submission.tanggalSubmit),
      "Status Validasi": submission.isOutputValidated ? "Sudah" : "Belum",
      "Tanggal Validasi": formatDate(submission.tanggalValidasiOutput),
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `rekap-submissions-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    showToast("Data berhasil diekspor ke CSV", "success")
  }

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission)
    setIsDialogOpen(true)
  }

  const refreshData = () => {
    loadSubmissions()
    showToast("Data berhasil dimuat ulang", "success")
  }

  const stats = {
    total: filteredSubmissions.length,
    validated: filteredSubmissions.filter((s) => s.isOutputValidated).length,
    notValidated: filteredSubmissions.filter((s) => !s.isOutputValidated).length,
    published: filteredSubmissions.filter((s) => 
      s.contentItems?.some((item) => item.isTayang)
    ).length,
  }

  const getStatusBadge = (submission: Submission) => {
    if (submission.isOutputValidated) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Sudah Divalidasi</Badge>
    }
    return <Badge variant="secondary">Belum Divalidasi</Badge>
  }

  const getMediaIcon = (jenisMedia: string) => {
    switch (jenisMedia?.toLowerCase()) {
      case "video":
        return <Globe className="h-4 w-4" />
      case "audio":
        return <Activity className="h-4 w-4" />
      case "grafis":
      case "foto":
        return <FileSpreadsheet className="h-4 w-4" />
      case "artikel":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (!isInitialized) {
    return <div className="min-h-screen bg-gray-50" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/admin")}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Rekap Submissions</h1>
                <p className="text-sm text-gray-500">Data submissions yang sudah selesai diproses</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={refreshData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <Collapsible open={showStats} onOpenChange={setShowStats}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full mb-6 justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Statistik Rekap</span>
              </div>
              {showStats ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Sudah Divalidasi</p>
                      <p className="text-3xl font-bold text-green-600">{stats.validated}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Belum Divalidasi</p>
                      <p className="text-3xl font-bold text-orange-600">{stats.notValidated}</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Sudah Tayang</p>
                      <p className="text-3xl font-bold text-purple-600">{stats.published}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Globe className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filter Data</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showAdvancedFilters ? "Sembunyikan" : "Tampilkan"} Filter Lanjutan
                </Button>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari berdasarkan COMTAB, judul, petugas..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Status Validasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="validated">Sudah Divalidasi</SelectItem>
                  <SelectItem value="not-validated">Belum Divalidasi</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.period} onValueChange={(value) => setFilters({ ...filters, period: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Periode</SelectItem>
                  <SelectItem value="today">Hari Ini</SelectItem>
                  <SelectItem value="week">7 Hari Terakhir</SelectItem>
                  <SelectItem value="month">30 Hari Terakhir</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
              <CollapsibleContent>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={filters.staff} onValueChange={(value) => setFilters({ ...filters, staff: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Petugas Pelaksana" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Petugas</SelectItem>
                      {Array.from(new Set(submissions.map((s) => s.petugasPelaksana))).map((staff) => (
                        <SelectItem key={staff} value={staff}>
                          {staff}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.supervisor}
                    onValueChange={(value) => setFilters({ ...filters, supervisor: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Supervisor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Supervisor</SelectItem>
                      {Array.from(new Set(submissions.map((s) => s.supervisor))).map((supervisor) => (
                        <SelectItem key={supervisor} value={supervisor}>
                          {supervisor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.mediaType}
                    onValueChange={(value) => setFilters({ ...filters, mediaType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Jenis Media" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Media</SelectItem>
                      {Array.from(new Set(submissions.map((s) => s.jenisMedia))).map((media) => (
                        <SelectItem key={media} value={media}>
                          {media}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Hasil Pencarian ({filteredSubmissions.length} dari {submissions.length} submissions)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Memuat data rekap submissions...</p>
                </div>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data yang ditemukan</h3>
                <p className="text-gray-500 mb-4">Coba ubah filter pencarian atau muat ulang data</p>
                <Button onClick={refreshData} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Muat Ulang Data
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {isMobile ? (
                  // Mobile Card Layout
                  filteredSubmissions.map((submission) => (
                    <motion.div
                      key={submission.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {getMediaIcon(submission.jenisMedia)}
                            <span className="text-sm font-medium text-blue-600">{submission.noComtab}</span>
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{submission.judul}</h3>
                          <p className="text-sm text-gray-600">{submission.jenisMedia}</p>
                        </div>
                        {getStatusBadge(submission)}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                        <div>
                          <span className="text-gray-500">Petugas:</span>
                          <p className="font-medium">{submission.petugasPelaksana}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Supervisor:</span>
                          <p className="font-medium">{submission.supervisor}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Tanggal Order:</span>
                          <p className="font-medium">{formatDate(submission.tanggalOrder)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Tanggal Submit:</span>
                          <p className="font-medium">{formatDate(submission.tanggalSubmit)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{submission.jumlahProduksi}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{submission.durasi}</span>
                          </div>
                          {submission.contentItems && submission.contentItems.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <Layers className="h-4 w-4" />
                              <span>{submission.contentItems.length} konten</span>
                            </div>
                          )}
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleViewSubmission(submission)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Detail
                        </Button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  // Desktop Table Layout
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">COMTAB & Judul</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Media & Petugas</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Tanggal</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSubmissions.map((submission) => (
                          <motion.tr
                            key={submission.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-start space-x-3">
                                {getMediaIcon(submission.jenisMedia)}
                                <div>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-sm font-medium text-blue-600">{submission.noComtab}</span>
                                  </div>
                                  <p className="font-medium text-gray-900 mb-1">{submission.judul}</p>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span>{submission.durasi}</span>
                                    <span>{submission.jumlahProduksi} produksi</span>
                                    {submission.contentItems && submission.contentItems.length > 0 && (
                                      <span>{submission.contentItems.length} konten</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{submission.jenisMedia}</p>
                                <p className="text-sm text-gray-600">{submission.petugasPelaksana}</p>
                                <p className="text-xs text-gray-500">{submission.supervisor}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm">
                                <p className="text-gray-900">Order: {formatDate(submission.tanggalOrder)}</p>
                                <p className="text-gray-600">Submit: {formatDate(submission.tanggalSubmit)}</p>
                                {submission.isOutputValidated && (
                                  <p className="text-green-600">Validasi: {formatDate(submission.tanggalValidasiOutput)}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="space-y-2">
                                {getStatusBadge(submission)}
                                {submission.contentItems?.some((item) => item.isTayang) && (
                                  <div>
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                      <Globe className="h-3 w-3 mr-1" />
                                      Sudah Tayang
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <Button size="sm" variant="outline" onClick={() => handleViewSubmission(submission)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Detail
                              </Button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.5 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div
              className={cn(
                "p-4 rounded-lg shadow-lg border max-w-sm",
                toast.type === "success" && "bg-green-50 border-green-200 text-green-800",
                toast.type === "error" && "bg-red-50 border-red-200 text-red-800",
                toast.type === "info" && "bg-blue-50 border-blue-200 text-blue-800",
              )}
            >
              <div className="flex items-center space-x-3">
                {toast.type === "success" && <CheckCircle className="h-5 w-5 text-green-600" />}
                {toast.type === "error" && <XCircle className="h-5 w-5 text-red-600" />}
                {toast.type === "info" && <Activity className="h-5 w-5 text-blue-600" />}
                <span className="font-medium">{toast.message}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Dialog */}
      {isMobile ? (
        <MobileRekapDetailDialog
          submission={selectedSubmission}
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      ) : (
        <RekapDetailDialog
          submission={selectedSubmission}
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </div>
  )
}
