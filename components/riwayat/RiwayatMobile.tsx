"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Filter,
  Search,
  Eye,
  FileText,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Edit,
  ArrowLeft,
  X,
  Bell,
  BarChart3,
  RefreshCw,
  Hash,
  Target,
  Layers,
  Shield,
  Rocket,
  Zap,
  Send,
  CheckCircle2,
  AlertCircle,
  History,
  Video,
  ImageIcon,
  Music,
  Mic,
  FileImage,
  Play,
  Radio,
  Tv,
  Globe,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  MoreVertical,
  Clock,
  Info,
  Share2,
  Copy,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Plus,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

// Local formatDate function
const formatDate = (date: Date | string | undefined): string => {
  if (!date) return "-"

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    if (isNaN(dateObj.getTime())) return "-"

    return dateObj.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch (error) {
    return "-"
  }
}

// Local getContentTypeIcon function
const getContentTypeIcon = (jenisKonten: string) => {
  switch (jenisKonten.toLowerCase()) {
    case "video":
    case "video-promosi":
    case "video-edukasi":
      return <Video className="h-4 w-4 text-red-500" />
    case "foto":
    case "foto-kegiatan":
    case "foto-produk":
      return <ImageIcon className="h-4 w-4 text-blue-500" />
    case "audio":
    case "audio-dubbing":
    case "audio-backsound":
      return <Music className="h-4 w-4 text-green-500" />
    case "podcast":
    case "wawancara":
      return <Mic className="h-4 w-4 text-purple-500" />
    case "infografis":
    case "poster":
    case "banner":
      return <FileImage className="h-4 w-4 text-orange-500" />
    case "animasi":
    case "motion-graphics":
      return <Play className="h-4 w-4 text-pink-500" />
    default:
      return <FileText className="h-4 w-4 text-gray-500" />
  }
}

// Local getMediaIcon function
const getMediaIcon = (media: string) => {
  switch (media.toLowerCase()) {
    case "tv":
    case "televisi":
      return <Tv className="h-3 w-3" />
    case "radio":
      return <Radio className="h-3 w-3" />
    case "website":
    case "web":
      return <Globe className="h-3 w-3" />
    case "facebook":
    case "fb":
      return <Facebook className="h-3 w-3" />
    case "instagram":
    case "ig":
      return <Instagram className="h-3 w-3" />
    case "youtube":
    case "yt":
      return <Youtube className="h-3 w-3" />
    case "twitter":
    case "x":
      return <Twitter className="h-3 w-3" />
    default:
      return <Globe className="h-3 w-3" />
  }
}

// Local getStatusBadge function
const getStatusBadge = (status?: "pending" | "approved" | "rejected") => {
  switch (status) {
    case "approved":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          Disetujui
        </Badge>
      )
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
          <XCircle className="h-3 w-3 mr-1" />
          Ditolak
        </Badge>
      )
    case "pending":
    default:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
          <AlertCircle className="h-3 w-3 mr-1" />
          Menunggu
        </Badge>
      )
  }
}

// Local getTayangStatusBadge function
const getTayangStatusBadge = (isTayang?: boolean) => {
  if (isTayang === true) {
    return (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
        <Globe className="h-3 w-3 mr-1" />
        Tayang
      </Badge>
    )
  } else if (isTayang === false) {
    return (
      <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
        <EyeOff className="h-3 w-3 mr-1" />
        Draft
      </Badge>
    )
  }
  return null
}

// Load submissions from localStorage
const loadSubmissionsFromStorage = () => {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem("submissions")
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error loading submissions:", error)
    return []
  }
}

interface FileData {
  name: string
  size: number
  type: string
  lastModified: number
  base64: string
  url: string
}

interface ContentItem {
  id: string
  nama: string
  jenisKonten: string
  mediaPemerintah: string[]
  mediaMassa: string[]
  nomorSurat: string
  narasiText: string
  sourceNarasi: string[]
  sourceAudioDubbing: string[]
  sourceAudioBacksound: string[]
  sourcePendukungLainnya: string[]
  narasiFile?: FileData | string
  suratFile?: FileData | string
  audioDubbingFile?: FileData | string
  audioDubbingLainLainFile?: FileData | string
  audioBacksoundFile?: FileData | string
  audioBacksoundLainLainFile?: FileData | string
  pendukungVideoFile?: FileData | string
  pendukungFotoFile?: FileData | string
  pendukungLainLainFile?: FileData | string
  tanggalOrderMasuk: Date | undefined
  tanggalJadi: Date | undefined
  tanggalTayang: Date | undefined
  keterangan: string
  status?: "pending" | "approved" | "rejected"
  alasanPenolakan?: string
  tanggalDiproses?: string
  diprosesoleh?: string
  hasilProdukFile?: FileData | string
  hasilProdukLink?: string
  isTayang?: boolean
  tanggalValidasiTayang?: string
  validatorTayang?: string
  keteranganValidasi?: string
  alasanTidakTayang?: string
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
  tanggalKonfirmasi?: string
  uploadedBuktiMengetahui?: FileData | string
  isConfirmed?: boolean
  isOutputValidated?: boolean
  tanggalValidasiOutput?: string
  contentItems?: ContentItem[]
  workflowStage?: "submitted" | "review" | "validation" | "completed"
}

