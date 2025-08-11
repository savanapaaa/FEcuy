"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import Swal from "sweetalert2"
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ImageIcon,
  Video,
  Music,
  File,
  ChevronLeft,
  ChevronRight,
  Send,
  Shield,
  PlayCircle,
  PauseCircle,
  Eye,
  Zap,
  Globe,
  Hash,
  Users,
  Mic,
  Calendar,
  Upload,
  LinkIcon,
  X,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Star,
  Target,
  ArrowRight,
} from "lucide-react"

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
  isOutputValidated?: boolean
  tanggalReview?: string
  tanggalValidasiOutput?: string
}

interface ContentItem {
  id: string
  nama: string
  jenisKonten: string
  status?: "pending" | "approved" | "rejected"
  isTayang?: boolean
  alasanPenolakan?: string
  tanggalTayang?: Date | undefined
  hasilProdukFile?: any
  hasilProdukLink?: string
  keteranganValidasi?: string
  tanggalValidasiTayang?: string
  validatorTayang?: string
  // Additional fields for mobile validation
  validationDecision?: "tayang" | "tidak_tayang" | null
  validationReason?: string
  validationNotes?: string
  isValidated?: boolean
}

interface MobileValidasiOutputDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  submission: Submission | null
  contentItem?: ContentItem | null
  onUpdate: (submissions: Submission[]) => void
  onToast: (message: string, type: "success" | "error" | "info") => void
}

// Helper functions with same style as desktop
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

const formatDateForInput = (date?: Date | string): string => {
  if (!date) return ""
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return ""
  return d.toISOString().split("T")[0]
}

