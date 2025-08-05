"use client"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Users,
  Sparkles,
  Globe,
  Hash,
  Video,
  Mic,
  ImageIcon,
  Eye,
  Shield,
  ChevronLeft,
  AudioWaveform,
  Layers,
  Zap,
  PlayCircle,
  PauseCircle,
  AlertCircle,
  FileCheck,
  Send,
  ChevronRight,
  Target,
  Rocket,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import PreviewModal from "./preview-modal"
import { loadSubmissionsFromStorage, saveSubmissionsToStorage } from "@/lib/utils"

// Helper function to determine workflow stage
const getWorkflowStage = (submission: any) => {
  if (!submission.isConfirmed) return "submitted"

  const contentItems = submission.contentItems || []
  if (contentItems.length === 0) return "review"

  const allReviewed = contentItems.every((item: any) => item.status === "approved" || item.status === "rejected")
  if (!allReviewed) return "review"

  const hasApprovedItems = contentItems.some((item: any) => item.status === "approved")
  if (!hasApprovedItems) return "completed"

  const approvedItems = contentItems.filter((item: any) => item.status === "approved")
  const allValidated = approvedItems.every((item: any) => item.isTayang !== undefined)

  if (!allValidated) return "validation"
  return "completed"
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
  workflowStage?: "submitted" | "review" | "validation" | "completed"
  tanggalReview?: string
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
  tanggalOrderMasuk: Date | undefined
  tanggalJadi: Date | undefined
  tanggalTayang: Date | undefined
  keterangan: string
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
}

interface MobileContentReviewDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  submission: Submission | null
  contentItem?: ContentItem | null
  onUpdate: (submissions: Submission[]) => void
  onToast: (message: string, type: "success" | "error" | "info") => void
}

// Helper functions
const getContentTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "video":
      return <PlayCircle className="h-4 w-4 text-red-500" />
    case "audio":
      return <PauseCircle className="h-4 w-4 text-purple-500" />
    case "fotografis":
      return <Eye className="h-4 w-4 text-blue-500" />
    case "infografis":
      return <FileText className="h-4 w-4 text-green-500" />
    case "naskah-berita":
      return <FileText className="h-4 w-4 text-orange-500" />
    case "bumper":
      return <Zap className="h-4 w-4 text-indigo-500" />
    default:
      return <FileText className="h-4 w-4 text-gray-500" />
  }
}

const getMediaIcon = (media: string) => {
  switch (media) {
    case "website":
      return <Globe className="h-3 w-3 text-blue-500" />
    case "instagram":
      return <ImageIcon className="h-3 w-3 text-pink-500" />
    case "youtube":
      return <Video className="h-3 w-3 text-red-500" />
    case "facebook":
      return <Users className="h-3 w-3 text-blue-600" />
    case "twitter":
      return <Hash className="h-3 w-3 text-blue-400" />
    case "radio":
      return <Mic className="h-3 w-3 text-green-500" />
    case "tv":
    case "televisi":
      return <Video className="h-3 w-3 text-purple-500" />
    default:
      return <Globe className="h-3 w-3 text-gray-500" />
  }
}

