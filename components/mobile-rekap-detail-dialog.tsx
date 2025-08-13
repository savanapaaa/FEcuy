"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Download,
  ExternalLink,
  Ban,
  Trash2,
  Shield,
  Globe,
  EyeOff,
  Target,
  Activity,
  LinkIcon,
  ImageIcon,
  Video,
  Music,
  FileIcon,
  Sparkles,
  Layers,
  ArrowLeft,
  Users,
  ChevronRight,
  Info,
  MessageSquare,
  Zap,
  Star,
  AlertOctagon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { saveSubmissionsToStorage, loadSubmissionsFromStorage } from "@/lib/utils"
import PreviewModal from "./preview-modal"
import { getCurrentUser } from "@/lib/auth-context"
import Swal from "sweetalert2"

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
  isConfirmed?: boolean
  tanggalKonfirmasi?: Date | string | undefined
  // Takedown fields
  isTakedown?: boolean
  tanggalTakedown?: Date | string | undefined
  alasanTakedown?: string
  takedownBy?: string
  // Source files
  narasiFile?: FileData | string
  suratFile?: FileData | string
  audioDubbingFile?: FileData | string
  audioDubbingLainLainFile?: FileData | string
  audioBacksoundFile?: FileData | string
  audioBacksoundLainLainFile?: FileData | string
  pendukungVideoFile?: FileData | string
  pendukungFotoFile?: FileData | string
  pendukungLainLainFile?: FileData | string
  // Validation output fields - these are the files from validation process
  tanggalTayangValidasi?: string
  hasilProdukValidasiFile?: FileData | string
  hasilProdukValidasiLink?: string
  alasanTidakTayang?: string
  takedownReason?: string
  takedownDate?: string
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
  jumlahProduksi: string
  tanggalSubmit: Date | string | undefined
  lastModified?: Date | string | undefined
  uploadedBuktiMengetahui?: FileData | string
  isOutputValidated?: boolean
  tanggalValidasiOutput?: Date | string | undefined
  contentItems?: ContentItem[]
  // Additional files
  dokumenPendukung?: (FileData | string)[]
  suratPermohonan?: FileData | string
  proposalKegiatan?: FileData | string
  tanggalReview?: string // Review timestamp
  tema?: string
}

interface MobileRekapDetailDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  submission: Submission | null
  onUpdate?: () => void
  onToast?: (message: string, type: "success" | "error" | "info") => void
}