interface EditAccessData {
  submissionId: string
  pin: string
}

interface RiwayatMobileProps {
  onEdit?: (id: string) => void
}

// Helper function to determine workflow stage
const getWorkflowStage = (submission: Submission): "submitted" | "review" | "validation" | "completed" => {
  if (!submission.isConfirmed) return "submitted"

  const contentItems = submission.contentItems || []
  if (contentItems.length === 0) return "review"

  const allReviewed = contentItems.every((item) => item.status === "approved" || item.status === "rejected")
  if (!allReviewed) return "review"

  const hasApprovedItems = contentItems.some((item) => item.status === "approved")
  if (!hasApprovedItems) return "completed"

  const approvedItems = contentItems.filter((item) => item.status === "approved")
  const allValidated = approvedItems.every((item) => item.isTayang !== undefined)

  if (!allValidated) return "validation"
  return "completed"
}

// Helper function to get workflow stage info
const getWorkflowStageInfo = (stage: string) => {
  switch (stage) {
    case "submitted":
      return {
        label: "Dikirim",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <Send className="h-3 w-3" />,
        description: "Menunggu konfirmasi admin",
      }
    case "review":
      return {
        label: "Review",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Eye className="h-3 w-3" />,
        description: "Sedang direview admin",
      }
    case "validation":
      return {
        label: "Validasi",
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: <Shield className="h-3 w-3" />,
        description: "Menunggu validasi output",
      }
    case "completed":
      return {
        label: "Selesai",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle2 className="h-3 w-3" />,
        description: "Proses workflow selesai",
      }
    default:
      return {
        label: "Unknown",
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <AlertCircle className="h-3 w-3" />,
        description: "Status tidak diketahui",
      }
  }
}