export function MobileValidasiOutputDialog({
  isOpen,
  onOpenChange,
  submission,
  contentItem,
  onUpdate,
  onToast,
}: MobileValidasiOutputDialogProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [validationDecisions, setValidationDecisions] = useState<Record<string, boolean | null>>({})
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({})
  const [validationNotes, setValidationNotes] = useState<Record<string, string>>({})
  const [tayangDates, setTayangDates] = useState<Record<string, string>>({})
  const [hasilProdukFiles, setHasilProdukFiles] = useState<Record<string, any>>({})
  const [hasilProdukLinks, setHasilProdukLinks] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
      setValidationDecisions({})
      setRejectionReasons({})
      setValidationNotes({})
      setTayangDates({})
      setHasilProdukFiles({})
      setHasilProdukLinks({})
    }
  }, [isOpen])

  if (!submission) return null

  const approvedItems = submission.contentItems?.filter((item) => item.status === "approved") || []
  const currentItem = contentItem || approvedItems[currentStep]

  if (!currentItem && approvedItems.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm w-[90vw] fixed left-[50%] top-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%] gap-4 border border-slate-200 bg-white shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl overflow-hidden">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-6"
          >
            <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full w-16 h-16 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900 mb-2">Tidak Ada Konten untuk Validasi</DialogTitle>
            <p className="text-gray-600 mb-4 text-sm">
              Semua konten sudah divalidasi atau belum ada konten yang perlu divalidasi.
            </p>
            <Button onClick={() => onOpenChange(false)} className="bg-gradient-to-r from-blue-500 to-purple-600 w-full">
              Tutup
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    )
  }

  const validationItem = approvedItems[currentStep] || approvedItems[0]
  const currentDecision = validationDecisions[validationItem.id]
  const currentRejectionReason = rejectionReasons[validationItem.id] || ""
  const currentValidationNote = validationNotes[validationItem.id] || ""
  const currentTayangDate = tayangDates[validationItem.id] || ""
  const currentHasilFile = hasilProdukFiles[validationItem.id]
  const currentHasilLink = hasilProdukLinks[validationItem.id] || ""

  // Check if all content items have been validated
  const allItemsValidated = (approvedItems || []).every(
    (item) => validationDecisions[item.id] !== undefined && validationDecisions[item.id] !== null,
  )

  // Check if any rejected items have rejection reasons
  const rejectedItemsHaveReasons = (approvedItems || [])
    .filter((item) => validationDecisions[item.id] === false)
    .every((item) => rejectionReasons[item.id]?.trim())

  // Check if tayang items have required fields
  const tayangItemsComplete = (approvedItems || [])
    .filter((item) => validationDecisions[item.id] === true)
    .every((item) => {
      const hasDate = tayangDates[item.id]?.trim()
      const hasFile = hasilProdukFiles[item.id]
      const hasLink = hasilProdukLinks[item.id]?.trim()
      return hasDate && (hasFile || hasLink)
    })

  const canSubmit = allItemsValidated && rejectedItemsHaveReasons && tayangItemsComplete

  const getValidatedCount = () => {
    return Object.values(validationDecisions).filter((d) => d !== null).length
  }

  // Handle validation decision change
  const handleValidationDecisionChange = (decision: boolean) => {
    setValidationDecisions((prev) => ({
      ...prev,
      [validationItem.id]: decision,
    }))

    // Clear rejection reason if switching to approved
    if (decision === true) {
      setRejectionReasons((prev) => ({
        ...prev,
        [validationItem.id]: "",
      }))
    } else {
      // Clear tayang-related fields if switching to rejected
      setTayangDates((prev) => ({
        ...prev,
        [validationItem.id]: "",
      }))
      setHasilProdukFiles((prev) => ({
        ...prev,
        [validationItem.id]: null,
      }))
      setHasilProdukLinks((prev) => ({
        ...prev,
        [validationItem.id]: "",
      }))
    }
  }

  // Navigate to next content item
  const goToNextItem = () => {
    if (currentStep < approvedItems.length - 1) {
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
    return currentStep < approvedItems.length - 1
  }

  const canGoPrevious = () => {
    return currentStep > 0
  }

  const isCurrentItemValid = () => {
    const decision = validationDecisions[validationItem.id]
    if (decision === null || decision === undefined) return false
    if (decision === false && !rejectionReasons[validationItem.id]?.trim()) return false
    if (decision === true) {
      const hasDate = tayangDates[validationItem.id]?.trim()
      const hasFile = hasilProdukFiles[validationItem.id]
      const hasLink = hasilProdukLinks[validationItem.id]?.trim()
      return hasDate && (hasFile || hasLink)
    }
    return true
  }

  // Handle validation submission
  const handleValidationSubmit = async () => {
    if (!canSubmit) {
      await Swal.fire({
        title: "Validasi Belum Lengkap",
        text: "Harap lengkapi semua validasi dengan tanggal tayang dan hasil produk untuk konten yang tayang",
        icon: "warning",
        confirmButtonText: "OK",
        customClass: {
          popup: "rounded-2xl",
          confirmButton: "rounded-xl px-6 py-2 bg-gradient-to-r from-yellow-500 to-amber-600",
        },
      })
      return
    }

    // Show confirmation dialog
    const tayangCount = Object.values(validationDecisions).filter((d) => d === true).length
    const tidakTayangCount = Object.values(validationDecisions).filter((d) => d === false).length

    const result = await Swal.fire({
      title: "Konfirmasi Validasi",
      html: `
        <div class="text-left space-y-3">
          <p class="text-gray-700 mb-4">Apakah Anda yakin ingin menyelesaikan validasi ini?</p>
          <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
            <div class="flex items-center space-x-2 text-green-700">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              <span class="font-medium">${tayangCount} Konten akan Tayang</span>
            </div>
          </div>
          <div class="bg-gradient-to-r from-red-50 to-rose-50 p-3 rounded-lg border border-red-200">
            <div class="flex items-center space-x-2 text-red-700">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
              <span class="font-medium">${tidakTayangCount} Konten Tidak Tayang</span>
            </div>
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Selesaikan",
      cancelButtonText: "Batal",
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "rounded-xl px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600",
        cancelButton: "rounded-xl px-6 py-2 bg-gradient-to-r from-gray-400 to-gray-500",
        htmlContainer: "text-sm",
      },
      buttonsStyling: false,
    })

    if (!result.isConfirmed) {
      return
    }

    // Show loading
    Swal.fire({
      title: "Memproses Validasi",
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Update localStorage with validation results
      const submissions = JSON.parse(localStorage.getItem("submissions") || "[]")
      const updatedSubmissions = submissions.map((sub: any) => {
        if (sub.id === submission.id) {
          const updatedContentItems = sub.contentItems?.map((contentItem: any) => {
            const decision = validationDecisions[contentItem.id]
            if (decision !== undefined && decision !== null) {
              return {
                ...contentItem,
                isTayang: decision,
                tanggalValidasiTayang: decision ? tayangDates[contentItem.id] : undefined,
                keteranganValidasi: validationNotes[contentItem.id] || "",
                alasanTidakTayang: decision ? undefined : rejectionReasons[contentItem.id],
                hasilProdukValidasiFile: decision ? hasilProdukFiles[contentItem.id] : undefined,
                hasilProdukValidasiLink: decision ? hasilProdukLinks[contentItem.id] : undefined,
                validatorTayang: "Admin Validator", // Should be from auth context
                tanggalTayang: decision && tayangDates[contentItem.id] ? new Date(tayangDates[contentItem.id]) : undefined,
              }
            }
            return contentItem
          })

          return {
            ...sub,
            contentItems: updatedContentItems,
            lastModified: new Date().toISOString(),
            isOutputValidated: true,
            tanggalValidasiOutput: new Date().toISOString(),
            workflowStage: "completed",
          }
        }
        return sub
      })

      localStorage.setItem("submissions", JSON.stringify(updatedSubmissions))
      onUpdate(updatedSubmissions)

      // Show success message
      await Swal.fire({
        title: "Validasi Berhasil!",
        html: `
          <div class="text-center space-y-4">
            <div class="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <p class="text-gray-700 text-base">Validasi output telah diselesaikan dengan hasil:</p>
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
              <div class="flex justify-between items-center text-sm">
                <div class="flex items-center space-x-2 text-green-600">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="font-medium">${tayangCount} Konten Tayang</span>
                </div>
                <div class="flex items-center space-x-2 text-red-600">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="font-medium">${tidakTayangCount} Konten Tidak Tayang</span>
                </div>
              </div>
            </div>
          </div>
        `,
        icon: "success",
        confirmButtonText: "Tutup",
        timer: 4000,
        timerProgressBar: true,
        customClass: {
          popup: "rounded-2xl",
          confirmButton: "rounded-xl px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600",
          htmlContainer: "text-sm",
        },
      })

      setIsSubmitting(false)
      onOpenChange(false)
    } catch (error) {
      console.error("Validation submission error:", error)
      
      await Swal.fire({
        title: "Terjadi Kesalahan",
        text: "Gagal menyimpan validasi. Silakan coba lagi.",
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

  const progress = approvedItems.length > 0 ? ((getValidatedCount()) / approvedItems.length) * 100 : 0

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm w-[90vw] max-h-[90vh] flex flex-col p-0 bg-gradient-to-br from-slate-50 via-white to-yellow-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed left-[50%] top-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%] gap-0 border border-slate-200 shadow-xl duration-200 rounded-xl overflow-hidden">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full flex flex-col max-h-[90vh]"
        >
          {/* Header - Fixed */}
          <DialogHeader className="px-4 py-3 border-b bg-gradient-to-r from-yellow-50 to-amber-50 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md w-8 h-8">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-base font-bold text-yellow-900">Validasi Output</DialogTitle>
                <p className="text-xs text-yellow-600">Item {currentStep + 1} dari {approvedItems.length}</p>
              </div>
            </div>
            
            {/* Progress */}
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-yellow-700">Progress Validasi</span>
                <span className="text-xs text-yellow-700">{getValidatedCount()}/{approvedItems.length}</span>
              </div>
              <div className="w-full bg-yellow-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-yellow-500 to-amber-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="px-4 py-4 space-y-4">
                {/* Submission Info */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                          {submission.noComtab}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-blue-900 text-sm leading-tight">{submission.judul}</h3>
                      <p className="text-xs text-blue-600"><strong>Tema:</strong> {submission.tema}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Content Item */}
                <Card className="border-yellow-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      {getContentTypeIcon(validationItem.jenisKonten)}
                      <span className="font-medium text-gray-900">{validationItem.nama}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-500">Jenis Konten</Label>
                      <p className="text-sm text-gray-700 mt-1">{validationItem.jenisKonten}</p>
                    </div>

                    {/* Validation Decision */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-900">Keputusan Validasi</Label>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={currentDecision === true ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleValidationDecisionChange(true)}
                          className={currentDecision === true 
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                            : "border-green-200 text-green-600 hover:bg-green-50"
                          }
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Tayang
                        </Button>
                        
                        <Button
                          variant={currentDecision === false ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => handleValidationDecisionChange(false)}
                          className={currentDecision === false 
                            ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                            : "border-red-200 text-red-600 hover:bg-red-50"
                          }
                        >
                          <ThumbsDown className="h-3 w-3 mr-1" />
                          Tidak Tayang
                        </Button>
                      </div>

                      {/* Rejection Reason */}
                      {currentDecision === false && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                        >
                          <Label htmlFor="rejectionReason" className="text-sm text-red-700">
                            Alasan Penolakan
                          </Label>
                          <Textarea
                            id="rejectionReason"
                            placeholder="Jelaskan alasan konten tidak dapat tayang..."
                            value={currentRejectionReason}
                            onChange={(e) => setRejectionReasons(prev => ({
                              ...prev,
                              [validationItem.id]: e.target.value
                            }))}
                            className="mt-1 min-h-[60px] text-sm border-red-200 focus:border-red-500"
                          />
                        </motion.div>
                      )}

                      {/* Tayang Requirements */}
                      {currentDecision === true && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                          className="space-y-3"
                        >
                          {/* Tanggal Tayang */}
                          <div>
                            <Label htmlFor="tayangDate" className="text-sm text-green-700">
                              Tanggal Tayang *
                            </Label>
                            <Input
                              id="tayangDate"
                              type="date"
                              value={currentTayangDate}
                              onChange={(e) => setTayangDates(prev => ({
                                ...prev,
                                [validationItem.id]: e.target.value
                              }))}
                              className="mt-1 text-sm border-green-200 focus:border-green-500"
                            />
                          </div>

                          {/* Hasil Produk File */}
                          <div>
                            <Label htmlFor="hasilFile" className="text-sm text-green-700">
                              Hasil Produk (File)
                            </Label>
                            <div className="mt-1 space-y-2">
                              <Input
                                id="hasilFile"
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    setHasilProdukFiles(prev => ({
                                      ...prev,
                                      [validationItem.id]: file
                                    }))
                                  }
                                }}
                                className="text-sm border-green-200 focus:border-green-500"
                              />
                              {currentHasilFile && (
                                <div className="flex items-center justify-between p-2 bg-green-50 rounded text-xs">
                                  <span className="text-green-700 truncate">{currentHasilFile.name}</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setHasilProdukFiles(prev => ({
                                      ...prev,
                                      [validationItem.id]: null
                                    }))}
                                    className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Hasil Produk Link */}
                          <div>
                            <Label htmlFor="hasilLink" className="text-sm text-green-700">
                              Hasil Produk (Link)
                            </Label>
                            <Input
                              id="hasilLink"
                              type="url"
                              placeholder="https://..."
                              value={currentHasilLink}
                              onChange={(e) => setHasilProdukLinks(prev => ({
                                ...prev,
                                [validationItem.id]: e.target.value
                              }))}
                              className="mt-1 text-sm border-green-200 focus:border-green-500"
                            />
                          </div>

                          <div className="p-2 bg-green-50 rounded text-xs text-green-700">
                            <p className="font-medium">Catatan:</p>
                            <p>Minimal satu dari file atau link harus diisi untuk konten yang tayang.</p>
                          </div>
                        </motion.div>
                      )}

                      {/* Validation Notes */}
                      <div>
                        <Label htmlFor="validationNotes" className="text-sm text-gray-700">
                          Catatan Validasi (Opsional)
                        </Label>
                        <Textarea
                          id="validationNotes"
                          placeholder="Tambahkan catatan validasi..."
                          value={currentValidationNote}
                          onChange={(e) => setValidationNotes(prev => ({
                            ...prev,
                            [validationItem.id]: e.target.value
                          }))}
                          className="mt-1 min-h-[50px] text-sm"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Validation Status */}
                <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status Item Ini:</span>
                      <div className="flex items-center space-x-2">
                        {isCurrentItemValid() ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600 font-medium">Valid</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span className="text-sm text-orange-600 font-medium">Perlu Dilengkapi</span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Add some bottom padding for scroll */}
                <div className="h-4"></div>
              </div>
            </ScrollArea>
          </div>

          {/* Navigation Footer - Fixed */}
          <div className="px-4 py-3 border-t bg-white flex-shrink-0">
            <div className="flex items-center justify-between space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousItem}
                disabled={!canGoPrevious()}
                className="flex-1 border-yellow-200 text-yellow-600 hover:bg-yellow-50"
              >
                <ChevronLeft className="h-3 w-3 mr-1" />
                Sebelumnya
              </Button>

              {canGoNext() ? (
                <Button
                  size="sm"
                  onClick={goToNextItem}
                  disabled={!isCurrentItemValid()}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white"
                >
                  Selanjutnya
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleValidationSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Send className="h-3 w-3 mr-2" />
                      Selesai
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