export function MobileRekapDetailDialog({
  isOpen,
  onOpenChange,
  submission,
  onUpdate,
  onToast,
}: MobileRekapDetailDialogProps) {
  const [isTakedownDialogOpen, setIsTakedownDialogOpen] = useState(false)
  const [takedownReason, setTakedownReason] = useState("")
  const [selectedItemId, setSelectedItemId] = useState<string>("")
  const [selectedItemName, setSelectedItemName] = useState<string>("")
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState("overview")
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    file: null as any,
    url: "",
    type: "",
    fileName: "",
    title: "",
  })
  const [expandedContent, setExpandedContent] = useState<string | null>(null)

  if (!submission) return null

  const currentUser = getCurrentUser()

  const handleTakedown = (itemId: string, itemName: string) => {
    setSelectedItemId(itemId)
    setSelectedItemName(itemName)
    setTakedownReason("")
    setIsTakedownDialogOpen(true)
  }

  const confirmTakedown = async () => {
    if (!takedownReason.trim() || !selectedItemId) {
      await Swal.fire({
        title: "Error!",
        text: "Alasan takedown harus diisi",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
      })
      return
    }

    try {
      // Show loading
      Swal.fire({
        title: "Memproses...",
        text: "Sedang melakukan takedown konten",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      // Process takedown
      await handleTakedownContent(selectedItemId, takedownReason)

      // Close loading and show success
      await Swal.fire({
        title: "Berhasil!",
        text: `Konten "${selectedItemName}" berhasil di-takedown`,
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#10b981",
      })

      // Close dialog and reset
      setIsTakedownDialogOpen(false)
      setTakedownReason("")
      setSelectedItemId("")
      setSelectedItemName("")
    } catch (error) {
      console.error("Error during takedown:", error)
      await Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan saat melakukan takedown",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
      })
    }
  }

  const handleDelete = async () => {
    try {
      const result = await Swal.fire({
        title: "Konfirmasi Hapus",
        text: `Apakah Anda yakin ingin menghapus dokumen "${submission.judul}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Ya, Hapus!",
        cancelButtonText: "Batal",
      })

      if (result.isConfirmed) {
        const submissions = loadSubmissionsFromStorage()
        const updatedSubmissions = submissions.filter((sub: any) => sub.id !== submission.id)
        saveSubmissionsToStorage(updatedSubmissions)

        await Swal.fire({
          title: "Berhasil!",
          text: "Dokumen berhasil dihapus",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#10b981",
        })

        onOpenChange(false)
        onUpdate?.()
        // Refresh the page to update the list
        window.location.reload()
      }
    } catch (error) {
      console.error("Error deleting submission:", error)
      await Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan saat menghapus dokumen",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
      })
    }
  }

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  // Get real-time data from submission
  const contentItems = submission.contentItems || []
  const approvedItems = contentItems.filter((item) => item.status === "approved")
  const rejectedItems = contentItems.filter((item) => item.status === "rejected")
  const pendingItems = contentItems.filter((item) => !item.status || item.status === "pending")
  const publishedItems = approvedItems.filter((item) => item.isTayang === true)
  const takedownItems = approvedItems.filter((item) => item.isTakedown === true)
  const unpublishedItems = approvedItems.filter((item) => item.isTayang !== true)
  const confirmedItems = contentItems.filter((item) => item.isConfirmed === true)

  // Enhanced date formatting functions with better error handling
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "Belum diisi"

    try {
      let dateObj: Date

      if (typeof date === "string") {
        // Handle ISO string dates
        if (date.includes("T") || date.includes("Z")) {
          dateObj = new Date(date)
        } else {
          // Handle date strings in various formats
          dateObj = new Date(date)
        }
      } else {
        dateObj = date
      }

      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return "Belum diisi"
      }

      return dateObj.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date:", error, "Date value:", date)
      return "Belum diisi"
    }
  }

  const formatDateTime = (date: Date | string | undefined) => {
    if (!date) return "Belum diisi"

    try {
      let dateObj: Date

      if (typeof date === "string") {
        // Handle ISO string dates
        if (date.includes("T") || date.includes("Z")) {
          dateObj = new Date(date)
        } else {
          // Handle date strings in various formats
          dateObj = new Date(date)
        }
      } else {
        dateObj = date
      }

      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return "Belum diisi"
      }

      return dateObj.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("Error formatting datetime:", error, "Date value:", date)
      return "Belum diisi"
    }
  }

  const getStatusBadge = (status?: string, isTakedown?: boolean) => {
    if (isTakedown) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center space-x-1 text-xs animate-pulse">
          <Ban className="h-3 w-3" />
          <span>TAKEDOWN</span>
        </Badge>
      )
    }

    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center space-x-1 text-xs">
            <CheckCircle className="h-3 w-3" />
            <span>Disetujui</span>
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center space-x-1 text-xs">
            <XCircle className="h-3 w-3" />
            <span>Ditolak</span>
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center space-x-1 text-xs">
            <Clock className="h-3 w-3" />
            <span>Menunggu Review</span>
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200 flex items-center space-x-1 text-xs">
            <Clock className="h-3 w-3" />
            <span>Belum Diproses</span>
          </Badge>
        )
    }
  }

  const getContentTypeIcon = (jenisKonten: string) => {
    const type = jenisKonten.toLowerCase()
    if (type.includes("video")) return <Video className="h-3 w-3 text-blue-600" />
    if (type.includes("foto") || type.includes("gambar") || type.includes("fotografis"))
      return <ImageIcon className="h-3 w-3 text-green-600" />
    if (type.includes("audio") || type.includes("suara")) return <Music className="h-3 w-3 text-purple-600" />
    if (type.includes("teks") || type.includes("artikel") || type.includes("naskah"))
      return <FileText className="h-3 w-3 text-orange-600" />
    if (type.includes("infografis")) return <FileIcon className="h-3 w-3 text-indigo-600" />
    if (type.includes("bumper")) return <Video className="h-3 w-3 text-red-600" />
    return <FileIcon className="h-3 w-3 text-gray-600" />
  }

  const getMediaIcon = (media: string) => {
    const mediaLower = media.toLowerCase()
    if (mediaLower.includes("tv") || mediaLower.includes("televisi")) return "📺"
    if (mediaLower.includes("radio")) return "📻"
    if (mediaLower.includes("website") || mediaLower.includes("web")) return "🌐"
    if (mediaLower.includes("sosial") || mediaLower.includes("social")) return "📱"
    if (mediaLower.includes("cetak") || mediaLower.includes("koran") || mediaLower.includes("surat kabar")) return "📰"
    if (mediaLower.includes("instagram")) return "📷"
    if (mediaLower.includes("youtube")) return "📹"
    if (mediaLower.includes("facebook")) return "👥"
    if (mediaLower.includes("twitter") || mediaLower.includes("x")) return "🐦"
    return "📢"
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

  // Helper function to handle file preview
  const handlePreviewFile = (file: any, title: string) => {
    try {
      const url = getPreviewUrl(file)
      const fileType = getFileType(file)
      const fileName = typeof file === "string" ? file.split("/").pop() || file : file?.name || "File"

      setPreviewModal({
        isOpen: true,
        file: file,
        url: url || "",
        type: fileType,
        fileName: fileName,
        title: title,
      })

      if (!file) {
        onToast && onToast("File tidak ditemukan", "error")
      } else if (!url && file) {
        onToast &&
          onToast("File ditemukan tetapi tidak dapat ditampilkan. Mungkin hanya metadata yang tersimpan.", "info")
      }
    } catch (error) {
      console.error("Error opening file preview:", error)
      onToast && onToast("Terjadi kesalahan saat membuka preview file", "error")
    }
  }

  // Helper function to download file
  const downloadFile = (file: any, fileName?: string) => {
    try {
      const url = getPreviewUrl(file)
      if (!url) {
        console.error("Cannot get URL for file download")
        onToast && onToast("Tidak dapat mendownload file", "error")
        return
      }

      const link = document.createElement("a")
      link.href = url

      const downloadName =
        fileName || (typeof file === "string" ? file.split("/").pop() || "download" : file?.name || "download")
      link.download = downloadName

      if (url.startsWith("http://") || url.startsWith("https://")) {
        link.target = "_blank"
        link.rel = "noopener noreferrer"
      }

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      onToast && onToast("File berhasil didownload", "success")
    } catch (error) {
      console.error("Error downloading file:", error)
      onToast && onToast("Terjadi kesalahan saat mendownload file", "error")
    }
  }

  const formatFileDisplay = (fileData?: FileData | string, title?: string) => {
    if (!fileData) return null

    const fileName = typeof fileData === "string" ? fileData.split("/").pop() || "Link File" : fileData.name
    const fileSize = typeof fileData === "string" ? null : `${Math.round(fileData.size / 1024)} KB`

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded border border-green-200 hover:border-green-300 transition-all duration-200"
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-1.5 flex-1 min-w-0">
            <div className="p-0.5 bg-white rounded shadow-sm flex-shrink-0">
              <FileIcon className="h-2.5 w-2.5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{fileName}</p>
              {fileSize && <p className="text-xs text-gray-500">{fileSize}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePreviewFile(fileData, title || "File")}
              className="bg-white hover:bg-green-50 border-green-200 p-0.5 h-5 w-5"
            >
              <Eye className="h-2 w-2" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => downloadFile(fileData, fileName)}
              className="bg-white hover:bg-green-50 border-green-200 p-0.5 h-5 w-5"
            >
              <Download className="h-2 w-2" />
            </Button>
          </div>
        </div>

        {typeof fileData === "string" && (fileData.startsWith("http://") || fileData.startsWith("https://")) && (
          <div className="flex items-center space-x-1 text-xs text-green-600">
            <LinkIcon className="h-2 w-2 flex-shrink-0" />
            <span className="truncate text-xs">{fileData}</span>
          </div>
        )}
      </motion.div>
    )
  }

  const getFileDisplayName = (file: any): string => {
    if (!file) return "Tidak ada file"
    if (typeof file === "string") return file.length > 20 ? file.substring(0, 20) + "..." : file
    return file.name || "File tidak dikenal"
  }

  const handleFileView = (file: any) => {
    if (!file) return

    if (typeof file === "string") {
      window.open(file, "_blank")
    } else if (file.base64) {
      window.open(file.base64, "_blank")
    } else if (file.url) {
      window.open(file.url, "_blank")
    } else {
      alert("File tidak dapat ditampilkan. Hanya metadata yang tersimpan.")
    }
  }

  // Calculate statistics
  const totalItems = submission.contentItems?.length || 0
  const approvedItemsLength = submission.contentItems?.filter((item) => item.status === "approved").length || 0
  const rejectedItemsLength = submission.contentItems?.filter((item) => item.status === "rejected").length || 0
  const tayangItems = submission.contentItems?.filter((item) => item.isTayang).length || 0
  const takedownItemsLength = submission.contentItems?.filter((item) => item.isTakedown).length || 0

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity, count: null },
    {
      id: "files",
      label: "File",
      icon: FileText,
      count: (submission.dokumenPendukung?.length || 0) + (submission.uploadedBuktiMengetahui ? 1 : 0),
    },
    { id: "content", label: "Konten", icon: Layers, count: contentItems.length },
    { id: "approved", label: "Disetujui", icon: CheckCircle, count: approvedItems.length },
    {
      id: "output",
      label: "Output",
      icon: Sparkles,
      count: approvedItems.filter(
        (item) =>
          item.hasilProdukValidasiFile || item.hasilProdukValidasiLink || item.hasilProdukFile || item.hasilProdukLink,
      ).length,
    },
  ]

  const handleTakedownContent = async (itemId: string, takedownReason: string) => {
    if (!takedownReason.trim()) return

    const submissions = loadSubmissionsFromStorage()
    const updatedSubmissions = submissions.map((sub: any) => {
      if (sub.id === submission.id) {
        const updatedContentItems = sub.contentItems?.map((item: any) => {
          if (item.id === itemId) {
            return {
              ...item,
              isTakedown: true,
              alasanTakedown: takedownReason.trim(),
              tanggalTakedown: new Date().toISOString(),
              takedownBy: currentUser?.fullName || currentUser?.username || "Admin",
            }
          }
          return item
        })
        return { ...sub, contentItems: updatedContentItems }
      }
      return sub
    })

    saveSubmissionsToStorage(updatedSubmissions)

    // Update local submission state
    if (submission.contentItems) {
      submission.contentItems = submission.contentItems.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            isTakedown: true,
            alasanTakedown: takedownReason.trim(),
            tanggalTakedown: new Date().toISOString(),
            takedownBy: currentUser?.fullName || currentUser?.username || "Admin",
          }
        }
        return item
      })
    }

    onUpdate?.()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-full md:max-w-4xl h-screen md:max-h-[90vh] md:h-auto bg-white border-0 md:border shadow-none md:shadow-lg p-0 m-0 rounded-none md:rounded-lg overflow-hidden flex flex-col">
          {/* Mobile Header - Compact */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-2 md:p-4 flex-shrink-0 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-white hover:bg-white/20 p-1 rounded-full h-6 w-6 flex-shrink-0"
                >
                  <ArrowLeft className="h-3 w-3" />
                </Button>
                <div className="p-1 bg-white/20 rounded flex-shrink-0">
                  <FileText className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1 min-w-0 mr-2">
                  <DialogTitle className="text-sm font-bold text-white truncate">{submission.judul}</DialogTitle>
                  <DialogDescription className="text-green-100 text-xs truncate">{submission.noComtab}</DialogDescription>
                </div>
              </div>
              <div className="flex items-center space-x-1 flex-shrink-0">
                {submission.isOutputValidated && (
                  <Badge className="bg-white/20 text-white border-white/30 text-xs px-1 py-0">
                    <Shield className="h-2 w-2 mr-0.5" />
                    Valid
                  </Badge>
                )}
                {/* Mobile Edit Actions */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="text-red-300 hover:bg-red-500/20 border-red-300/30 h-6 px-1.5 bg-transparent flex-shrink-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Quick Stats - Ultra compact */}
            <div className="grid grid-cols-5 md:grid-cols-5 gap-1 md:gap-2">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center p-1 bg-white/10 rounded backdrop-blur-sm"
              >
                <p className="text-sm font-bold text-white">{approvedItemsLength}</p>
                <p className="text-xs text-green-100">Setuju</p>
              </motion.div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center p-1 bg-white/10 rounded backdrop-blur-sm"
              >
                <p className="text-sm font-bold text-white">{rejectedItemsLength}</p>
                <p className="text-xs text-green-100">Tolak</p>
              </motion.div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center p-1 bg-white/10 rounded backdrop-blur-sm"
              >
                <p className="text-sm font-bold text-white">{publishedItems.length}</p>
                <p className="text-xs text-green-100">Tayang</p>
              </motion.div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center p-1 bg-white/10 rounded backdrop-blur-sm"
              >
                <p className="text-sm font-bold text-white">{takedownItemsLength}</p>
                <p className="text-xs text-green-100">Takedown</p>
              </motion.div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center p-1 bg-white/10 rounded backdrop-blur-sm"
              >
                <p className="text-sm font-bold text-white">{confirmedItems.length}</p>
                <p className="text-xs text-green-100">Konfirm</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Tab Navigation - Compact */}
          <div className="bg-white border-b border-gray-200 flex-shrink-0 shadow-sm">
            <ScrollArea className="w-full">
              <div className="flex space-x-0.5 p-1 min-w-max">
                {tabs.map((tab, index) => (
                  <motion.div
                    key={tab.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      variant={activeTab === tab.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center space-x-1 whitespace-nowrap transition-all duration-200 text-xs md:text-sm px-1.5 md:px-3 py-1 md:py-2 h-7 md:h-9",
                        activeTab === tab.id
                          ? "bg-green-600 text-white shadow-md"
                          : "text-gray-600 hover:text-gray-900 hover:bg-green-50",
                      )}
                    >
                      <tab.icon className="h-2.5 w-2.5" />
                      <span className="font-medium text-xs md:text-sm">{tab.label}</span>
                      {tab.count !== null && tab.count > 0 && (
                        <Badge
                          className={cn(
                            "text-xs px-0.5 py-0 min-w-[12px] h-3 text-xs",
                            activeTab === tab.id
                              ? "bg-white/20 text-white border-white/30"
                              : "bg-green-100 text-green-800 border-green-200",
                          )}
                        >
                          {tab.count}
                        </Badge>
                      )}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Content - Scrollable area */}
          <div 
            className="flex-1 overflow-y-auto overscroll-contain" 
            style={{ 
              WebkitOverflowScrolling: 'touch',
              height: '100%',
              maxHeight: '100%'
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-2 md:p-4 space-y-2 md:space-y-3 pb-20"
              >
                  {activeTab === "overview" && (
                    <div className="space-y-2">
                      {/* Document Information */}
                      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                        <CardHeader className="pb-1">
                          <CardTitle className="text-xs md:text-sm flex items-center text-green-800">
                            <FileText className="h-3 w-3 mr-1 text-green-600" />
                            Informasi Dokumen
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1.5">
                          <div className="grid grid-cols-1 gap-1.5">
                            <div className="p-1.5 bg-white rounded border border-green-200">
                              <label className="text-xs md:text-sm font-semibold text-green-700 mb-0.5 block">
                                No Comtab
                              </label>
                              <p className="font-bold text-green-900 text-xs md:text-sm">{submission.noComtab}</p>
                            </div>
                            <div className="p-1.5 bg-white rounded border border-green-200">
                              <label className="text-xs md:text-sm font-semibold text-green-700 mb-0.5 block">
                                PIN
                              </label>
                              <p className="font-mono text-green-900 bg-green-50 px-1 py-0.5 rounded border text-xs md:text-sm">
                                {submission.pin || "Tidak ada PIN"}
                              </p>
                            </div>
                          </div>

                          <div className="p-1.5 bg-white rounded border border-green-200">
                            <label className="text-xs md:text-sm font-semibold text-green-700 mb-0.5 block">
                              Judul
                            </label>
                            <p className="font-semibold text-gray-900 leading-relaxed text-xs md:text-sm">
                              {submission.judul}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 gap-1">
                            <div className="flex justify-between items-center p-1.5 bg-white rounded border border-green-200">
                              <div className="flex items-center space-x-1">
                                <Users className="h-2.5 w-2.5 text-green-600" />
                                <span className="font-semibold text-green-700 text-xs md:text-sm">Petugas:</span>
                              </div>
                              <span className="font-medium text-gray-900 text-xs md:text-sm truncate ml-1">
                                {submission.petugasPelaksana}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-1.5 bg-white rounded border border-green-200">
                              <div className="flex items-center space-x-1">
                                <User className="h-2.5 w-2.5 text-green-600" />
                                <span className="font-semibold text-green-700 text-xs md:text-sm">Supervisor:</span>
                              </div>
                              <span className="font-medium text-gray-900 text-xs md:text-sm truncate ml-1">
                                {submission.supervisor}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-1.5 bg-white rounded border border-green-200">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-2.5 w-2.5 text-green-600" />
                                <span className="font-semibold text-green-700 text-xs md:text-sm">Submit:</span>
                              </div>
                              <span className="font-medium text-gray-900 text-xs md:text-sm">
                                {formatDate(submission.tanggalSubmit)}
                              </span>
                            </div>
                          </div>

                          {/* Additional Info */}
                          <div className="grid grid-cols-2 gap-1">
                            <div className="p-1.5 bg-white rounded border border-green-200">
                              <label className="text-xs md:text-sm font-semibold text-green-700 mb-0.5 block">
                                Media
                              </label>
                              <p className="font-medium text-gray-900 text-xs md:text-sm capitalize">
                                {submission.jenisMedia}
                              </p>
                            </div>
                            <div className="p-1.5 bg-white rounded border border-green-200">
                              <label className="text-xs md:text-sm font-semibold text-green-700 mb-0.5 block">
                                Produksi
                              </label>
                              <p className="font-medium text-gray-900 text-xs md:text-sm">
                                {submission.jumlahProduksi || "Tidak ditentukan"}
                              </p>
                            </div>
                          </div>

                          {/* Status Information */}
                          <div className="space-y-1">
                            <div className="p-1.5 bg-white rounded border border-green-200">
                              <label className="text-xs md:text-sm font-semibold text-green-700 mb-0.5 block">
                                Status Validasi
                              </label>
                              <Badge
                                className={cn(
                                  "px-1.5 py-0.5 text-xs md:text-sm",
                                  submission.isOutputValidated
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : "bg-gray-100 text-gray-800 border-gray-200",
                                )}
                              >
                                {submission.isOutputValidated ? (
                                  <>
                                    <CheckCircle className="h-2 w-2 mr-0.5" />
                                    Tervalidasi
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-2 w-2 mr-0.5" />
                                    Belum Validasi
                                  </>
                                )}
                              </Badge>
                              {submission.tanggalValidasiOutput && (
                                <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                                  {formatDateTime(submission.tanggalValidasiOutput)}
                                </p>
                              )}
                            </div>

                            <div className="p-1.5 bg-white rounded border border-green-200">
                              <label className="text-xs md:text-sm font-semibold text-green-700 mb-0.5 block">
                                Status Review
                              </label>
                              <Badge
                                className={cn(
                                  "px-1.5 py-0.5 text-xs md:text-sm",
                                  submission.tanggalReview
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : "bg-orange-100 text-orange-800 border-orange-200",
                                )}
                              >
                                {submission.tanggalReview ? (
                                  <>
                                    <CheckCircle className="h-2 w-2 mr-0.5" />
                                    Sudah Direview
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-2 w-2 mr-0.5" />
                                    Menunggu Review
                                  </>
                                )}
                              </Badge>
                              {submission.tanggalReview && (
                                <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                                  Direview: {formatDateTime(submission.tanggalReview)}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Test Scroll Content - temporary */}
                      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50">
                        <CardHeader className="pb-1">
                          <CardTitle className="text-xs md:text-sm flex items-center text-blue-800">
                            <Info className="h-3 w-3 mr-1 text-blue-600" />
                            Test Scroll Area
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {[1,2,3,4,5,6,7,8,9,10].map(i => (
                            <div key={i} className="p-2 bg-white rounded border border-blue-200">
                              <p className="text-xs text-gray-700">
                                Test konten {i} - Silakan scroll ke bawah untuk melihat konten lainnya. 
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                              </p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {activeTab === "files" && (
                    <div className="space-y-2">
                      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                        <CardHeader className="pb-1">
                          <CardTitle className="text-xs md:text-sm flex items-center text-green-800">
                            <FileText className="h-3 w-3 mr-1 text-green-600" />
                            File Awal Pengajuan
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {/* Bukti Mengetahui */}
                          {submission.uploadedBuktiMengetahui && (
                            <div>
                              <label className="text-xs md:text-sm font-semibold text-green-700 mb-1 block">
                                Bukti Mengetahui
                              </label>
                              {formatFileDisplay(submission.uploadedBuktiMengetahui, "Bukti Mengetahui")}
                            </div>
                          )}

                          {/* Surat Permohonan */}
                          {submission.suratPermohonan && (
                            <div>
                              <label className="text-xs md:text-sm font-semibold text-green-700 mb-1 block">
                                Surat Permohonan
                              </label>
                              {formatFileDisplay(submission.suratPermohonan, "Surat Permohonan")}
                            </div>
                          )}

                          {/* Proposal Kegiatan */}
                          {submission.proposalKegiatan && (
                            <div>
                              <label className="text-xs md:text-sm font-semibold text-green-700 mb-1 block">
                                Proposal Kegiatan
                              </label>
                              {formatFileDisplay(submission.proposalKegiatan, "Proposal Kegiatan")}
                            </div>
                          )}

                          {/* Dokumen Pendukung */}
                          {submission.dokumenPendukung && submission.dokumenPendukung.length > 0 && (
                            <div>
                              <label className="text-xs md:text-sm font-semibold text-green-700 mb-1 block">
                                Dokumen Pendukung ({submission.dokumenPendukung.length})
                              </label>
                              <div className="space-y-1">
                                {submission.dokumenPendukung.map((doc, index) => (
                                  <div key={index}>{formatFileDisplay(doc, `Dokumen Pendukung ${index + 1}`)}</div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* No files message */}
                          {!submission.uploadedBuktiMengetahui &&
                            !submission.suratPermohonan &&
                            !submission.proposalKegiatan &&
                            (!submission.dokumenPendukung || submission.dokumenPendukung.length === 0) && (
                              <div className="text-center py-4">
                                <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-1">
                                  Tidak ada file awal
                                </h3>
                                <p className="text-gray-600 text-xs md:text-sm">
                                  Belum ada file awal pengajuan yang diupload.
                                </p>
                              </div>
                            )}
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {activeTab === "content" && (
                    <div className="space-y-1.5">
                      {contentItems.length === 0 ? (
                        <Card>
                          <CardContent className="p-4 text-center">
                            <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-1">Tidak ada konten</h3>
                            <p className="text-gray-600 text-xs md:text-sm">Belum ada item konten untuk dokumen ini.</p>
                          </CardContent>
                        </Card>
                      ) : (
                        contentItems.map((item, index) => (
                          <Card
                            key={item.id}
                            className={cn(
                              "border transition-all duration-200",
                              item.isTakedown
                                ? "border-red-300 bg-red-50/50 shadow-red-100"
                                : "border-gray-200 hover:border-green-300",
                            )}
                          >
                            <CardHeader className="pb-1">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                                  <div
                                    className={cn(
                                      "w-5 h-5 rounded shadow-sm flex items-center justify-center flex-shrink-0 border",
                                      item.isTakedown ? "bg-red-100 border-red-300" : "bg-white border-green-200",
                                    )}
                                  >
                                    {getContentTypeIcon(item.jenisKonten)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <CardTitle
                                      className={cn(
                                        "text-xs md:text-sm font-bold leading-tight",
                                        item.isTakedown ? "text-red-900" : "text-gray-900",
                                      )}
                                    >
                                      {index + 1}. {item.nama || "Nama Konten Tidak Ada"}
                                    </CardTitle>
                                    <p
                                      className={cn(
                                        "text-xs md:text-sm capitalize mt-0.5",
                                        item.isTakedown ? "text-red-700" : "text-gray-600",
                                      )}
                                    >
                                      {item.jenisKonten?.replace("-", " ") || "Jenis tidak ditentukan"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-col space-y-0.5 flex-shrink-0">
                                  {getStatusBadge(item.status, item.isTakedown)}

                                  {/* Takedown button for approved content */}
                                  {item.status === "approved" && !item.isTakedown && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleTakedown(item.id, item.nama)}
                                      className="border-red-200 text-red-600 hover:bg-red-50 text-xs md:text-sm px-1 py-0.5 h-5 bg-transparent"
                                    >
                                      <Ban className="h-2 w-2 mr-0.5" />
                                      Takedown
                                    </Button>
                                  )}

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setExpandedContent(expandedContent === item.id ? null : item.id)}
                                    className="p-0.5 h-4 w-4"
                                  >
                                    <ChevronRight
                                      className={cn(
                                        "h-2 w-2 transition-transform duration-200",
                                        expandedContent === item.id && "rotate-90",
                                      )}
                                    />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>

                            <AnimatePresence>
                              {expandedContent === item.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <CardContent className="space-y-1.5 pt-0">
                                    {/* Takedown Information */}
                                    {item.isTakedown && (
                                      <div className="p-2 bg-red-100 border-2 border-red-300 rounded-lg shadow-sm">
                                        <label className="font-bold text-red-800 text-xs md:text-sm block mb-2 flex items-center">
                                          <AlertOctagon className="h-3 w-3 mr-1 animate-pulse" />
                                          KONTEN DI-TAKEDOWN
                                        </label>
                                        <div className="space-y-1.5 text-xs md:text-sm">
                                          <div className="flex justify-between items-center p-1.5 bg-red-50 rounded border border-red-200">
                                            <span className="font-semibold text-red-700">Status:</span>
                                            <Badge className="bg-red-200 text-red-900 border-red-300 text-xs md:text-sm px-2 py-1 animate-pulse">
                                              <Ban className="h-2 w-2 mr-1" />
                                              TAKEDOWN
                                            </Badge>
                                          </div>
                                          {item.tanggalTakedown && (
                                            <div className="flex justify-between items-center p-1.5 bg-red-50 rounded border border-red-200">
                                              <span className="font-semibold text-red-700">Tanggal:</span>
                                              <span className="text-red-900 font-mono">
                                                {formatDateTime(item.tanggalTakedown)}
                                              </span>
                                            </div>
                                          )}
                                          {item.takedownBy && (
                                            <div className="flex justify-between items-center p-1.5 bg-red-50 rounded border border-red-200">
                                              <span className="font-semibold text-red-700">Oleh:</span>
                                              <span className="text-red-900 font-medium">{item.takedownBy}</span>
                                            </div>
                                          )}
                                          {item.alasanTakedown && (
                                            <div className="mt-2 p-2 bg-red-200 rounded-lg border-2 border-red-400">
                                              <span className="font-bold text-red-800 block mb-1 text-xs md:text-sm">
                                                Alasan Takedown:
                                              </span>
                                              <p className="text-red-900 leading-relaxed text-xs md:text-sm font-medium bg-white p-2 rounded border border-red-300">
                                                {item.alasanTakedown}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Basic Info */}
                                    <div className="grid grid-cols-1 gap-1">
                                      <div className="p-1 bg-gray-50 rounded text-xs md:text-sm">
                                        <span className="font-semibold text-gray-700">No. Surat:</span>
                                        <span className="ml-1 font-mono">{item.nomorSurat || "Belum diisi"}</span>
                                      </div>
                                      {item.tema && (
                                        <div className="p-1 bg-green-50 rounded text-xs md:text-sm">
                                          <span className="font-semibold text-green-700">Tema:</span>
                                          <Badge className="ml-1 text-xs md:text-sm bg-green-500 text-white px-1 py-0">
                                            <Target className="h-2 w-2 mr-0.5" />
                                            {item.tema}
                                          </Badge>
                                        </div>
                                      )}
                                      <div className="p-1 bg-gray-50 rounded text-xs md:text-sm">
                                        <span className="font-semibold text-gray-700">Keterangan:</span>
                                        <span className="ml-1">{item.keterangan || "Tidak ada keterangan"}</span>
                                      </div>
                                    </div>

                                    {/* Target Media */}
                                    {(item.mediaPemerintah?.length > 0 || item.mediaMassa?.length > 0) && (
                                      <div className="p-1.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded border border-purple-200">
                                        <label className="font-semibold text-purple-700 text-xs md:text-sm block mb-1 flex items-center">
                                          <Globe className="h-2 w-2 mr-0.5" />
                                          Target Media:
                                        </label>
                                        <div className="space-y-1">
                                          {item.mediaPemerintah && item.mediaPemerintah.length > 0 && (
                                            <div>
                                              <label className="text-xs md:text-sm font-medium text-gray-600 mb-0.5 block">
                                                Pemerintah ({item.mediaPemerintah.length})
                                              </label>
                                              <div className="flex flex-wrap gap-0.5">
                                                {item.mediaPemerintah.map((media, idx) => (
                                                  <div
                                                    key={idx}
                                                    className="flex items-center space-x-0.5 p-0.5 bg-green-50 rounded border border-green-200 text-xs md:text-sm"
                                                  >
                                                    <span className="text-xs md:text-sm">{getMediaIcon(media)}</span>
                                                    <span className="font-medium text-green-800 capitalize text-xs md:text-sm">
                                                      {media}
                                                    </span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          {item.mediaMassa && item.mediaMassa.length > 0 && (
                                            <div>
                                              <label className="text-xs md:text-sm font-medium text-gray-600 mb-0.5 block">
                                                Massa ({item.mediaMassa.length})
                                              </label>
                                              <div className="flex flex-wrap gap-0.5">
                                                {item.mediaMassa.map((media, idx) => (
                                                  <div
                                                    key={idx}
                                                    className="flex items-center space-x-0.5 p-0.5 bg-blue-50 rounded border border-blue-200 text-xs md:text-sm"
                                                  >
                                                    <span className="text-xs md:text-sm">{getMediaIcon(media)}</span>
                                                    <span className="font-medium text-blue-800 capitalize text-xs md:text-sm">
                                                      {media}
                                                    </span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Dates */}
                                    <div className="grid grid-cols-1 gap-1">
                                      <div className="flex justify-between items-center p-1 bg-orange-50 rounded text-xs md:text-sm">
                                        <span className="font-semibold text-orange-700 flex items-center">
                                          <Calendar className="h-2 w-2 mr-0.5" />
                                          Order:
                                        </span>
                                        <span className="font-medium text-orange-900">
                                          {formatDate(item.tanggalOrderMasuk)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center p-1 bg-green-50 rounded text-xs md:text-sm">
                                        <span className="font-semibold text-green-700 flex items-center">
                                          <Calendar className="h-2 w-2 mr-0.5" />
                                          Jadi:
                                        </span>
                                        <span className="font-medium text-green-900">
                                          {formatDate(item.tanggalJadi)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center p-1 bg-blue-50 rounded text-xs md:text-sm">
                                        <span className="font-semibold text-blue-700 flex items-center">
                                          <Calendar className="h-2 w-2 mr-0.5" />
                                          Tayang:
                                        </span>
                                        <span className="font-medium text-blue-900">
                                          {formatDate(item.tanggalTayang)}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Narasi Text */}
                                    {item.narasiText && (
                                      <div className="p-1.5 bg-indigo-50 rounded border border-indigo-200">
                                        <label className="font-semibold text-indigo-700 text-xs md:text-sm block mb-1 flex items-center">
                                          <MessageSquare className="h-2 w-2 mr-0.5" />
                                          Narasi:
                                        </label>
                                        <div className="bg-white p-1 rounded border max-h-16 overflow-y-auto">
                                          <p className="text-gray-800 leading-relaxed text-xs md:text-sm">
                                            {item.narasiText}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Processing Information */}
                                    {(item.tanggalDiproses || item.diprosesoleh) && (
                                      <div className="grid grid-cols-1 gap-1 text-xs md:text-sm">
                                        {item.tanggalDiproses && (
                                          <div className="flex justify-between items-center p-1 bg-gray-50 rounded">
                                            <span className="font-medium text-gray-700">Diproses:</span>
                                            <span className="text-gray-900">
                                              {formatDateTime(item.tanggalDiproses)}
                                            </span>
                                          </div>
                                        )}
                                        {item.diprosesoleh && (
                                          <div className="flex justify-between items-center p-1 bg-gray-50 rounded">
                                            <span className="font-medium text-gray-700">Oleh:</span>
                                            <span className="text-gray-900">{item.diprosesoleh}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Rejection Reason */}
                                    {item.alasanPenolakan && item.status === "rejected" && (
                                      <div className="p-1.5 bg-red-50 border border-red-200 rounded">
                                        <label className="font-semibold text-red-700 text-xs md:text-sm block mb-1 flex items-center">
                                          <XCircle className="h-2 w-2 mr-0.5" />
                                          Alasan Penolakan:
                                        </label>
                                        <p className="text-red-900 leading-relaxed text-xs md:text-sm">
                                          {item.alasanPenolakan}
                                        </p>
                                      </div>
                                    )}

                                    {/* Validation Information for approved items */}
                                    {item.status === "approved" &&
                                      (item.isTayang !== undefined || item.alasanTidakTayang) && (
                                        <div className="p-1.5 bg-yellow-50 border border-yellow-200 rounded">
                                          <label className="font-semibold text-yellow-700 text-xs md:text-sm block mb-1 flex items-center">
                                            <Shield className="h-2 w-2 mr-0.5" />
                                            Status Validasi:
                                          </label>
                                          <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                              <span className="text-xs md:text-sm text-gray-600">Status:</span>
                                              <div className="flex items-center space-x-1">
                                                <Badge
                                                  className={cn(
                                                    "text-xs md:text-sm px-1 py-0",
                                                    item.isTayang
                                                      ? "bg-green-100 text-green-800 border-green-200"
                                                      : "bg-red-100 text-red-800 border-red-200",
                                                  )}
                                                >
                                                  {item.isTayang ? (
                                                    <>
                                                      <Globe className="h-2 w-2 mr-0.5" />
                                                      Tayang
                                                    </>
                                                  ) : (
                                                    <>
                                                      <EyeOff className="h-2 w-2 mr-0.5" />
                                                      Tidak Tayang
                                                    </>
                                                  )}
                                                </Badge>
                                                {item.isTakedown && (
                                                  <Badge className="bg-red-100 text-red-800 border-red-200 text-xs md:text-sm px-1 py-0">
                                                    <Ban className="h-2 w-2 mr-0.5" />
                                                    Takedown
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                            {item.tanggalValidasiTayang && (
                                              <div className="flex justify-between items-center text-xs md:text-sm">
                                                <span className="text-gray-600">Validasi:</span>
                                                <span className="text-gray-900">
                                                  {formatDate(item.tanggalValidasiTayang)}
                                                </span>
                                              </div>
                                            )}
                                            {item.validatorTayang && (
                                              <div className="flex justify-between items-center text-xs md:text-sm">
                                                <span className="text-gray-600">Validator:</span>
                                                <span className="text-gray-900">{item.validatorTayang}</span>
                                              </div>
                                            )}
                                            {item.tanggalTayangValidasi && (
                                              <div className="flex justify-between items-center text-xs md:text-sm">
                                                <span className="text-gray-600">Tgl Tayang:</span>
                                                <span className="text-gray-900">
                                                  {formatDate(item.tanggalTayangValidasi)}
                                                </span>
                                              </div>
                                            )}
                                            {item.alasanTidakTayang && (
                                              <div className="mt-1 p-1 bg-red-50 rounded border border-red-200">
                                                <span className="text-xs md:text-sm font-medium text-red-700 block mb-0.5">
                                                  Alasan Tidak Tayang:
                                                </span>
                                                <p className="text-xs md:text-sm text-red-900 leading-relaxed">
                                                  {item.alasanTidakTayang}
                                                </p>
                                              </div>
                                            )}
                                            {item.keteranganValidasi && (
                                              <div className="mt-1 p-1 bg-blue-50 rounded border border-blue-200">
                                                <span className="text-xs md:text-sm font-medium text-blue-700 block mb-0.5">
                                                  Catatan:
                                                </span>
                                                <p className="text-xs md:text-sm text-blue-900 leading-relaxed">
                                                  {item.keteranganValidasi}
                                                </p>
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
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === "approved" && (
                    <div className="space-y-1.5">
                      {approvedItems.length === 0 ? (
                        <Card>
                          <CardContent className="p-4 text-center">
                            <CheckCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-1">
                              Belum ada konten disetujui
                            </h3>
                            <p className="text-gray-600 text-xs md:text-sm">
                              Tidak ada konten yang disetujui untuk dokumen ini.
                            </p>
                          </CardContent>
                        </Card>
                      ) : (
                        approvedItems.map((item, index) => (
                          <Card
                            key={item.id}
                            className={cn(
                              "border transition-all duration-200",
                              item.isTakedown
                                ? "border-red-300 bg-red-50/50 shadow-red-100"
                                : "border-green-200 bg-green-50/30",
                            )}
                          >
                            <CardHeader className="pb-1">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                                  <div
                                    className={cn(
                                      "w-5 h-5 rounded shadow-sm flex items-center justify-center flex-shrink-0 border",
                                      item.isTakedown ? "bg-red-100 border-red-300" : "bg-white border-green-300",
                                    )}
                                  >
                                    {getContentTypeIcon(item.jenisKonten)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <CardTitle
                                      className={cn(
                                        "text-xs md:text-sm font-bold leading-tight",
                                        item.isTakedown ? "text-red-900" : "text-green-900",
                                      )}
                                    >
                                      {index + 1}. {item.nama || "Nama Konten Tidak Ada"}
                                    </CardTitle>
                                    <p
                                      className={cn(
                                        "text-xs md:text-sm capitalize mt-0.5",
                                        item.isTakedown ? "text-red-700" : "text-green-700",
                                      )}
                                    >
                                      {item.jenisKonten?.replace("-", " ") || "Jenis tidak ditentukan"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-col space-y-0.5 flex-shrink-0">
                                  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs md:text-sm px-1 py-0">
                                    <CheckCircle className="h-2 w-2 mr-0.5" />
                                    Disetujui
                                  </Badge>
                                  {item.isTakedown && (
                                    <Badge className="bg-red-100 text-red-800 border-red-200 text-xs md:text-sm px-1 py-0 animate-pulse">
                                      <Ban className="h-2 w-2 mr-0.5" />
                                      TAKEDOWN
                                    </Badge>
                                  )}
                                  {item.isConfirmed !== undefined && (
                                    <Badge
                                      className={cn(
                                        "text-xs md:text-sm px-1 py-0",
                                        item.isConfirmed
                                          ? "bg-blue-100 text-blue-800 border-blue-200"
                                          : "bg-yellow-100 text-yellow-800 border-yellow-200",
                                      )}
                                    >
                                      {item.isConfirmed ? (
                                        <>
                                          <CheckCircle className="h-2 w-2 mr-0.5" />
                                          Konfirmasi
                                        </>
                                      ) : (
                                        <>
                                          <Clock className="h-2 w-2 mr-0.5" />
                                          Belum
                                        </>
                                      )}
                                    </Badge>
                                  )}
                                  {item.isTayang !== undefined && (
                                    <Badge
                                      className={cn(
                                        "text-xs md:text-sm px-1 py-0",
                                        item.isTayang
                                          ? "bg-blue-100 text-blue-800 border-blue-200"
                                          : "bg-orange-100 text-orange-800 border-orange-200",
                                      )}
                                    >
                                      {item.isTayang ? (
                                        <>
                                          <Globe className="h-2 w-2 mr-0.5" />
                                          Tayang
                                        </>
                                      ) : (
                                        <>
                                          <EyeOff className="h-2 w-2 mr-0.5" />
                                          Belum
                                        </>
                                      )}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-1">
                              <div className="grid grid-cols-1 gap-1 text-xs md:text-sm">
                                <div className="flex justify-between items-center p-1 bg-white rounded border border-green-200">
                                  <span className="font-medium text-gray-700">Diproses:</span>
                                  <span className="text-gray-900">{item.diprosesoleh || "Belum diisi"}</span>
                                </div>
                                <div className="flex justify-between items-center p-1 bg-white rounded border border-green-200">
                                  <span className="font-medium text-gray-700">Tanggal:</span>
                                  <span className="text-gray-900">{formatDateTime(item.tanggalDiproses)}</span>
                                </div>
                              </div>

                              {/* Takedown Info */}
                              {item.isTakedown && (
                                <div className="p-2 bg-red-100 border-2 border-red-300 rounded-lg">
                                  <label className="font-bold text-red-800 text-xs md:text-sm flex items-center mb-1">
                                    <AlertOctagon className="h-3 w-3 mr-1 animate-pulse" />
                                    TAKEDOWN:
                                  </label>
                                  <div className="mt-1 space-y-1 text-xs md:text-sm">
                                    <p className="bg-red-50 p-1.5 rounded border border-red-200">
                                      <span className="font-semibold">Status:</span> Konten di-takedown
                                    </p>
                                    {item.tanggalTakedown && (
                                      <p className="bg-red-50 p-1.5 rounded border border-red-200">
                                        <span className="font-semibold">Tanggal:</span>{" "}
                                        {formatDateTime(item.tanggalTakedown)}
                                      </p>
                                    )}
                                    {item.takedownBy && (
                                      <p className="bg-red-50 p-1.5 rounded border border-red-200">
                                        <span className="font-semibold">Oleh:</span> {item.takedownBy}
                                      </p>
                                    )}
                                    {item.alasanTakedown && (
                                      <div className="bg-red-200 p-2 rounded border border-red-400">
                                        <span className="font-semibold block mb-1">Alasan:</span>
                                        <p className="bg-white p-1.5 rounded border border-red-300 font-medium">
                                          {item.alasanTakedown}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Confirmation Info */}
                              {item.isConfirmed !== undefined && (
                                <div className="p-1 bg-blue-50 border border-blue-200 rounded">
                                  <label className="font-medium text-blue-700 text-xs md:text-sm">Konfirmasi:</label>
                                  <div className="mt-0.5 space-y-0.5 text-xs md:text-sm">
                                    <p>
                                      <span className="font-medium">Status:</span>{" "}
                                      {item.isConfirmed ? "Sudah Dikonfirmasi" : "Belum Dikonfirmasi"}
                                    </p>
                                    {item.tanggalKonfirmasi && (
                                      <p>
                                        <span className="font-medium">Tanggal:</span>{" "}
                                        {formatDateTime(item.tanggalKonfirmasi)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Validation Info */}
                              {item.isTayang !== undefined && (
                                <div className="p-1 bg-purple-50 border border-purple-200 rounded">
                                  <label className="font-medium text-purple-700 text-xs md:text-sm">Validasi:</label>
                                  <div className="mt-0.5 space-y-0.5 text-xs md:text-sm">
                                    <p>
                                      <span className="font-medium">Status:</span>{" "}
                                      {item.isTayang ? "Sudah Tayang" : "Belum Tayang"}
                                    </p>
                                    {item.validatorTayang && (
                                      <p>
                                        <span className="font-medium">Validator:</span> {item.validatorTayang}
                                      </p>
                                    )}
                                    {item.tanggalValidasiTayang && (
                                      <p>
                                        <span className="font-medium">Tanggal:</span>{" "}
                                        {formatDateTime(item.tanggalValidasiTayang)}
                                      </p>
                                    )}
                                    {item.keteranganValidasi && (
                                      <p>
                                        <span className="font-medium">Keterangan:</span> {item.keteranganValidasi}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === "output" && (
                    <div className="space-y-1.5">
                      {approvedItems.filter(
                        (item) =>
                          item.hasilProdukValidasiFile ||
                          item.hasilProdukValidasiLink ||
                          item.hasilProdukFile ||
                          item.hasilProdukLink,
                      ).length === 0 ? (
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Sparkles className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-1">Belum ada output</h3>
                            <p className="text-gray-600 text-xs md:text-sm">
                              Belum ada hasil produksi yang tersedia untuk dokumen ini.
                            </p>
                          </CardContent>
                        </Card>
                      ) : (
                        approvedItems
                          .filter(
                            (item) =>
                              item.hasilProdukValidasiFile ||
                              item.hasilProdukValidasiLink ||
                              item.hasilProdukFile ||
                              item.hasilProdukLink,
                          )
                          .map((item, index) => (
                            <Card
                              key={item.id}
                              className={cn(
                                "border transition-all duration-200",
                                item.isTakedown
                                  ? "border-red-300 bg-red-50/50 shadow-red-100"
                                  : "border-purple-200 bg-purple-50/30",
                              )}
                            >
                              <CardHeader className="pb-1">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                                    <div
                                      className={cn(
                                        "w-5 h-5 rounded shadow-sm flex items-center justify-center flex-shrink-0 border",
                                        item.isTakedown ? "bg-red-100 border-red-300" : "bg-white border-purple-300",
                                      )}
                                    >
                                      {getContentTypeIcon(item.jenisKonten)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <CardTitle
                                        className={cn(
                                          "text-xs md:text-sm font-bold leading-tight",
                                          item.isTakedown ? "text-red-900" : "text-purple-900",
                                        )}
                                      >
                                        {index + 1}. {item.nama || "Nama Konten Tidak Ada"}
                                      </CardTitle>
                                      <p
                                        className={cn(
                                          "text-xs md:text-sm capitalize mt-0.5",
                                          item.isTakedown ? "text-red-700" : "text-purple-700",
                                        )}
                                      >
                                        {item.jenisKonten?.replace("-", " ") || "Jenis tidak ditentukan"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex flex-col space-y-0.5 flex-shrink-0">
                                    <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs md:text-sm px-1 py-0">
                                      <Sparkles className="h-2 w-2 mr-0.5" />
                                      Output
                                    </Badge>
                                    {item.isTakedown && (
                                      <Badge className="bg-red-100 text-red-800 border-red-200 text-xs md:text-sm px-1 py-0 animate-pulse">
                                        <Ban className="h-2 w-2 mr-0.5" />
                                        TAKEDOWN
                                      </Badge>
                                    )}
                                    {item.isTayang !== undefined && (
                                      <Badge
                                        className={cn(
                                          "text-xs md:text-sm px-1 py-0",
                                          item.isTayang
                                            ? "bg-blue-100 text-blue-800 border-blue-200"
                                            : "bg-orange-100 text-orange-800 border-orange-200",
                                        )}
                                      >
                                        {item.isTayang ? (
                                          <>
                                            <Globe className="h-2 w-2 mr-0.5" />
                                            Live
                                          </>
                                        ) : (
                                          <>
                                            <EyeOff className="h-2 w-2 mr-0.5" />
                                            Draft
                                          </>
                                        )}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-1.5">
                                {/* Takedown Warning */}
                                {item.isTakedown && (
                                  <div className="p-2 bg-red-100 border-2 border-red-300 rounded-lg">
                                    <div className="flex items-center space-x-1 mb-1">
                                      <AlertOctagon className="h-3 w-3 text-red-600 animate-pulse" />
                                      <span className="text-xs md:text-sm font-bold text-red-800">KONTEN TAKEDOWN</span>
                                    </div>
                                    <p className="text-xs md:text-sm text-red-700 bg-red-50 p-1.5 rounded border border-red-200">
                                      Konten ini telah di-takedown pada {formatDateTime(item.tanggalTakedown)}
                                      oleh {item.takedownBy}. Alasan: {item.alasanTakedown}
                                    </p>
                                  </div>
                                )}

                                {/* Validation Output Files - Priority to validation files */}
                                <div>
                                  <label className="font-medium text-gray-700 mb-1 block text-xs md:text-sm flex items-center">
                                    <Zap className="h-2.5 w-2.5 mr-0.5 text-purple-600" />
                                    Hasil Final:
                                  </label>
                                  <div className="space-y-1">
                                    {/* Show validation files first (from validation output page) */}
                                    {item.hasilProdukValidasiFile && (
                                      <div className="p-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded border border-purple-200">
                                        <div className="flex items-center space-x-1 mb-1">
                                          <Star className="h-2.5 w-2.5 text-purple-600" />
                                          <span className="text-xs md:text-sm font-semibold text-purple-800">
                                            File Validasi
                                          </span>
                                        </div>
                                        {formatFileDisplay(
                                          item.hasilProdukValidasiFile,
                                          `Hasil Validasi - ${item.nama}`,
                                        )}
                                        {item.tanggalTayangValidasi && (
                                          <div className="mt-1 p-1 bg-purple-100 rounded border border-purple-300">
                                            <div className="flex items-center justify-between text-xs md:text-sm">
                                              <span className="font-medium text-purple-700">Tgl Tayang:</span>
                                              <span className="text-purple-900">
                                                {formatDate(item.tanggalTayangValidasi)}
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {item.hasilProdukValidasiLink && (
                                      <div className="p-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded border border-purple-200">
                                        <div className="flex items-center space-x-1 mb-1">
                                          <Star className="h-2.5 w-2.5 text-purple-600" />
                                          <span className="text-xs md:text-sm font-semibold text-purple-800">
                                            Link Validasi
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-1 p-1 bg-blue-50 rounded border border-blue-200">
                                          <LinkIcon className="h-2.5 w-2.5 text-blue-600 flex-shrink-0" />
                                          <a
                                            href={item.hasilProdukValidasiLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline flex-1 truncate text-xs md:text-sm"
                                          >
                                            {item.hasilProdukValidasiLink}
                                          </a>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => window.open(item.hasilProdukValidasiLink, "_blank")}
                                            className="p-0.5 h-4 w-4 bg-white hover:bg-blue-50 border-blue-200"
                                          >
                                            <ExternalLink className="h-2 w-2" />
                                          </Button>
                                        </div>
                                        {item.tanggalTayangValidasi && (
                                          <div className="mt-1 p-1 bg-purple-100 rounded border border-purple-300">
                                            <div className="flex items-center justify-between text-xs md:text-sm">
                                              <span className="font-medium text-purple-700">Tgl Tayang:</span>
                                              <span className="text-purple-900">
                                                {formatDate(item.tanggalTayangValidasi)}
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Show original production files if no validation files */}
                                    {!item.hasilProdukValidasiFile && !item.hasilProdukValidasiLink && (
                                      <>
                                        {item.hasilProdukFile && (
                                          <div className="p-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded border border-amber-200">
                                            <div className="flex items-center space-x-1 mb-1">
                                              <Info className="h-2.5 w-2.5 text-amber-600" />
                                              <span className="text-xs md:text-sm font-semibold text-amber-800">
                                                File Awal
                                              </span>
                                            </div>
                                            {formatFileDisplay(item.hasilProdukFile, `Hasil Produksi - ${item.nama}`)}
                                          </div>
                                        )}

                                        {item.hasilProdukLink && (
                                          <div className="p-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded border border-amber-200">
                                            <div className="flex items-center space-x-1 mb-1">
                                              <Info className="h-2.5 w-2.5 text-amber-600" />
                                              <span className="text-xs md:text-sm font-semibold text-amber-800">
                                                Link Awal
                                              </span>
                                            </div>
                                            <div className="flex items-center space-x-1 p-1 bg-blue-50 rounded border border-blue-200">
                                              <LinkIcon className="h-2.5 w-2.5 text-blue-600 flex-shrink-0" />
                                              <a
                                                href={item.hasilProdukLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline flex-1 truncate text-xs md:text-sm"
                                              >
                                                {item.hasilProdukLink}
                                              </a>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => window.open(item.hasilProdukLink, "_blank")}
                                                className="p-0.5 h-4 w-4 bg-white hover:bg-blue-50 border-blue-200"
                                              >
                                                <ExternalLink className="h-2 w-2" />
                                              </Button>
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Publishing Status */}
                                <div className="p-1.5 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded">
                                  <label className="font-medium text-blue-700 text-xs md:text-sm block mb-1 flex items-center">
                                    <Globe className="h-2.5 w-2.5 mr-0.5" />
                                    Status Publikasi:
                                  </label>
                                  <div className="space-y-1 text-xs md:text-sm">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">Status:</span>
                                      <div className="flex items-center space-x-1">
                                        <Badge
                                          className={cn(
                                            "text-xs md:text-sm px-1 py-0",
                                            item.isTayang
                                              ? "bg-green-100 text-green-800 border-green-200"
                                              : "bg-orange-100 text-orange-800 border-orange-200",
                                          )}
                                        >
                                          {item.isTayang ? (
                                            <>
                                              <Globe className="h-2 w-2 mr-0.5" />
                                              Sudah Tayang
                                            </>
                                          ) : (
                                            <>
                                              <EyeOff className="h-2 w-2 mr-0.5" />
                                              Belum Tayang
                                            </>
                                          )}
                                        </Badge>
                                        {item.isTakedown && (
                                          <Badge className="bg-red-100 text-red-800 border-red-200 text-xs md:text-sm px-1 py-0">
                                            <Ban className="h-2 w-2 mr-0.5" />
                                            Takedown
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    {item.validatorTayang && (
                                      <p>
                                        <span className="font-medium">Validator:</span> {item.validatorTayang}
                                      </p>
                                    )}
                                    {item.tanggalValidasiTayang && (
                                      <p>
                                        <span className="font-medium">Validasi:</span>{" "}
                                        {formatDateTime(item.tanggalValidasiTayang)}
                                      </p>
                                    )}
                                    {item.tanggalTayangValidasi && (
                                      <p>
                                        <span className="font-medium">Tayang:</span>{" "}
                                        {formatDate(item.tanggalTayangValidasi)}
                                      </p>
                                    )}
                                    {item.keteranganValidasi && (
                                      <p>
                                        <span className="font-medium">Catatan:</span> {item.keteranganValidasi}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
          </div>

          {/* Mobile Footer - Compact */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white border-t border-gray-200 p-2 md:p-4 flex-shrink-0 shadow-lg"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5 text-xs text-gray-600 flex-1 min-w-0">
                <Activity className="h-2 w-2 flex-shrink-0" />
                <span className="truncate">
                  {contentItems.length} konten • {approvedItems.length} setuju • {publishedItems.length} tayang •{" "}
                  {takedownItems.length} takedown
                </span>
              </div>
              <div className="flex items-center space-x-1.5 flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  size="sm"
                  className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 text-xs px-3 py-1 h-7 whitespace-nowrap"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={previewModal.isOpen}
        onOpenChange={(open) => setPreviewModal({ ...previewModal, isOpen: open })}
        file={previewModal.file}
        url={previewModal.url}
        type={previewModal.type}
        fileName={previewModal.fileName}
        title={previewModal.title}
      />

      {/* Takedown Dialog */}
      <Dialog open={isTakedownDialogOpen} onOpenChange={setIsTakedownDialogOpen}>
        <DialogContent className="max-w-[90vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Ban className="h-5 w-5 text-red-600" />
              <span>Takedown Konten</span>
            </DialogTitle>
            <DialogDescription>
              Anda akan melakukan takedown pada konten "<strong>{selectedItemName}</strong>". Masukkan alasan untuk
              melakukan takedown. Konten akan tetap dianggap tayang namun ditandai sebagai takedown.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="takedown-reason" className="text-sm font-medium text-red-700">
                Alasan Takedown *
              </Label>
              <Textarea
                id="takedown-reason"
                value={takedownReason}
                onChange={(e) => setTakedownReason(e.target.value)}
                placeholder="Masukkan alasan takedown konten..."
                className="min-h-[100px] mt-2 border-red-200 focus:border-red-400 focus:ring-red-400"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">Minimal 10 karakter. Alasan ini akan dicatat dalam sistem.</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsTakedownDialogOpen(false)
                setTakedownReason("")
                setSelectedItemId("")
                setSelectedItemName("")
              }}
            >
              Batal
            </Button>
            <Button
              onClick={confirmTakedown}
              disabled={!takedownReason.trim() || takedownReason.trim().length < 10}
              className="bg-red-600 hover:bg-red-700"
            >
              <Ban className="h-4 w-4 mr-2" />
              Takedown Konten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