const formatDate = (date?: Date | string): string => {
  if (!date) return "N/A"
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return "N/A"
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

// Helper function to get file display name
const getFileDisplayName = (file: any): string => {
  if (!file) return "Tidak ada file"
  if (typeof file === "string") return file.length > 30 ? file.substring(0, 30) + "..." : file
  if (file.name) return file.name
  return "File tidak dikenal"
}

// Helper function to get preview URL from file
const getPreviewUrl = (file: any): string | null => {
  if (!file) return null

  if (typeof file === "string") {
    if (file.startsWith("http://") || file.startsWith("https://")) {
      return file
    }
    if (file.startsWith("data:")) {
      return file
    }
    return file
  }

  if (file && typeof file === "object" && file.url) {
    return file.url
  }

  if (file && typeof file === "object" && file.base64) {
    const base64Data = file.base64
    if (base64Data.startsWith("data:")) {
      return base64Data
    }
    const mimeType = file.type || "application/octet-stream"
    return `data:${mimeType};base64,${base64Data}`
  }

  const isBrowserFile = (obj: any): boolean => {
    return (
      obj &&
      typeof obj === "object" &&
      typeof obj.name === "string" &&
      typeof obj.size === "number" &&
      typeof obj.type === "string" &&
      typeof obj.lastModified === "number" &&
      typeof obj.slice === "function"
    )
  }

  if (isBrowserFile(file) && typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
    try {
      return URL.createObjectURL(file)
    } catch (error) {
      console.error("Failed to create object URL:", error)
      return null
    }
  }

  if (file && typeof file === "object" && file.preview) {
    return file.preview
  }

  return null
}

// Helper function to get file type for preview
const getFileType = (file: any): string => {
  if (!file) return "application/octet-stream"

  const isBrowserFile = (obj: any): boolean => {
    return (
      obj &&
      typeof obj === "object" &&
      typeof obj.name === "string" &&
      typeof obj.size === "number" &&
      typeof obj.type === "string" &&
      typeof obj.lastModified === "number" &&
      typeof obj.slice === "function"
    )
  }

  if (isBrowserFile(file) && file.type) {
    return file.type
  }

  if (file && typeof file === "object" && file.type) {
    return file.type
  }

  if (typeof file === "string") {
    const extension = file.split(".").pop()?.toLowerCase()
    const mimeTypes: Record<string, string> = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      mp4: "video/mp4",
      webm: "video/webm",
      mov: "video/quicktime",
      mp3: "audio/mpeg",
      wav: "audio/wav",
      ogg: "audio/ogg",
      txt: "text/plain",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
    return mimeTypes[extension || ""] || "text/html"
  }

  return "application/octet-stream"
}

export function MobileContentReviewDialog({
  isOpen,
  onOpenChange,
  submission,
  contentItem,
  onUpdate,
  onToast,
}: MobileContentReviewDialogProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [reviewDecisions, setReviewDecisions] = useState<Record<string, "approved" | "rejected" | null>>({})
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReviewSummary, setShowReviewSummary] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    files: false,
    review: true,
  })

  // Preview modal state
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    file: null as any,
    url: "",
    type: "",
    fileName: "",
    title: "",
  })

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
      setReviewDecisions({})
      setRejectionReasons({})
      setShowReviewSummary(false)
      setShowConfirmation(false)
      setExpandedSections({ basic: true, files: false, review: true })
      setPreviewModal({ isOpen: false, file: null, url: "", type: "", fileName: "", title: "" })
    }
  }, [isOpen])

  if (!submission) return null

  const contentItems = submission.contentItems?.filter((item) => item.status === "pending") || []
  const currentItem = contentItem || contentItems[currentStep]

  if (!currentItem && contentItems.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm mx-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-6"
          >
            <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900 mb-2">Tidak Ada Konten</DialogTitle>
            <p className="text-gray-600 text-sm mb-4">
              Semua konten sudah direview atau belum ada konten yang perlu direview.
            </p>
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Tutup
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    )
  }

  const reviewItem = contentItems[currentStep] || contentItems[0]
  const currentDecision = reviewDecisions[reviewItem.id]
  const currentRejectionReason = rejectionReasons[reviewItem.id] || ""

  // Check if all content items have been reviewed
  const allItemsReviewed = contentItems.every(
    (item) => reviewDecisions[item.id] !== undefined && reviewDecisions[item.id] !== null,
  )

  // Check if any rejected items have rejection reasons
  const rejectedItemsHaveReasons = contentItems
    .filter((item) => reviewDecisions[item.id] === "rejected")
    .every((item) => rejectionReasons[item.id]?.trim())

  const canSubmit = allItemsReviewed && rejectedItemsHaveReasons

  const getReviewedCount = () => {
    return Object.values(reviewDecisions).filter((d) => d !== null).length
  }

  // Handle preview file function
  const handlePreviewFile = (file: any, title: string) => {
    try {
      const url = getPreviewUrl(file)
      const fileType = getFileType(file)
      const fileName = getFileDisplayName(file)

      setPreviewModal({
        isOpen: true,
        file: file,
        url: url || "",
        type: fileType,
        fileName: fileName,
        title: title,
      })

      if (!file) {
        onToast("File tidak ditemukan", "error")
      } else if (!url && file) {
        onToast("File ditemukan tetapi tidak dapat ditampilkan", "info")
      }
    } catch (error) {
      console.error("Error opening file preview:", error)
      onToast("Terjadi kesalahan saat membuka preview file", "error")
    }
  }

  // Handle review decision change
  const handleReviewDecisionChange = (decision: "approved" | "rejected") => {
    setReviewDecisions((prev) => ({
      ...prev,
      [reviewItem.id]: decision,
    }))

    if (decision === "approved") {
      setRejectionReasons((prev) => ({
        ...prev,
        [reviewItem.id]: "",
      }))
    }
  }

  // Handle rejection reason change
  const handleRejectionReasonChange = (reason: string) => {
    setRejectionReasons((prev) => ({
      ...prev,
      [reviewItem.id]: reason,
    }))
  }

  // Navigate to next content item
  const goToNextItem = () => {
    if (currentStep < contentItems.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Navigate to previous content item
  const goToPreviousItem = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canGoNext = () => {
    return currentStep < contentItems.length - 1
  }

  const canGoPrevious = () => {
    return currentStep > 0
  }

  const isCurrentItemValid = () => {
    const decision = reviewDecisions[reviewItem.id]
    if (!decision) return false
    if (decision === "rejected" && !rejectionReasons[reviewItem.id]?.trim()) return false
    return true
  }

  // Handle review submission
  const handleReviewSubmit = async () => {
    if (!canSubmit) {
      onToast("Harap review semua konten dan berikan alasan untuk konten yang ditolak", "error")
      return
    }

    setShowReviewSummary(true)
  }

  // Handle confirmed review submission
  const handleConfirmedReviewSubmit = async () => {
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const submissions = loadSubmissionsFromStorage()
    const updatedSubmissions = submissions.map((sub: any) => {
      if (sub.id === submission.id) {
        const updatedContentItems = sub.contentItems?.map((contentItem: any) => {
          const decision = reviewDecisions[contentItem.id]
          if (decision) {
            return {
              ...contentItem,
              status: decision,
              alasanPenolakan: decision === "rejected" ? rejectionReasons[contentItem.id] : undefined,
              tanggalDiproses: new Date().toLocaleDateString("id-ID"),
              diprosesoleh: "Admin",
            }
          }
          return contentItem
        })

        const updatedSubmission = {
          ...sub,
          contentItems: updatedContentItems,
          lastModified: new Date(),
          tanggalReview: new Date().toISOString(),
        }
        updatedSubmission.workflowStage = getWorkflowStage(updatedSubmission)

        return updatedSubmission
      }
      return sub
    })

    saveSubmissionsToStorage(updatedSubmissions)
    onUpdate(updatedSubmissions)

    const approvedCount = Object.values(reviewDecisions).filter((d) => d === "approved").length
    const rejectedCount = Object.values(reviewDecisions).filter((d) => d === "rejected").length

    onToast(`Review selesai! ${approvedCount} konten disetujui, ${rejectedCount} konten ditolak`, "success")
    setIsSubmitting(false)
    setShowReviewSummary(false)

    if (approvedCount > 0) {
      setShowConfirmation(true)
    } else {
      onOpenChange(false)
    }
  }

  // Handle document confirmation
  const handleConfirmDocument = async () => {
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const submissions = loadSubmissionsFromStorage()
    const updatedSubmissions = submissions.map((sub: any) => {
      if (sub.id === submission.id) {
        return {
          ...sub,
          workflowStage: "validation",
          lastModified: new Date(),
        }
      }
      return sub
    })

    saveSubmissionsToStorage(updatedSubmissions)
    onUpdate(updatedSubmissions)

    onToast("Review berhasil diselesaikan! Dokumen siap untuk tahap validasi.", "success")
    setIsSubmitting(false)
    onOpenChange(false)
  }

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Show review summary confirmation
  if (showReviewSummary) {
    const approvedItems = contentItems.filter((item) => reviewDecisions[item.id] === "approved")
    const rejectedItems = contentItems.filter((item) => reviewDecisions[item.id] === "rejected")

    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm mx-4">
          <ScrollArea className="max-h-[80vh]">
            <div className="p-2 space-y-4">
              {/* Header */}
              <div className="text-center">
                <div className="mx-auto mb-3 p-2 bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center">
                  <FileCheck className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-blue-600 mb-1">Konfirmasi Review</h3>
                <p className="text-xs text-gray-600">Periksa hasil review sebelum menyimpan</p>
              </div>

              {/* Summary Statistics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                  <div className="w-8 h-8 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-xs font-medium text-green-700 mb-1">Disetujui</p>
                  <p className="text-xl font-bold text-green-800">{approvedItems.length}</p>
                </div>

                <div className="bg-red-50 rounded-lg p-3 text-center border border-red-200">
                  <div className="w-8 h-8 mx-auto bg-red-500 rounded-full flex items-center justify-center mb-2">
                    <XCircle className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-xs font-medium text-red-700 mb-1">Ditolak</p>
                  <p className="text-xl font-bold text-red-800">{rejectedItems.length}</p>
                </div>
              </div>

              {/* Content List */}
              <div className="bg-gray-50 rounded-lg p-3 border">
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1 text-blue-600" />
                  Detail Review ({contentItems.length} konten)
                </h4>

                <ScrollArea className="max-h-24">
                  <div className="space-y-2">
                    {contentItems.map((item) => {
                      const decision = reviewDecisions[item.id]
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 bg-white rounded border text-xs"
                        >
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            {getContentTypeIcon(item.jenisKonten)}
                            <span className="font-medium text-gray-900 truncate">{item.nama}</span>
                          </div>
                          <Badge
                            className={cn(
                              "text-xs px-2 py-0",
                              decision === "approved"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-red-100 text-red-800 border-red-200",
                            )}
                          >
                            {decision === "approved" ? "✓" : "✗"}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewSummary(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Kembali
                </Button>

                <Button
                  onClick={handleConfirmedReviewSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-1" />
                      Konfirmasi
                    </>
                  )}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    )
  }

  // Show confirmation step
  if (showConfirmation) {
    const approvedItems = contentItems.filter((item) => reviewDecisions[item.id] === "approved")
    const rejectedCount = Object.values(reviewDecisions).filter((d) => d === "rejected").length

    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm mx-4">
          <div className="p-4 space-y-4 text-center">
            <div className="mx-auto mb-3 p-3 bg-blue-500 rounded-full w-16 h-16 flex items-center justify-center">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-blue-600 mb-1">Review Selesai!</h3>
            <p className="text-sm text-gray-600">Dokumen {submission.noComtab} siap untuk validasi</p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs font-medium text-green-700">Disetujui</p>
                <p className="text-2xl font-bold text-green-800">{approvedItems.length}</p>
              </div>

              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <XCircle className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs font-medium text-red-700">Ditolak</p>
                <p className="text-2xl font-bold text-red-800">{rejectedCount}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                disabled={isSubmitting}
                className="px-4 py-2"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Kembali
              </Button>

              <Button
                onClick={handleConfirmDocument}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
              >
                <Rocket className="h-4 w-4 mr-1" />
                Lanjutkan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm h-[95vh] overflow-hidden mx-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full flex flex-col"
          >
            {/* Header */}
            <DialogHeader className="border-b pb-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold text-blue-600">Review Konten</DialogTitle>
                    <DialogDescription className="text-xs text-gray-600">{submission.noComtab}</DialogDescription>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-2 py-1">
                  {currentStep + 1}/{contentItems.length}
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-600 mb-2">
                  <span>Progress Review</span>
                  <span className={cn("font-bold", canSubmit ? "text-green-600" : "text-blue-600")}>
                    {getReviewedCount()}/{contentItems.length}
                    {canSubmit && <span className="ml-1 text-green-600">✓</span>}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(getReviewedCount() / contentItems.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      "h-2 rounded-full transition-all duration-500",
                      canSubmit ? "bg-green-500" : "bg-blue-500",
                    )}
                  />
                </div>
              </div>
            </DialogHeader>

            {/* Content */}
            <div className="flex-1 overflow-hidden min-h-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {/* Current Content Item Header */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-2">
                        {getContentTypeIcon(reviewItem.jenisKonten)}
                        <div>
                          <CardTitle className="text-sm text-gray-900">{reviewItem.nama}</CardTitle>
                          <p className="text-xs text-gray-600 capitalize">{reviewItem.jenisKonten.replace("-", " ")}</p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Basic Information - Collapsible */}
                  <Card>
                    <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection("basic")}>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-blue-600" />
                          Informasi Dasar
                        </CardTitle>
                        {expandedSections.basic ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </CardHeader>
                    <AnimatePresence>
                      {expandedSections.basic && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CardContent className="pt-0 space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs font-medium text-gray-600">Nomor Surat</Label>
                                <p className="text-xs text-gray-900 bg-gray-50 p-2 rounded mt-1">
                                  {reviewItem.nomorSurat || "Tidak ada"}
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-gray-600">Tanggal Order</Label>
                                <p className="text-xs text-gray-900 bg-gray-50 p-2 rounded mt-1">
                                  {formatDate(reviewItem.tanggalOrderMasuk)}
                                </p>
                              </div>
                            </div>

                            <div>
                              <Label className="text-xs font-medium text-gray-600">Media Pemerintah</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {reviewItem.mediaPemerintah?.map((media, index) => (
                                  <Badge
                                    key={index}
                                    className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-1 py-0"
                                  >
                                    {getMediaIcon(media)}
                                    <span className="ml-1 capitalize">{media}</span>
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label className="text-xs font-medium text-gray-600">Media Massa</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {reviewItem.mediaMassa?.map((media, index) => (
                                  <Badge
                                    key={index}
                                    className="bg-purple-100 text-purple-800 border-purple-200 text-xs px-1 py-0"
                                  >
                                    {getMediaIcon(media)}
                                    <span className="ml-1 capitalize">{media}</span>
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {reviewItem.narasiText && (
                              <div>
                                <Label className="text-xs font-medium text-gray-600">Narasi</Label>
                                <div className="bg-gray-50 p-2 rounded mt-1 border max-h-20 overflow-y-auto">
                                  <p className="text-xs text-gray-900 whitespace-pre-wrap">{reviewItem.narasiText}</p>
                                </div>
                              </div>
                            )}

                            {reviewItem.keterangan && (
                              <div>
                                <Label className="text-xs font-medium text-gray-600">Keterangan</Label>
                                <div className="bg-gray-50 p-2 rounded mt-1 border max-h-20 overflow-y-auto">
                                  <p className="text-xs text-gray-900 whitespace-pre-wrap">{reviewItem.keterangan}</p>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>

                  {/* Files Section - Collapsible */}
                  <Card>
                    <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection("files")}>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center">
                          <Layers className="h-4 w-4 mr-2 text-green-600" />
                          File & Dokumen
                        </CardTitle>
                        {expandedSections.files ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </CardHeader>
                    <AnimatePresence>
                      {expandedSections.files && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CardContent className="pt-0 space-y-3">
                            {/* File sections with compact display */}
                            {(reviewItem.narasiFile || reviewItem.suratFile || reviewItem.sourceNarasi?.length > 0) && (
                              <div>
                                <Label className="text-xs font-medium text-gray-600 mb-2 block">File Narasi</Label>
                                <div className="space-y-1">
                                  {reviewItem.narasiFile && (
                                    <div
                                      className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200 cursor-pointer hover:bg-blue-100"
                                      onClick={() => handlePreviewFile(reviewItem.narasiFile, "File Narasi")}
                                    >
                                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                                        <FileText className="h-3 w-3 text-blue-600 flex-shrink-0" />
                                        <span className="text-xs text-gray-900 truncate">
                                          {getFileDisplayName(reviewItem.narasiFile)}
                                        </span>
                                      </div>
                                      <Eye className="h-3 w-3 text-blue-600 flex-shrink-0" />
                                    </div>
                                  )}
                                  {reviewItem.suratFile && (
                                    <div
                                      className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200 cursor-pointer hover:bg-blue-100"
                                      onClick={() => handlePreviewFile(reviewItem.suratFile, "File Surat")}
                                    >
                                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                                        <FileText className="h-3 w-3 text-blue-600 flex-shrink-0" />
                                        <span className="text-xs text-gray-900 truncate">
                                          {getFileDisplayName(reviewItem.suratFile)}
                                        </span>
                                      </div>
                                      <Eye className="h-3 w-3 text-blue-600 flex-shrink-0" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Audio Files */}
                            {(reviewItem.audioDubbingFile || reviewItem.audioBacksoundFile) && (
                              <div>
                                <Label className="text-xs font-medium text-gray-600 mb-2 block">File Audio</Label>
                                <div className="space-y-1">
                                  {reviewItem.audioDubbingFile && (
                                    <div
                                      className="flex items-center justify-between p-2 bg-purple-50 rounded border border-purple-200 cursor-pointer hover:bg-purple-100"
                                      onClick={() => handlePreviewFile(reviewItem.audioDubbingFile, "Audio Dubbing")}
                                    >
                                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                                        <AudioWaveform className="h-3 w-3 text-purple-600 flex-shrink-0" />
                                        <span className="text-xs text-gray-900 truncate">
                                          {getFileDisplayName(reviewItem.audioDubbingFile)}
                                        </span>
                                      </div>
                                      <Eye className="h-3 w-3 text-purple-600 flex-shrink-0" />
                                    </div>
                                  )}
                                  {reviewItem.audioBacksoundFile && (
                                    <div
                                      className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200 cursor-pointer hover:bg-green-100"
                                      onClick={() =>
                                        handlePreviewFile(reviewItem.audioBacksoundFile, "Audio Backsound")
                                      }
                                    >
                                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                                        <Mic className="h-3 w-3 text-green-600 flex-shrink-0" />
                                        <span className="text-xs text-gray-900 truncate">
                                          {getFileDisplayName(reviewItem.audioBacksoundFile)}
                                        </span>
                                      </div>
                                      <Eye className="h-3 w-3 text-green-600 flex-shrink-0" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Result Files */}
                            {(reviewItem.hasilProdukFile || reviewItem.hasilProdukLink) && (
                              <div>
                                <Label className="text-xs font-medium text-gray-600 mb-2 block">Hasil Produksi</Label>
                                <div className="space-y-1">
                                  {reviewItem.hasilProdukFile && (
                                    <div
                                      className="flex items-center justify-between p-2 bg-indigo-50 rounded border border-indigo-200 cursor-pointer hover:bg-indigo-100"
                                      onClick={() => handlePreviewFile(reviewItem.hasilProdukFile, "Hasil Produksi")}
                                    >
                                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                                        <Sparkles className="h-3 w-3 text-indigo-600 flex-shrink-0" />
                                        <span className="text-xs text-gray-900 truncate">
                                          {getFileDisplayName(reviewItem.hasilProdukFile)}
                                        </span>
                                      </div>
                                      <Eye className="h-3 w-3 text-indigo-600 flex-shrink-0" />
                                    </div>
                                  )}
                                  {reviewItem.hasilProdukLink && (
                                    <div
                                      className="flex items-center justify-between p-2 bg-indigo-50 rounded border border-indigo-200 cursor-pointer hover:bg-indigo-100"
                                      onClick={() =>
                                        handlePreviewFile(reviewItem.hasilProdukLink, "Link Hasil Produksi")
                                      }
                                    >
                                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                                        <Globe className="h-3 w-3 text-indigo-600 flex-shrink-0" />
                                        <span className="text-xs text-gray-900 truncate">
                                          {getFileDisplayName(reviewItem.hasilProdukLink)}
                                        </span>
                                      </div>
                                      <Eye className="h-3 w-3 text-indigo-600 flex-shrink-0" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>

                  {/* Review Decision Section */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-blue-600" />
                        Keputusan Review
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Decision Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          onClick={() => handleReviewDecisionChange("approved")}
                          className={cn(
                            "h-12 text-xs transition-all duration-300",
                            currentDecision === "approved"
                              ? "bg-green-500 text-white shadow-lg"
                              : "bg-white text-green-700 border-2 border-green-300 hover:bg-green-50",
                          )}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Setujui
                        </Button>

                        <Button
                          onClick={() => handleReviewDecisionChange("rejected")}
                          className={cn(
                            "h-12 text-xs transition-all duration-300",
                            currentDecision === "rejected"
                              ? "bg-red-500 text-white shadow-lg"
                              : "bg-white text-red-700 border-2 border-red-300 hover:bg-red-50",
                          )}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Tolak
                        </Button>
                      </div>

                      {/* Rejection Reason */}
                      <AnimatePresence>
                        {currentDecision === "rejected" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-2"
                          >
                            <Label className="text-xs font-semibold text-red-700">
                              Alasan Penolakan <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                              value={currentRejectionReason}
                              onChange={(e) => handleRejectionReasonChange(e.target.value)}
                              placeholder="Jelaskan alasan mengapa konten ini ditolak..."
                              className="min-h-[80px] text-xs border-red-200 focus:border-red-400 focus:ring-red-200"
                            />
                            {currentDecision === "rejected" && !currentRejectionReason.trim() && (
                              <p className="text-xs text-red-600 flex items-center">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Alasan penolakan wajib diisi
                              </p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Decision Status */}
                      <AnimatePresence>
                        {currentDecision && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className={cn(
                              "p-3 rounded-lg border-2 flex items-center space-x-2",
                              currentDecision === "approved"
                                ? "bg-green-50 border-green-200"
                                : "bg-red-50 border-red-200",
                            )}
                          >
                            {currentDecision === "approved" ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            <div>
                              <p
                                className={cn(
                                  "font-semibold text-xs",
                                  currentDecision === "approved" ? "text-green-800" : "text-red-800",
                                )}
                              >
                                {currentDecision === "approved" ? "Konten Disetujui" : "Konten Ditolak"}
                              </p>
                              <p
                                className={cn(
                                  "text-xs",
                                  currentDecision === "approved" ? "text-green-700" : "text-red-700",
                                )}
                              >
                                {currentDecision === "approved"
                                  ? "Akan dilanjutkan ke validasi"
                                  : "Akan dikembalikan untuk perbaikan"}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </div>

            {/* Bottom Navigation */}
            <div className="border-t p-4 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <Button
                  variant="outline"
                  onClick={goToPreviousItem}
                  disabled={!canGoPrevious()}
                  className="px-3 py-2 text-xs bg-transparent"
                >
                  <ChevronLeft className="h-3 w-3 mr-1" />
                  Sebelumnya
                </Button>

                <div className="text-xs text-gray-600 text-center">
                  <span className="font-medium">
                    {currentStep + 1} dari {contentItems.length}
                  </span>
                  {isCurrentItemValid() && <span className="ml-2 text-green-600 font-medium">✓ Selesai</span>}
                </div>

                <Button
                  onClick={goToNextItem}
                  disabled={!canGoNext()}
                  className="px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Selanjutnya
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>

              {/* Submit Button */}
              <AnimatePresence>
                {canSubmit && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      onClick={handleReviewSubmit}
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                    >
                      <FileCheck className="h-4 w-4 mr-2" />
                      Konfirmasi Review ({getReviewedCount()}/{contentItems.length})
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isCurrentItemValid() && (
                <p className="text-xs text-orange-600 flex items-center justify-center mt-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Harap buat keputusan review
                </p>
              )}
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal((prev) => ({ ...prev, isOpen: false }))}
        file={previewModal.file}
        url={previewModal.url}
        type={previewModal.type}
        fileName={previewModal.fileName}
        title={previewModal.title}
      />
    </>
  )
}
