"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Search,
  RefreshCw,
  TrendingUp,
  Users,
  Tag,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import ContentReviewDialog from "@/components/content-review-dialog"
import { MobileContentReviewDialog } from "@/components/mobile-content-review-dialog"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"

// Define interfaces
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
  mediaPemerintah: string[]
  mediaMassa: string[]
  nomorSurat: string
  narasiText?: string
  sourceNarasi?: string[]
  sourceAudioDubbing?: string[]
  sourceAudioBacksound?: string[]
  sourcePendukungLainnya?: string[]
  tanggalOrderMasuk?: Date | undefined
  tanggalJadi?: Date | undefined
  tanggalTayang?: Date | undefined
  keterangan?: string
  status?: "pending" | "approved" | "rejected"
  alasanPenolakan?: string
  tanggalDiproses?: string
  diprosesoleh?: string
  narasiSourceType?: ("text" | "file" | "surat")[]
  audioDubbingSourceType?: ("file-audio" | "lain-lain")[]
  audioBacksoundSourceType?: ("file-audio" | "lain-lain")[]
  pendukungLainnyaSourceType?: ("video" | "foto" | "lain-lain")[]
  narasiFile?: any
  suratFile?: any
  audioDubbingFile?: any
  audioDubbingLainLainFile?: any
  audioBacksoundFile?: any
  audioBacksoundLainLainFile?: any
  pendukungVideoFile?: any
  pendukungFotoFile?: any
  pendukungLainLainFile?: any
  hasilProdukFile?: any
  hasilProdukLink?: string
  isTayang?: boolean
  tanggalValidasiTayang?: string
  validatorTayang?: string
  keteranganValidasi?: string
  catatan?: string
}

interface Submission {
  id: number
  noComtab: string
  pin: string
  tema: string
  judul: string
  jenisMedia: string
  mediaPemerintah: string[]
  mediaMassa: string[]
  jenisKonten: string[]
  tanggalOrder: Date | undefined
  petugasPelaksana: string
  supervisor: string
  durasi: string
  jumlahProduksi: string
  tanggalSubmit: Date | undefined
  lastModified?: Date | undefined
  uploadedBuktiMengetahui?: any
  isConfirmed?: boolean
  tanggalKonfirmasi?: string
  contentItems?: ContentItem[]
  buktiMengetahui?: FileData | string
  dokumenPendukung?: (FileData | string)[]
  workflowStage?: "submitted" | "review" | "validation" | "completed"
  tanggalReview?: string
}

// Helper function to determine workflow stage
const getWorkflowStage = (submission: Submission) => {
  if (!submission.isConfirmed) return "submitted"

  const contentItems = submission.contentItems || []
  if (contentItems.length === 0) return "review"

  const allReviewed = contentItems.every(
    (item: ContentItem) => item.status === "approved" || item.status === "rejected",
  )
  if (!allReviewed) return "review"

  const hasApprovedItems = contentItems.some((item: ContentItem) => item.status === "approved")
  if (!hasApprovedItems) return "completed"

  const approvedItems = contentItems.filter((item: ContentItem) => item.status === "approved")
  const allValidated = approvedItems.every((item: any) => item.isTayang !== undefined)

  if (!allValidated) return "validation"
  return "completed"
}

