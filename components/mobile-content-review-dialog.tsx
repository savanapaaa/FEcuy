"use client"
import { useState, useEffect } from "react"
import Swal from 'sweetalert2'
import { MobileConfirmationDialog } from "./mobile-confirmation-dialog"
import { showMobileReviewSuccessAlert, showDocumentReviewedSuccessAlert, showSimpleDocumentReviewedAlert, showAllRejectedAlert, showSaveReviewConfirmation, showErrorAlert, showConfirmationAlert } from '@/lib/sweetalert-utils'

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

// Custom CSS for mobile scroll fix
const scrollCSS = `
  .mobile-dialog-scroll {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    scroll-behavior: smooth;
  }
  .mobile-dialog-scroll::-webkit-scrollbar {
    width: 4px;
  }
  .mobile-dialog-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .mobile-dialog-scroll::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.5);
    border-radius: 2px;
  }
  .mobile-dialog-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(156, 163, 175, 0.8);
  }
`

// Inject CSS
if (typeof document !== 'undefined') {
  const styleElement = document.getElementById('mobile-dialog-scroll-style')
  if (!styleElement) {
    const style = document.createElement('style')
    style.id = 'mobile-dialog-scroll-style'
    style.textContent = scrollCSS
    document.head.appendChild(style)
  }
}

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
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
      setShowConfirmDialog(false)
      setExpandedSections({ basic: true, files: false, review: true })
      setPreviewModal({ isOpen: false, file: null, url: "", type: "", fileName: "", title: "" })
      
      // Listen for SweetAlert events to prevent z-index conflicts
      const handleSwalOpen = () => {
        const dialogElements = document.querySelectorAll('[data-radix-portal]')
        dialogElements.forEach(el => {
          (el as HTMLElement).style.pointerEvents = 'none'
        })
      }
      
      const handleSwalClose = () => {
        const dialogElements = document.querySelectorAll('[data-radix-portal]')
        dialogElements.forEach(el => {
          (el as HTMLElement).style.pointerEvents = 'auto'
        })
      }
      
      // Check if SweetAlert is currently open and monitor changes
      const observer = new MutationObserver(() => {
        const swalContainer = document.querySelector('.swal2-container')
        if (swalContainer) {
          handleSwalOpen()
        } else {
          handleSwalClose()
        }
      })
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
      })
      
      return () => {
        observer.disconnect()
        handleSwalClose()
      }
    }
  }, [isOpen])

  if (!submission) return null

  const contentItems = submission.contentItems?.filter((item) => item.status === "pending") || []
  const currentItem = contentItem || contentItems[currentStep]

  if (!currentItem && contentItems.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm w-[95vw] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
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
      await Swal.fire({
        title: "Review Belum Lengkap",
        text: "Harap review semua konten dan berikan alasan untuk konten yang ditolak",
        icon: "warning",
        confirmButtonText: "OK",
        customClass: {
          popup: "rounded-2xl",
          confirmButton: "rounded-xl px-6 py-2 bg-gradient-to-r from-yellow-500 to-amber-600",
        },
      })
      return
    }

    // Calculate review statistics for confirmation
    const approvedCount = Object.values(reviewDecisions).filter((d) => d === "approved").length
    const rejectedCount = Object.values(reviewDecisions).filter((d) => d === "rejected").length
    const totalItems = contentItems.length

    // Show confirmation dialog with review summary
    const result = await Swal.fire({
      title: "Konfirmasi Review",
      html: `
        <div class="text-left space-y-3">
          <p class="text-gray-700 mb-4">Apakah Anda yakin ingin menyimpan hasil review ini?</p>
          <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
            <div class="flex items-center space-x-2 text-green-700">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              <span class="font-medium">${approvedCount} Konten Disetujui</span>
            </div>
          </div>
          <div class="bg-gradient-to-r from-red-50 to-rose-50 p-3 rounded-lg border border-red-200">
            <div class="flex items-center space-x-2 text-red-700">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
              <span class="font-medium">${rejectedCount} Konten Ditolak</span>
            </div>
          </div>
          <div class="text-sm text-gray-600 mt-3">
            Total ${totalItems} konten telah direview
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Simpan Review",
      cancelButtonText: "Batal",
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "rounded-xl px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600",
        cancelButton: "rounded-xl px-6 py-2 bg-gradient-to-r from-gray-400 to-gray-500",
        htmlContainer: "text-sm",
      },
      buttonsStyling: false,
    })
    
    if (result.isConfirmed) {
      // Proceed with review submission
      setShowReviewSummary(true)
    }
  }

  // Handle confirmation from custom dialog
  const handleConfirmReview = async () => {
    setShowReviewSummary(true)
  }

  // Handle confirmed review submission
  const handleConfirmedReviewSubmit = async () => {
    // Show loading
    Swal.fire({
      title: "Memproses Review",
      text: "Mohon tunggu sebentar...",
      icon: "info",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      customClass: {
        popup: "rounded-2xl",
      },
      didOpen: () => {
        Swal.showLoading()
      },
    })

    setIsSubmitting(true)

    try {
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
      const totalItems = contentItems.length

      // Show success message with consistent styling
      await Swal.fire({
        title: "Review Berhasil!",
        html: `
          <div class="text-center space-y-4">
            <div class="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <p class="text-gray-700 text-base">Review konten telah diselesaikan dengan hasil:</p>
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
              <div class="flex justify-between items-center text-sm">
                <div class="flex items-center space-x-2 text-green-600">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="font-medium">${approvedCount} Konten Disetujui</span>
                </div>
                <div class="flex items-center space-x-2 text-red-600">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="font-medium">${rejectedCount} Konten Ditolak</span>
                </div>
              </div>
            </div>
            ${approvedCount > 0 ? 
              '<div class="bg-gradient-to-r from-yellow-50 to-amber-50 p-3 rounded-lg border border-yellow-200 mt-3"><p class="text-yellow-700 text-sm font-medium">Konten yang disetujui akan dilanjutkan ke tahap validasi</p></div>' : 
              '<div class="bg-gradient-to-r from-gray-50 to-slate-50 p-3 rounded-lg border border-gray-200 mt-3"><p class="text-gray-700 text-sm font-medium">Semua konten ditolak, proses review selesai</p></div>'
            }
          </div>
        `,
        icon: "success",
        confirmButtonText: approvedCount > 0 ? "Lanjut ke Validasi" : "Tutup",
        timer: 5000,
        timerProgressBar: true,
        customClass: {
          popup: "rounded-2xl",
          confirmButton: "rounded-xl px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600",
          htmlContainer: "text-sm",
        },
      })

      setIsSubmitting(false)
      setShowReviewSummary(false)

      if (approvedCount > 0) {
        setShowConfirmation(true)
      } else {
        // Close dialog and go back to review list
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      
      await Swal.fire({
        title: "Terjadi Kesalahan",
        text: "Gagal menyimpan review. Silakan coba lagi.",
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          popup: "rounded-2xl",
          confirmButton: "rounded-xl px-6 py-2 bg-gradient-to-r from-red-500 to-rose-600",
        },
      })
      
      setIsSubmitting(false)
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
        <DialogContent className="max-w-sm w-[95vw] max-h-[90vh] overflow-hidden fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="max-h-[80vh] overflow-y-auto mobile-dialog-scroll">
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

                <div className="max-h-24 overflow-y-auto">
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
                </div>
              </div>

              {/* Simple Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewSummary(false)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Kembali
                </Button>

                <Button
                  onClick={handleConfirmedReviewSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </div>
          </div>
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
        <DialogContent className="max-w-sm w-[95vw] max-h-[90vh] overflow-hidden fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="p-4 space-y-4 text-center max-h-[80vh] overflow-y-auto mobile-dialog-scroll">
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

            {/* Simple Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Kembali
              </Button>

              <Button
                onClick={handleConfirmDocument}
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
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
        <DialogContent className="max-w-sm w-[95vw] max-h-[90vh] overflow-hidden fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full flex flex-col max-h-[85vh]"
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
              <div className="h-full overflow-y-auto mobile-dialog-scroll">
                <div className="p-4 space-y-4 pb-6">
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
                  <Card className="border-gray-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-900">Keputusan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Simple Decision Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => handleReviewDecisionChange("approved")}
                          variant={currentDecision === "approved" ? "default" : "outline"}
                          className={cn(
                            "h-10 text-sm",
                            currentDecision === "approved" 
                              ? "bg-green-600 hover:bg-green-700 text-white" 
                              : "border-green-300 text-green-700 hover:bg-green-50"
                          )}
                        >
                          ✓ Setujui
                        </Button>

                        <Button
                          onClick={() => handleReviewDecisionChange("rejected")}
                          variant={currentDecision === "rejected" ? "default" : "outline"}
                          className={cn(
                            "h-10 text-sm",
                            currentDecision === "rejected" 
                              ? "bg-red-600 hover:bg-red-700 text-white" 
                              : "border-red-300 text-red-700 hover:bg-red-50"
                          )}
                        >
                          ✗ Tolak
                        </Button>
                      </div>

                      {/* Simple Rejection Reason */}
                      {currentDecision === "rejected" && (
                        <div className="space-y-2">
                          <Label className="text-sm text-red-700">Alasan penolakan</Label>
                          <Textarea
                            value={currentRejectionReason}
                            onChange={(e) => handleRejectionReasonChange(e.target.value)}
                            placeholder="Tulis alasan penolakan..."
                            className="min-h-[60px] text-sm"
                          />
                          {!currentRejectionReason.trim() && (
                            <p className="text-xs text-red-600">Alasan wajib diisi</p>
                          )}
                        </div>
                      )}

                      {/* Simple Status */}
                      {currentDecision && (
                        <div className={cn(
                          "p-2 rounded text-center text-sm",
                          currentDecision === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        )}>
                          {currentDecision === "approved" ? "✓ Disetujui" : "✗ Ditolak"}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="border-t p-3 bg-white flex-shrink-0">
              {/* Simple Navigation */}
              <div className="flex items-center justify-between mb-3">
                <Button
                  variant="ghost"
                  onClick={goToPreviousItem}
                  disabled={!canGoPrevious()}
                  className="h-8 px-3 text-sm"
                >
                  ← Prev
                </Button>

                <span className="text-sm font-medium text-gray-700">
                  {currentStep + 1}/{contentItems.length}
                </span>

                <Button
                  variant="ghost"
                  onClick={goToNextItem}
                  disabled={!canGoNext()}
                  className="h-8 px-3 text-sm"
                >
                  Next →
                </Button>
              </div>

              {/* Submit Button - Always visible but disabled based on conditions */}
              <Button
                onClick={handleReviewSubmit}
                disabled={!canSubmit || isSubmitting}
                className={cn(
                  "w-full h-10 text-white font-medium",
                  canSubmit 
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : "bg-gray-400 cursor-not-allowed"
                )}
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Review"}
              </Button>

              {/* Help text for submission requirements */}
              {!canSubmit && (
                <div className="text-xs text-orange-600 text-center mt-2 space-y-1">
                  {!allItemsReviewed && (
                    <p>• Review semua konten ({getReviewedCount()}/{contentItems.length} selesai)</p>
                  )}
                  {allItemsReviewed && !rejectedItemsHaveReasons && (
                    <p>• Berikan alasan untuk konten yang ditolak</p>
                  )}
                </div>
              )}

              {!isCurrentItemValid() && (
                <p className="text-xs text-blue-600 text-center mt-2">
                  Pilih Setujui atau Tolak untuk konten ini
                </p>
              )}
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Custom Confirmation Dialog */}
      <MobileConfirmationDialog
        isOpen={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Konfirmasi Review"
        description="Apakah Anda yakin ingin menyimpan hasil review ini? Hasil review tidak dapat diubah setelah disimpan."
        confirmText="Ya, Lanjutkan"
        cancelText="Batal"
        onConfirm={handleConfirmReview}
        variant="default"
      />

      {/* Preview Modal */}
      <PreviewModal
        isOpen={previewModal.isOpen}
        onOpenChange={(open) => setPreviewModal((prev) => ({ ...prev, isOpen: open }))}
        file={previewModal.file}
        url={previewModal.url}
        type={previewModal.type}
        fileName={previewModal.fileName}
        title={previewModal.title}
      />
    </>
  )
}