// Content View Dialog Component
const ContentViewDialog = ({
  isOpen,
  onOpenChange,
  contentItem,
  parentSubmission,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  contentItem: ContentItem | null
  parentSubmission: Submission | null
}) => {
  if (!contentItem || !parentSubmission) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full h-screen bg-white border-0 shadow-none p-0 m-0 rounded-none">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 sticky top-0 z-50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="p-2 bg-white/20 rounded-xl">{getContentTypeIcon(contentItem.jenisKonten)}</div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg font-bold text-white truncate">
                  {contentItem.nama || "Detail Konten"}
                </DialogTitle>
                <DialogDescription className="text-indigo-100 text-sm truncate">
                  {contentItem.jenisKonten.replace("-", " ")}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/20 p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4 pb-20">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Info className="h-4 w-4 mr-2 text-indigo-600" />
                    Informasi Konten
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <label className="text-xs font-semibold text-indigo-700 mb-1 block">Nama Konten</label>
                      <p className="font-bold text-indigo-900">{contentItem.nama || "Tidak ada nama"}</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Jenis Konten</label>
                      <p className="font-semibold text-gray-900 capitalize">
                        {contentItem.jenisKonten.replace("-", " ")}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <label className="text-xs font-semibold text-green-700 mb-1 block">Status</label>
                        {getStatusBadge(contentItem.status)}
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <label className="text-xs font-semibold text-blue-700 mb-1 block">Status Tayang</label>
                        {getTayangStatusBadge(contentItem.isTayang) || (
                          <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Belum ditentukan
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-orange-50 rounded-lg">
                      <label className="text-xs font-semibold text-orange-700 mb-1 block">No. Surat</label>
                      <p className="text-sm font-semibold text-orange-900">{contentItem.nomorSurat || "Belum diisi"}</p>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-lg">
                      <label className="text-xs font-semibold text-purple-700 mb-1 block">Keterangan</label>
                      <p className="text-sm text-purple-900">{contentItem.keterangan || "Belum ada keterangan"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                      <span className="font-semibold text-orange-700">Order Masuk:</span>
                      <span className="font-medium text-orange-900">{formatDate(contentItem.tanggalOrderMasuk)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span className="font-semibold text-green-700">Tanggal Jadi:</span>
                      <span className="font-medium text-green-900">{formatDate(contentItem.tanggalJadi)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                      <span className="font-semibold text-blue-700">Tanggal Tayang:</span>
                      <span className="font-medium text-blue-900">{formatDate(contentItem.tanggalTayang)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rejection Reason */}
              {contentItem.alasanPenolakan && contentItem.status === "rejected" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center text-red-600">
                      <XCircle className="h-4 w-4 mr-2" />
                      Alasan Penolakan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-900">{contentItem.alasanPenolakan}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function RiwayatMobile({ onEdit }: RiwayatMobileProps) {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "submitted" | "review" | "validation" | "completed">("all")
  const [filterTheme, setFilterTheme] = useState<"all" | "sosial" | "ekonomi" | "lingkungan">("all")
  const [viewingSubmission, setViewingSubmission] = useState<Submission | null>(null)
  const [selectedContentItem, setSelectedContentItem] = useState<ContentItem | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isContentViewOpen, setIsContentViewOpen] = useState(false)
  const [isEditAccessDialogOpen, setIsEditAccessDialogOpen] = useState(false)
  const [editAccessData, setEditAccessData] = useState<EditAccessData>({
    submissionId: "",
    pin: "",
  })
  const [toastMessage, setToastMessage] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showStats, setShowStats] = useState(true)
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())
  const [isValidatingEdit, setIsValidatingEdit] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsLoading(true)
    const storedSubmissions = loadSubmissionsFromStorage()
    // Add workflow stage to each submission and ensure arrays
    const submissionsWithStage = storedSubmissions.map((sub: Submission) => ({
      ...sub,
      mediaPemerintah: Array.isArray(sub.mediaPemerintah) ? sub.mediaPemerintah : [],
      mediaMassa: Array.isArray(sub.mediaMassa) ? sub.mediaMassa : [],
      jenisKonten: Array.isArray(sub.jenisKonten) ? sub.jenisKonten : [],
      contentItems: Array.isArray(sub.contentItems)
        ? sub.contentItems.map((item: ContentItem) => ({
            ...item,
            mediaPemerintah: Array.isArray(item.mediaPemerintah) ? item.mediaPemerintah : [],
            mediaMassa: Array.isArray(item.mediaMassa) ? item.mediaMassa : [],
            sourceNarasi: Array.isArray(item.sourceNarasi) ? item.sourceNarasi : [],
            sourceAudioDubbing: Array.isArray(item.sourceAudioDubbing) ? item.sourceAudioDubbing : [],
            sourceAudioBacksound: Array.isArray(item.sourceAudioBacksound) ? item.sourceAudioBacksound : [],
            sourcePendukungLainnya: Array.isArray(item.sourcePendukungLainnya) ? item.sourcePendukungLainnya : [],
          }))
        : [],
      workflowStage: getWorkflowStage(sub),
    }))
    setSubmissions(submissionsWithStage)
    setIsLoading(false)
  }, [])

  const showToastMessage = (message: string, type: "success" | "error" | "info" = "info") => {
    setToastMessage({ message, type })
    setTimeout(() => setToastMessage(null), 5000)
  }

  const filteredAndSortedSubmissions = useMemo(() => {
    const filtered = submissions.filter((submission) => {
      const matchesSearch =
        submission.noComtab?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.petugasPelaksana?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.supervisor?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filterStatus === "all" || submission.workflowStage === filterStatus
      const matchesTheme = filterTheme === "all" || submission.tema === filterTheme

      return matchesSearch && matchesStatus && matchesTheme
    })

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = a.tanggalSubmit ? new Date(a.tanggalSubmit).getTime() : 0
      const dateB = b.tanggalSubmit ? new Date(b.tanggalSubmit).getTime() : 0
      return dateB - dateA
    })

    return filtered
  }, [submissions, searchTerm, filterStatus, filterTheme])

  const statistics = useMemo(() => {
    const total = submissions.length
    const submitted = submissions.filter((s) => s.workflowStage === "submitted").length
    const review = submissions.filter((s) => s.workflowStage === "review").length
    const validation = submissions.filter((s) => s.workflowStage === "validation").length
    const completed = submissions.filter((s) => s.workflowStage === "completed").length

    const contentStats = submissions.reduce(
      (acc, sub) => {
        sub.contentItems?.forEach((item) => {
          acc.total++
          if (item.status === "approved") acc.approved++
          else if (item.status === "rejected") acc.rejected++
          else acc.pending++

          if (item.isTayang === true) acc.published++
          else if (item.isTayang === false) acc.notPublished++
        })
        return acc
      },
      { total: 0, approved: 0, rejected: 0, pending: 0, published: 0, notPublished: 0 },
    )

    return {
      submissions: { total, submitted, review, validation, completed },
      content: contentStats,
    }
  }, [submissions])

  const handleViewDetails = (submission: Submission) => {
    setViewingSubmission(submission)
    setIsViewDialogOpen(true)
  }

  const handleViewContent = (item: ContentItem, submission: Submission) => {
    setSelectedContentItem(item)
    setViewingSubmission(submission)
    setIsContentViewOpen(true)
  }

  const handleEditAccess = async () => {
    if (!editAccessData.submissionId.trim() || !editAccessData.pin.trim()) {
      showToastMessage("Mohon masukkan No. COMTAB dan PIN", "error")
      return
    }

    setIsValidatingEdit(true)

    try {
      // Find submission with matching credentials
      const targetSubmission = submissions.find(
        (sub) => sub.noComtab === editAccessData.submissionId.trim() && sub.pin === editAccessData.pin.trim(),
      )

      if (!targetSubmission) {
        showToastMessage("No. COMTAB atau PIN tidak valid", "error")
        return
      }

      // Close dialog and navigate to edit form
      setIsEditAccessDialogOpen(false)
      setEditAccessData({ submissionId: "", pin: "" })

      showToastMessage("Masuk ke mode edit pengajuan", "success")

      // Navigate to edit form with credentials
      if (onEdit) {
        onEdit(targetSubmission.noComtab)
      } else {
        router.push(`/mobile/edit?id=${targetSubmission.noComtab}&pin=${targetSubmission.pin}`)
      }
    } catch (error) {
      console.error("Edit validation error:", error)
      showToastMessage("Terjadi kesalahan saat validasi", "error")
    } finally {
      setIsValidatingEdit(false)
    }
  }

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      const storedSubmissions = loadSubmissionsFromStorage()
      const submissionsWithStage = storedSubmissions.map((sub: Submission) => ({
        ...sub,
        mediaPemerintah: Array.isArray(sub.mediaPemerintah) ? sub.mediaPemerintah : [],
        mediaMassa: Array.isArray(sub.mediaMassa) ? sub.mediaMassa : [],
        jenisKonten: Array.isArray(sub.jenisKonten) ? sub.jenisKonten : [],
        contentItems: Array.isArray(sub.contentItems)
          ? sub.contentItems.map((item: ContentItem) => ({
              ...item,
              mediaPemerintah: Array.isArray(item.mediaPemerintah) ? item.mediaPemerintah : [],
              mediaMassa: Array.isArray(item.mediaMassa) ? item.mediaMassa : [],
              sourceNarasi: Array.isArray(item.sourceNarasi) ? item.sourceNarasi : [],
              sourceAudioDubbing: Array.isArray(item.sourceAudioDubbing) ? item.sourceAudioDubbing : [],
              sourceAudioBacksound: Array.isArray(item.sourceAudioBacksound) ? item.sourceAudioBacksound : [],
              sourcePendukungLainnya: Array.isArray(item.sourcePendukungLainnya) ? item.sourcePendukungLainnya : [],
            }))
          : [],
        workflowStage: getWorkflowStage(sub),
      }))
      setSubmissions(submissionsWithStage)
      setIsLoading(false)
      showToastMessage("Data berhasil diperbarui!", "success")
    }, 1000)
  }

  const toggleCardExpansion = (submissionId: number) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(submissionId)) {
        newSet.delete(submissionId)
      } else {
        newSet.add(submissionId)
      }
      return newSet
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showToastMessage("Disalin ke clipboard", "success")
  }

  const shareSubmission = (submission: Submission) => {
    if (navigator.share) {
      navigator.share({
        title: `Pengajuan ${submission.noComtab}`,
        text: submission.judul,
        url: window.location.href,
      })
    } else {
      copyToClipboard(`${submission.noComtab}: ${submission.judul}`)
    }
  }

  // Check if submission has rejected content
  const hasRejectedContent = (submission: Submission): boolean => {
    return submission.contentItems?.some((item) => item.status === "rejected") || false
  }

  // Handle revision for rejected content
  const handleRevision = (submission: Submission) => {
    if (onEdit) {
      onEdit(submission.noComtab)
    } else {
      router.push(`/mobile/edit?id=${submission.noComtab}&pin=${submission.pin}&revision=true`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-indigo-700">Memuat riwayat pengajuan...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
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
                onClick={() => router.push("/mobile")}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <motion.div
                whileHover={{ rotate: 15 }}
                className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
              >
                <History className="h-4 w-4 text-white" />
              </motion.div>
              <div className="flex-1">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Riwayat Pengajuan
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">Kelola dan pantau pengajuan Anda</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center space-x-2"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStats(!showStats)}
                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 p-2 flex-shrink-0"
              >
                <BarChart3 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{showStats ? "Hide" : "Show"}</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 p-2 bg-transparent flex-shrink-0"
                  >
                    <MoreVertical className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 sm:w-56">
                  <DropdownMenuItem onClick={refreshData} disabled={isLoading}>
                    <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                    Refresh Data
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsEditAccessDialogOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Pengajuan
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/mobile")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali ke Beranda
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="space-y-4 sm:space-y-6 pb-20">
        {/* Statistics Cards */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 pt-4"
            >
              {/* Workflow Statistics */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center px-1">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-indigo-600" />
                  Status Workflow
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    {
                      title: "Total Pengajuan",
                      value: statistics.submissions.total,
                      icon: FileText,
                      color: "from-blue-500 to-blue-600",
                      bgColor: "from-blue-50 to-blue-100",
                      textColor: "text-blue-900",
                      labelColor: "text-blue-700"
                    },
                    {
                      title: "Selesai",
                      value: statistics.submissions.completed,
                      icon: CheckCircle2,
                      color: "from-green-500 to-green-600",
                      bgColor: "from-green-50 to-green-100",
                      textColor: "text-green-900",
                      labelColor: "text-green-700"
                    },
                    {
                      title: "Dalam Proses",
                      value: statistics.submissions.review + statistics.submissions.validation,
                      icon: Zap,
                      color: "from-yellow-500 to-yellow-600",
                      bgColor: "from-yellow-50 to-yellow-100",
                      textColor: "text-yellow-900",
                      labelColor: "text-yellow-700"
                    },
                    {
                      title: "Tayang",
                      value: statistics.content.published,
                      icon: Rocket,
                      color: "from-purple-500 to-purple-600",
                      bgColor: "from-purple-50 to-purple-100",
                      textColor: "text-purple-900",
                      labelColor: "text-purple-700"
                    }
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
                        <Card className={`bg-gradient-to-br ${card.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-200`}>
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r ${card.color} rounded-lg flex items-center justify-center shadow-md`}>
                                <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                              </div>
                              <div className="text-right">
                                <p className={`text-lg sm:text-2xl font-bold ${card.textColor}`}>{card.value}</p>
                              </div>
                            </div>
                            <p className={`text-xs sm:text-sm font-semibold ${card.labelColor} line-clamp-2`}>{card.title}</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {/* Main Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari berdasarkan No. Comtab, judul..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-12 bg-white border-gray-200 focus:border-indigo-500"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 p-2"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>

                {/* Collapsible Filters */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 pt-4 border-t border-gray-200"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Status Workflow</label>
                          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                            <SelectTrigger className="bg-white border-gray-200">
                              <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Semua Status</SelectItem>
                              <SelectItem value="submitted">Dikirim</SelectItem>
                              <SelectItem value="review">Review</SelectItem>
                              <SelectItem value="validation">Validasi</SelectItem>
                              <SelectItem value="completed">Selesai</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Tema</label>
                          <Select value={filterTheme} onValueChange={(value: any) => setFilterTheme(value)}>
                            <SelectTrigger className="bg-white border-gray-200">
                              <SelectValue placeholder="Pilih tema" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Semua Tema</SelectItem>
                              <SelectItem value="sosial">🏥 Sosial</SelectItem>
                              <SelectItem value="ekonomi">💰 Ekonomi</SelectItem>
                              <SelectItem value="lingkungan">🌱 Lingkungan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowFilters(false)}
                          className="border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Tutup Filter
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Count */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-600">
            Menampilkan <span className="font-semibold text-indigo-600">{filteredAndSortedSubmissions.length}</span> dari{" "}
            <span className="font-semibold">{submissions.length}</span> pengajuan
          </p>
        </div>

        {/* Mobile Submissions List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <AnimatePresence>
            {filteredAndSortedSubmissions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12"
              >
                <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg">
                  <CardContent className="p-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada pengajuan</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || filterStatus !== "all" || filterTheme !== "all"
                        ? "Tidak ada pengajuan yang sesuai dengan filter atau pencarian."
                        : "Belum ada pengajuan dalam sistem."}
                    </p>
                    <Button onClick={() => router.push("/mobile/form")} className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Buat Pengajuan Baru
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {filteredAndSortedSubmissions.map((submission, index) => {
                const isExpanded = expandedCards.has(submission.id)
                const workflowStageInfo = getWorkflowStageInfo(submission.workflowStage || "submitted")
                const contentItems = submission.contentItems || []
                const approvedItems = contentItems.filter((item) => item.status === "approved")
                const rejectedItems = contentItems.filter((item) => item.status === "rejected")
                const publishedItems = approvedItems.filter((item) => item.isTayang === true)
                const hasRejected = hasRejectedContent(submission)

                return (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            {/* Document Header */}
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                                <FileText className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-gray-900 mb-1 truncate">
                                  {submission.judul}
                                </h3>
                                <Badge className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-indigo-200 font-medium text-xs px-2 py-1">
                                  <Hash className="h-3 w-3 mr-1" />
                                  {submission.noComtab}
                                </Badge>
                              </div>
                            </div>

                            {/* Status Badges */}
                            <div className="flex items-center space-x-2 mb-3 flex-wrap gap-1">
                              <Badge className={cn("font-semibold text-xs", workflowStageInfo.color)}>
                                {workflowStageInfo.icon}
                                <span className="ml-1">{workflowStageInfo.label}</span>
                              </Badge>
                              <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs capitalize">
                                <Target className="h-3 w-3 mr-1" />
                                {submission.tema === "sosial"
                                  ? "🏥 Sosial"
                                  : submission.tema === "ekonomi"
                                    ? "💰 Ekonomi"
                                    : submission.tema === "lingkungan"
                                      ? "🌱 Lingkungan"
                                      : submission.tema}
                              </Badge>
                              {hasRejected && (
                                <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Ada Penolakan
                                </Badge>
                              )}
                            </div>

                            {/* Document Details */}
                            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                              <div className="p-2 bg-blue-50 rounded">
                                <div className="flex items-center space-x-1">
                                  <Users className="h-3 w-3 text-blue-500" />
                                  <span className="text-blue-700 font-medium">Petugas</span>
                                </div>
                                <p className="font-semibold text-blue-900 truncate mt-1">
                                  {submission.petugasPelaksana}
                                </p>
                              </div>
                              <div className="p-2 bg-green-50 rounded">
                                <div className="flex items-center space-x-1">
                                  <Shield className="h-3 w-3 text-green-500" />
                                  <span className="text-green-700 font-medium">Supervisor</span>
                                </div>
                                <p className="font-semibold text-green-900 truncate mt-1">{submission.supervisor}</p>
                              </div>
                              <div className="p-2 bg-purple-50 rounded">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3 text-purple-500" />
                                  <span className="text-purple-700 font-medium">Submit</span>
                                </div>
                                <p className="font-semibold text-purple-900 mt-1">
                                  {formatDate(submission.tanggalSubmit)}
                                </p>
                              </div>
                              <div className="p-2 bg-orange-50 rounded">
                                <div className="flex items-center space-x-1">
                                  <Layers className="h-3 w-3 text-orange-500" />
                                  <span className="text-orange-700 font-medium">Konten</span>
                                </div>
                                <p className="font-semibold text-orange-900 mt-1">{contentItems.length} item</p>
                              </div>
                            </div>
                          </div>

                          {/* Action Menu */}
                          <div className="flex items-center space-x-1 ml-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="p-1">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(submission)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Lihat Detail
                                </DropdownMenuItem>
                                {hasRejected && (
                                  <DropdownMenuItem onClick={() => handleRevision(submission)}>
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Revisi
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => shareSubmission(submission)}>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => copyToClipboard(submission.noComtab)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Salin No. Comtab
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCardExpansion(submission.id)}
                              className="p-1"
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        {/* Document Progress */}
                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span className="font-medium">Progress Dokumen</span>
                            <span className="font-bold">
                              {Math.round(
                                ((approvedItems.length + rejectedItems.length) / Math.max(contentItems.length, 1)) *
                                  100,
                              )}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                              style={{
                                width: `${
                                  ((approvedItems.length + rejectedItems.length) / Math.max(contentItems.length, 1)) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>

                          {/* Progress Stats */}
                          <div className="grid grid-cols-4 gap-2">
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <p className="text-sm font-semibold text-gray-900">{contentItems.length}</p>
                              <p className="text-xs text-gray-600">Total</p>
                            </div>
                            <div className="text-center p-2 bg-green-50 rounded">
                              <p className="text-sm font-semibold text-green-900">{approvedItems.length}</p>
                              <p className="text-xs text-green-600">Disetujui</p>
                            </div>
                            <div className="text-center p-2 bg-red-50 rounded">
                              <p className="text-sm font-semibold text-red-900">{rejectedItems.length}</p>
                              <p className="text-xs text-red-600">Ditolak</p>
                            </div>
                            <div className="text-center p-2 bg-blue-50 rounded">
                              <p className="text-sm font-semibold text-blue-900">{publishedItems.length}</p>
                              <p className="text-xs text-blue-600">Tayang</p>
                            </div>
                          </div>
                        </div>

                        {/* Document Status Indicators */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {submission.isConfirmed && (
                            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Dikonfirmasi
                            </Badge>
                          )}
                          {submission.uploadedBuktiMengetahui && (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              Bukti Mengetahui
                            </Badge>
                          )}
                          {publishedItems.length > 0 && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                              <Rocket className="h-3 w-3 mr-1" />
                              {publishedItems.length} Tayang
                            </Badge>
                          )}
                        </div>

                        {/* Revision Button for Rejected Content */}
                        {hasRejected && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevision(submission)}
                            className="w-full text-orange-700 border-orange-300 hover:bg-orange-50 mb-3"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Revisi Dokumen yang Ditolak
                          </Button>
                        )}

                        {/* Expanded Content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-3 pt-3 border-t border-gray-100"
                            >
                              {/* Content Items Detail */}
                              {contentItems.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                                    <FileText className="h-3 w-3 mr-1" />
                                    Detail Item Konten:
                                  </p>
                                  <div className="space-y-2">
                                    {contentItems.slice(0, 3).map((item, idx) => (
                                      <div
                                        key={item.id}
                                        className="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleViewContent(item, submission)}
                                      >
                                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                                          {getContentTypeIcon(item.jenisKonten)}
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-gray-900 truncate">
                                              {item.nama || `${item.jenisKonten} ${idx + 1}`}
                                            </p>
                                            <p className="text-xs text-gray-500 capitalize">
                                              {item.jenisKonten.replace("-", " ")}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          {getStatusBadge(item.status)}
                                          <ChevronRight className="h-3 w-3 text-gray-400" />
                                        </div>
                                      </div>
                                    ))}
                                    {contentItems.length > 3 && (
                                      <div className="text-center p-2 bg-gray-50 rounded text-xs text-gray-600">
                                        +{contentItems.length - 3} item lainnya
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Action Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(submission)}
                                className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Lihat Detail Lengkap Dokumen
                              </Button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
                })}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* View Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-full h-screen bg-white border-0 shadow-none p-0 m-0 rounded-none">
            {/* Mobile Detail Header */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 sticky top-0 z-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-lg font-bold text-white truncate">
                      {viewingSubmission?.noComtab}
                    </DialogTitle>
                    <DialogDescription className="text-indigo-100 text-sm truncate">
                      {viewingSubmission?.judul}
                    </DialogDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsViewDialogOpen(false)}
                  className="text-white hover:bg-white/20 p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>

            {/* Mobile Detail Content */}
            {viewingSubmission && (
              <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="overview" className="h-full flex flex-col">
                  <div className="px-4 pt-2 bg-white border-b border-gray-200">
                    <TabsList className="grid w-full grid-cols-3 h-10">
                      <TabsTrigger value="overview" className="text-xs">
                        <Info className="h-3 w-3 mr-1" />
                        Info
                      </TabsTrigger>
                      <TabsTrigger value="content" className="text-xs">
                        <Layers className="h-3 w-3 mr-1" />
                        Konten
                      </TabsTrigger>
                      <TabsTrigger value="timeline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Timeline
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                      <div className="p-4 space-y-4 pb-20">
                        <TabsContent value="overview" className="space-y-4 mt-0">
                          {/* Basic Info */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-indigo-600" />
                                Informasi Dasar
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-1 gap-3">
                                <div className="p-3 bg-indigo-50 rounded-lg">
                                  <label className="text-xs font-semibold text-indigo-700 mb-1 block">No Comtab</label>
                                  <p className="font-bold text-indigo-900">{viewingSubmission.noComtab}</p>
                                </div>

                                <div className="p-3 bg-gray-50 rounded-lg">
                                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Judul</label>
                                  <p className="font-semibold text-gray-900">{viewingSubmission.judul}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div className="p-3 bg-green-50 rounded-lg">
                                    <label className="text-xs font-semibold text-green-700 mb-1 block">Tema</label>
                                    <Badge className="bg-green-500 text-white text-xs">
                                      <Target className="h-3 w-3 mr-1" />
                                      {viewingSubmission.tema === "sosial"
                                        ? "🏥 Sosial"
                                        : viewingSubmission.tema === "ekonomi"
                                          ? "💰 Ekonomi"
                                          : viewingSubmission.tema === "lingkungan"
                                            ? "🌱 Lingkungan"
                                            : viewingSubmission.tema}
                                    </Badge>
                                  </div>
                                  <div className="p-3 bg-blue-50 rounded-lg">
                                    <label className="text-xs font-semibold text-blue-700 mb-1 block">Status</label>
                                    <Badge
                                      className={cn(
                                        "text-xs",
                                        getWorkflowStageInfo(viewingSubmission.workflowStage || "submitted").color,
                                      )}
                                    >
                                      {getWorkflowStageInfo(viewingSubmission.workflowStage || "submitted").icon}
                                      <span className="ml-1">
                                        {getWorkflowStageInfo(viewingSubmission.workflowStage || "submitted").label}
                                      </span>
                                    </Badge>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div className="p-3 bg-orange-50 rounded-lg">
                                    <label className="text-xs font-semibold text-orange-700 mb-1 block">Petugas</label>
                                    <p className="text-sm font-semibold text-orange-900 truncate">
                                      {viewingSubmission.petugasPelaksana}
                                    </p>
                                  </div>
                                  <div className="p-3 bg-purple-50 rounded-lg">
                                    <label className="text-xs font-semibold text-purple-700 mb-1 block">
                                      Supervisor
                                    </label>
                                    <p className="text-sm font-semibold text-purple-900 truncate">
                                      {viewingSubmission.supervisor}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Statistics */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base flex items-center">
                                <BarChart3 className="h-4 w-4 mr-2 text-green-600" />
                                Statistik Konten
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                  <p className="text-lg font-bold text-gray-900">
                                    {viewingSubmission.contentItems?.length || 0}
                                  </p>
                                  <p className="text-xs text-gray-600">Total Konten</p>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                  <p className="text-lg font-bold text-green-900">
                                    {viewingSubmission.contentItems?.filter((item) => item.status === "approved")
                                      .length || 0}
                                  </p>
                                  <p className="text-xs text-green-600">Disetujui</p>
                                </div>
                                <div className="text-center p-3 bg-red-50 rounded-lg">
                                  <p className="text-lg font-bold text-red-900">
                                    {viewingSubmission.contentItems?.filter((item) => item.status === "rejected")
                                      .length || 0}
                                  </p>
                                  <p className="text-xs text-red-600">Ditolak</p>
                                </div>
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                  <p className="text-lg font-bold text-blue-900">
                                    {viewingSubmission.contentItems?.filter((item) => item.isTayang === true).length ||
                                      0}
                                  </p>
                                  <p className="text-xs text-blue-600">Tayang</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="content" className="space-y-3 mt-0">
                          {viewingSubmission.contentItems && viewingSubmission.contentItems.length > 0 ? (
                            viewingSubmission.contentItems.map((item, index) => (
                              <Card key={item.id} className="border border-gray-200">
                                <CardHeader className="pb-2">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                                      <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center">
                                        {getContentTypeIcon(item.jenisKonten)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <CardTitle className="text-sm font-bold text-gray-900 truncate">
                                          {index + 1}. {item.nama || "Nama Konten Tidak Ada"}
                                        </CardTitle>
                                        <p className="text-xs text-gray-600 capitalize">
                                          {item.jenisKonten.replace("-", " ")}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                      {getStatusBadge(item.status)}
                                      {item.isTayang !== undefined && (
                                        <Badge
                                          className={cn(
                                            "text-xs",
                                            item.isTayang
                                              ? "bg-blue-100 text-blue-800 border-blue-200"
                                              : "bg-orange-100 text-orange-800 border-orange-200",
                                          )}
                                        >
                                          {item.isTayang ? (
                                            <>
                                              <Globe className="h-3 w-3 mr-1" />
                                              Tayang
                                            </>
                                          ) : (
                                            <>
                                              <EyeOff className="h-3 w-3 mr-1" />
                                              Draft
                                            </>
                                          )}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="grid grid-cols-1 gap-2 text-xs">
                                    <div className="p-2 bg-gray-50 rounded">
                                      <span className="font-semibold text-gray-700">No. Surat:</span>
                                      <span className="ml-2">{item.nomorSurat || "Belum diisi"}</span>
                                    </div>
                                    <div className="p-2 bg-gray-50 rounded">
                                      <span className="font-semibold text-gray-700">Keterangan:</span>
                                      <span className="ml-2">{item.keterangan || "Belum diisi"}</span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 gap-2 text-xs">
                                    <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                                      <span className="font-semibold text-orange-700">Order Masuk:</span>
                                      <span className="font-medium text-orange-900">
                                        {formatDate(item.tanggalOrderMasuk)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                                      <span className="font-semibold text-green-700">Tanggal Jadi:</span>
                                      <span className="font-medium text-green-900">{formatDate(item.tanggalJadi)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                      <span className="font-semibold text-blue-700">Tanggal Tayang:</span>
                                      <span className="font-medium text-blue-900">
                                        {formatDate(item.tanggalTayang)}
                                      </span>
                                    </div>
                                  </div>

                                  {item.alasanPenolakan && item.status === "rejected" && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                      <label className="text-xs font-semibold text-red-700 mb-2 block flex items-center">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Alasan Penolakan:
                                      </label>
                                      <p className="text-xs text-red-900">{item.alasanPenolakan}</p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                            <Card>
                              <CardContent className="p-8 text-center">
                                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada konten</h3>
                                <p className="text-gray-600">Belum ada item konten untuk pengajuan ini.</p>
                              </CardContent>
                            </Card>
                          )}
                        </TabsContent>

                        <TabsContent value="timeline" className="space-y-4 mt-0">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-purple-600" />
                                Timeline Proses
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="space-y-3">
                                <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                                  <Send className="h-5 w-5 text-blue-600" />
                                  <div>
                                    <p className="font-medium text-blue-900">Pengajuan Dikirim</p>
                                    <p className="text-sm text-blue-700">
                                      {formatDate(viewingSubmission.tanggalSubmit)}
                                    </p>
                                  </div>
                                </div>
                                {viewingSubmission.isConfirmed && (
                                  <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <div>
                                      <p className="font-medium text-green-900">Dikonfirmasi Admin</p>
                                      <p className="text-sm text-green-700">
                                        {viewingSubmission.tanggalKonfirmasi || "Tanggal tidak tersedia"}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {viewingSubmission.isOutputValidated && (
                                  <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
                                    <Shield className="h-5 w-5 text-purple-600" />
                                    <div>
                                      <p className="font-medium text-purple-900">Output Divalidasi</p>
                                      <p className="text-sm text-purple-700">
                                        {viewingSubmission.tanggalValidasiOutput || "Tanggal tidak tersedia"}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </div>
                    </ScrollArea>
                  </div>
                </Tabs>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Content View Dialog */}
        <ContentViewDialog
          isOpen={isContentViewOpen}
          onOpenChange={setIsContentViewOpen}
          contentItem={selectedContentItem}
          parentSubmission={viewingSubmission}
        />

        {/* Edit Access Dialog */}
        <Dialog open={isEditAccessDialogOpen} onOpenChange={setIsEditAccessDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Edit className="h-5 w-5 mr-2 text-indigo-600" />
                Akses Edit Pengajuan
              </DialogTitle>
              <DialogDescription>Masukkan No Comtab dan PIN Sandi pengajuan yang ingin Anda edit.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-no-comtab">No Comtab</Label>
                <Input
                  id="edit-no-comtab"
                  value={editAccessData.submissionId}
                  onChange={(e) => setEditAccessData({ ...editAccessData, submissionId: e.target.value })}
                  placeholder="Contoh: 1234/IKP/DDMM/YYYY"
                  className="focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-pin">PIN Sandi</Label>
                <Input
                  id="edit-pin"
                  type="password"
                  value={editAccessData.pin}
                  onChange={(e) => setEditAccessData({ ...editAccessData, pin: e.target.value })}
                  placeholder="PIN 4 digit"
                  className="focus:border-indigo-500"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditAccessDialogOpen(false)}>
                Batal
              </Button>
              <Button
                onClick={handleEditAccess}
                disabled={isValidatingEdit}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isValidatingEdit ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Memvalidasi...
                  </>
                ) : (
                  "Akses Edit"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="fixed top-4 right-4 z-50"
            >
              <div
                className={cn(
                  "flex items-center space-x-3 p-4 rounded-lg shadow-lg backdrop-blur-sm border",
                  toastMessage.type === "success" && "bg-green-500/90 text-white border-green-400",
                  toastMessage.type === "error" && "bg-red-500/90 text-white border-red-400",
                  toastMessage.type === "info" && "bg-blue-500/90 text-white border-blue-400",
                )}
              >
                {toastMessage.type === "success" && <CheckCircle className="h-5 w-5" />}
                {toastMessage.type === "error" && <XCircle className="h-5 w-5" />}
                {toastMessage.type === "info" && <Bell className="h-5 w-5" />}
                <span className="font-medium">{toastMessage.message}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setToastMessage(null)}
                  className="ml-auto text-white hover:bg-white/20 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