export default function ReviewPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showStats, setShowStats] = useState(false)
  const { toast } = useToast()
  const { isMobile } = useMobile()
  const router = useRouter()

  console.log("🚀 ReviewPage component loaded")

  // Load submissions from API - only those that need review
  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setIsLoading(true)
        console.log("🔄 Loading reviews from API...")

        // Fetch submissions from API
        const response = await fetch('https://be-savana.budiutamamandiri.com/api/submissions')
        if (!response.ok) throw new Error('Failed to fetch submissions')
        
        const data = await response.json()
        console.log("📊 API Response:", data)
        
        // Filter submissions that need review (workflow_stage = "review")
        const reviewSubmissions = data.data.filter((item: any) => 
          item.workflow_stage === "review"
        )
        
        console.log("📋 Review submissions found:", reviewSubmissions.length)
        
        // Transform API data to match Submission interface
        const transformedData = reviewSubmissions.map((item: any) => {
          // Parse description for tema and supervisor
          const descriptionMatch = item.description.match(/Tema:\s*(.+?)\s*Supervisor:\s*(.+)/)
          const tema = descriptionMatch?.[1]?.trim() || 'Tidak ada tema'
          const supervisor = descriptionMatch?.[2]?.trim() || 'Tidak ada supervisor'
          
          return {
            id: item.id,
            noComtab: `${item.id}/IKP/${new Date().getFullYear()}`,
            pin: Math.floor(1000 + Math.random() * 9000).toString(),
            tema: tema,
            judul: item.title,
            jenisMedia: "Digital",
            mediaPemerintah: ["Website"],
            mediaMassa: [],
            jenisKonten: ["artikel"],
            tanggalOrder: new Date(item.created_at),
            petugasPelaksana: item.user.name,
            supervisor: supervisor,
            durasi: "14 hari",
            jumlahProduksi: "1 konten",
            tanggalSubmit: new Date(item.created_at),
            lastModified: new Date(item.updated_at),
            uploadedBuktiMengetahui: false,
            isConfirmed: true,
            tanggalKonfirmasi: item.created_at,
            contentItems: item.content_items.map((content: any) => ({
              id: content.id?.toString() || Math.random().toString(),
              nama: content.label,
              jenisKonten: content.type,
              mediaPemerintah: ["Website"],
              mediaMassa: [],
              nomorSurat: `${item.id}/SURAT/${new Date().getFullYear()}`,
              narasiText: "",
              sourceNarasi: [],
              sourceAudioDubbing: [],
              sourceAudioBacksound: [],
              sourcePendukungLainnya: [],
              tanggalOrderMasuk: new Date(item.created_at),
              tanggalJadi: undefined,
              tanggalTayang: undefined,
              keterangan: content.value,
              status: "pending" as const
            })),
            buktiMengetahui: undefined,
            dokumenPendukung: [],
            workflowStage: "review" as const,
            tanggalReview: undefined,
          }
        })
        
        setSubmissions(transformedData)
        console.log("✅ Submissions loaded:", transformedData.length)
        
      } catch (error) {
        console.error("❌ Error loading submissions:", error)
        // Fallback to test data if API fails
        const testData: Submission[] = [
          {
            id: 1,
            noComtab: "1/IKP/2025",
            pin: "1234",
            tema: "Test Tema",
            judul: "Test Submission",
            jenisMedia: "Digital",
            mediaPemerintah: ["Website"],
            mediaMassa: [],
            jenisKonten: ["artikel"],
            tanggalOrder: new Date(),
            petugasPelaksana: "Test User",
            supervisor: "Test Supervisor",
            durasi: "14 hari",
            jumlahProduksi: "1 konten",
            tanggalSubmit: new Date(),
            lastModified: new Date(),
            uploadedBuktiMengetahui: false,
            isConfirmed: true,
            tanggalKonfirmasi: new Date().toISOString(),
            contentItems: [
              {
                id: "1",
                nama: "Test Content",
                jenisKonten: "artikel",
                mediaPemerintah: ["Website"],
                mediaMassa: [],
                nomorSurat: "1/SURAT/2025",
                narasiText: "",
                sourceNarasi: [],
                sourceAudioDubbing: [],
                sourceAudioBacksound: [],
                sourcePendukungLainnya: [],
                tanggalOrderMasuk: new Date(),
                tanggalJadi: undefined,
                tanggalTayang: undefined,
                keterangan: "Test content item",
                status: "pending"
              }
            ],
            buktiMengetahui: undefined,
            dokumenPendukung: [],
            workflowStage: "review",
            tanggalReview: undefined,
          }
        ]
        setSubmissions(testData)
      } finally {
        setIsLoading(false)
      }
    }

    loadSubmissions()
  }, [])

  // Filter submissions based on status and search
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.noComtab.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.tema.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterStatus === "all") return matchesSearch

    const contentItems = submission.contentItems || []
    const hasStatus = contentItems.some((item) => item.status === filterStatus)
    const hasPending = contentItems.some((item) => !item.status || item.status === "pending")

    if (filterStatus === "pending") {
      return matchesSearch && hasPending
    }

    return matchesSearch && hasStatus
  })

  // Calculate statistics
  const totalSubmissions = submissions.length
  const pendingSubmissions = submissions.filter((sub) => {
    const contentItems = sub.contentItems || []
    return contentItems.some((item) => !item.status || item.status === "pending")
  }).length
  const approvedSubmissions = submissions.filter((sub) => {
    const contentItems = sub.contentItems || []
    return contentItems.some((item) => item.status === "approved")
  }).length
  const rejectedSubmissions = submissions.filter((sub) => {
    const contentItems = sub.contentItems || []
    return contentItems.some((item) => item.status === "rejected")
  }).length

  const handleSubmissionClick = (submission: Submission) => {
    setSelectedSubmission(submission)
    setIsDialogOpen(true)
  }

  const handleContentUpdate = (submissionId: number, contentId: string, updates: any) => {
    setSubmissions(prev => prev.map(submission => {
      if (submission.id === submissionId) {
        const updatedContentItems = submission.contentItems?.map(item => {
          if (item.id === contentId) {
            return { ...item, ...updates }
          }
          return item
        })
        return { ...submission, contentItems: updatedContentItems }
      }
      return submission
    }))

    toast({
      title: "Berhasil",
      description: "Status konten berhasil diperbarui",
    })
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-3 w-3" />
      case "rejected":
        return <XCircle className="h-3 w-3" />
      case "pending":
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Memuat data review...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/admin")}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review Konten</h1>
            <p className="text-gray-600">Kelola review dan validasi konten yang masuk</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowStats(!showStats)}
            className="flex items-center space-x-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Statistik</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Dokumen</p>
                    <p className="text-2xl font-bold text-gray-900">{totalSubmissions}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Menunggu Review</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingSubmissions}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Disetujui</p>
                    <p className="text-2xl font-bold text-green-600">{approvedSubmissions}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ditolak</p>
                    <p className="text-2xl font-bold text-red-600">{rejectedSubmissions}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
              >
                Semua
              </Button>
              <Button
                variant={filterStatus === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("pending")}
              >
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </Button>
              <Button
                variant={filterStatus === "approved" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("approved")}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Disetujui
              </Button>
              <Button
                variant={filterStatus === "rejected" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("rejected")}
              >
                <XCircle className="h-3 w-3 mr-1" />
                Ditolak
              </Button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari dokumen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <span>Menampilkan {filteredSubmissions.length} dokumen</span>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredSubmissions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Tidak ada dokumen ditemukan
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm
                      ? "Coba gunakan kata kunci yang berbeda"
                      : "Belum ada dokumen yang perlu direview"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            filteredSubmissions.map((submission, index) => {
              const contentItems = submission.contentItems || []
              const pendingCount = contentItems.filter(
                (item) => !item.status || item.status === "pending",
              ).length
              const approvedCount = contentItems.filter((item) => item.status === "approved").length
              const rejectedCount = contentItems.filter((item) => item.status === "rejected").length

              return (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {submission.judul}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {submission.tema}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {submission.noComtab}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{submission.petugasPelaksana}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              <span>
                                {submission.tanggalSubmit
                                  ? new Date(submission.tanggalSubmit).toLocaleDateString("id-ID")
                                  : "Tanggal tidak tersedia"}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{submission.supervisor}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            {pendingCount > 0 && (
                              <div className="flex items-center text-sm">
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {pendingCount} pending
                                </Badge>
                              </div>
                            )}
                            {approvedCount > 0 && (
                              <div className="flex items-center text-sm">
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {approvedCount} disetujui
                                </Badge>
                              </div>
                            )}
                            {rejectedCount > 0 && (
                              <div className="flex items-center text-sm">
                                <Badge className="bg-red-100 text-red-800 border-red-200">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  {rejectedCount} ditolak
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleSubmissionClick(submission)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>

      {/* Review Dialog */}
      {selectedSubmission && (
        <>
          {isMobile ? (
            <MobileContentReviewDialog
              submission={selectedSubmission}
              isOpen={isDialogOpen}
              onClose={() => {
                setIsDialogOpen(false)
                setSelectedSubmission(null)
              }}
              onContentUpdate={handleContentUpdate}
            />
          ) : (
            <ContentReviewDialog
              submission={selectedSubmission}
              isOpen={isDialogOpen}
              onClose={() => {
                setIsDialogOpen(false)
                setSelectedSubmission(null)
              }}
              onContentUpdate={handleContentUpdate}
            />
          )}
        </>
      )}
    </div>
  )
}
