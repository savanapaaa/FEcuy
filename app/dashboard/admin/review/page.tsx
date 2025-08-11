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
import { getReviews } from "@/lib/api-client"

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

  // Load submissions from localStorage - only those that need review
  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setIsLoading(true)
        console.log("Loading reviews...")

        // Add global function for debugging
        if (typeof window !== "undefined") {
          (window as any).addTestData = () => {
            const testSubmissions = [
              {
                id: Date.now(),
                noComtab: "20250808101530/IKP/08/2025",
                pin: "1234",
                tema: "Kesehatan",
                judul: "Kampanye Hidup Sehat",
                jenisMedia: "Digital",
                mediaPemerintah: ["Website", "Instagram"],
                mediaMassa: ["Kompas", "Detik"],
                jenisKonten: ["video", "infografis"],
                tanggalOrder: new Date("2025-08-05"),
                petugasPelaksana: "John Doe",
                supervisor: "Jane Smith",
                durasi: "30 hari",
                jumlahProduksi: "5 konten",
                tanggalSubmit: new Date("2025-08-07"),
                lastModified: new Date(),
                isConfirmed: true,
                workflowStage: "review",
                contentItems: [
                  {
                    id: "content-1",
                    nama: "Video Edukasi Hidup Sehat",
                    jenisKonten: "video",
                    mediaPemerintah: ["Instagram", "YouTube"],
                    mediaMassa: ["TV One"],
                    nomorSurat: "001/KEK/2025",
                    narasiText: "Video edukasi tentang pola hidup sehat untuk masyarakat umum",
                    sourceNarasi: ["text"],
                    sourceAudioDubbing: ["file-audio"],
                    sourceAudioBacksound: ["file-audio"],
                    sourcePendukungLainnya: ["video"],
                    tanggalOrderMasuk: new Date("2025-08-05"),
                    tanggalJadi: new Date("2025-08-10"),
                    tanggalTayang: new Date("2025-08-15"),
                    keterangan: "Konten untuk kampanye kesehatan masyarakat",
                    status: "pending"
                  },
                  {
                    id: "content-2",
                    nama: "Infografis Tips Gizi Seimbang",
                    jenisKonten: "infografis",
                    mediaPemerintah: ["Website", "Instagram"],
                    mediaMassa: ["Kompas", "Republika"],
                    nomorSurat: "002/KEK/2025",
                    narasiText: "Infografis berisi tips dan panduan gizi seimbang",
                    sourceNarasi: ["text", "file"],
                    sourceAudioDubbing: [],
                    sourceAudioBacksound: [],
                    sourcePendukungLainnya: ["foto"],
                    tanggalOrderMasuk: new Date("2025-08-05"),
                    tanggalJadi: new Date("2025-08-12"),
                    tanggalTayang: new Date("2025-08-16"),
                    keterangan: "Infografis untuk edukasi gizi masyarakat",
                    status: "pending"
                  }
                ]
              },
              {
                id: Date.now() + 1,
                noComtab: "20250808102030/IKP/08/2025",
                pin: "5678",
                tema: "Pendidikan",
                judul: "Program Literasi Digital",
                jenisMedia: "Digital & Cetak",
                mediaPemerintah: ["Website", "Facebook", "Majalah"],
                mediaMassa: ["Tempo", "CNN Indonesia"],
                jenisKonten: ["video", "artikel", "poster"],
                tanggalOrder: new Date("2025-08-06"),
                petugasPelaksana: "Sarah Wilson",
                supervisor: "Michael Brown",
                durasi: "45 hari",
                jumlahProduksi: "8 konten",
                tanggalSubmit: new Date("2025-08-08"),
                lastModified: new Date(),
                isConfirmed: true,
                workflowStage: "review",
                contentItems: [
                  {
                    id: "content-3",
                    nama: "Video Tutorial Literasi Digital",
                    jenisKonten: "video",
                    mediaPemerintah: ["YouTube", "Facebook"],
                    mediaMassa: ["Metro TV"],
                    nomorSurat: "003/EDU/2025",
                    narasiText: "Video tutorial pembelajaran literasi digital untuk siswa",
                    sourceNarasi: ["text", "surat"],
                    sourceAudioDubbing: ["file-audio"],
                    sourceAudioBacksound: ["file-audio"],
                    sourcePendukungLainnya: ["video", "foto"],
                    tanggalOrderMasuk: new Date("2025-08-06"),
                    tanggalJadi: new Date("2025-08-20"),
                    tanggalTayang: new Date("2025-08-25"),
                    keterangan: "Video pembelajaran untuk siswa SD dan SMP",
                    status: "pending"
                  },
                  {
                    id: "content-4",
                    nama: "Artikel Pentingnya Literasi Digital",
                    jenisKonten: "artikel",
                    mediaPemerintah: ["Website", "Majalah"],
                    mediaMassa: ["Tempo", "Kompas"],
                    nomorSurat: "004/EDU/2025",
                    narasiText: "Artikel mengenai pentingnya literasi digital di era modern",
                    sourceNarasi: ["text"],
                    sourceAudioDubbing: [],
                    sourceAudioBacksound: [],
                    sourcePendukungLainnya: ["foto"],
                    tanggalOrderMasuk: new Date("2025-08-06"),
                    tanggalJadi: new Date("2025-08-18"),
                    tanggalTayang: new Date("2025-08-22"),
                    keterangan: "Artikel untuk publikasi media massa",
                    status: "pending"
                  }
                ]
              },
              {
                id: Date.now() + 2,
                noComtab: "20250808103045/IKP/08/2025",
                pin: "9012",
                tema: "Ekonomi",
                judul: "Sosialisasi UMKM Digital",
                jenisMedia: "Digital",
                mediaPemerintah: ["Instagram", "TikTok", "Website"],
                mediaMassa: ["Bisnis Indonesia", "SWA"],
                jenisKonten: ["video", "infografis", "carousel"],
                tanggalOrder: new Date("2025-08-07"),
                petugasPelaksana: "Ahmad Rizki",
                supervisor: "Siti Nurhaliza",
                durasi: "20 hari",
                jumlahProduksi: "6 konten",
                tanggalSubmit: new Date("2025-08-08"),
                lastModified: new Date(),
                isConfirmed: true,
                workflowStage: "review",
                contentItems: [
                  {
                    id: "content-5",
                    nama: "Video Profil UMKM Sukses",
                    jenisKonten: "video",
                    mediaPemerintah: ["Instagram", "TikTok"],
                    mediaMassa: ["Bisnis Indonesia"],
                    nomorSurat: "005/ECO/2025",
                    narasiText: "Video profil UMKM yang berhasil go digital",
                    sourceNarasi: ["text"],
                    sourceAudioDubbing: ["file-audio"],
                    sourceAudioBacksound: ["file-audio"],
                    sourcePendukungLainnya: ["video", "foto"],
                    tanggalOrderMasuk: new Date("2025-08-07"),
                    tanggalJadi: new Date("2025-08-27"),
                    tanggalTayang: new Date("2025-08-30"),
                    keterangan: "Video inspiratif untuk UMKM lainnya",
                    status: "pending"
                  }
                ]
              }
            ]
            
            localStorage.setItem("submissions", JSON.stringify(testSubmissions))
            console.log("✅ Test data added! Reload the page.")
            window.location.reload()
          }
          
          (window as any).addMoreTestData = () => {
            const existingData = JSON.parse(localStorage.getItem("submissions") || "[]")
            const additionalSubmissions = [
              {
                id: Date.now() + 10,
                noComtab: "20250808104500/IKP/08/2025",
                pin: "3456",
                tema: "Lingkungan",
                judul: "Kampanye Go Green",
                jenisMedia: "Digital & Konvensional",
                mediaPemerintah: ["Instagram", "Facebook", "Radio"],
                mediaMassa: ["Antara", "Kontan"],
                jenisKonten: ["video", "audio", "poster"],
                tanggalOrder: new Date("2025-08-07"),
                petugasPelaksana: "Eko Prasetyo",
                supervisor: "Dewi Sartika",
                durasi: "25 hari",
                jumlahProduksi: "4 konten",
                tanggalSubmit: new Date("2025-08-08"),
                lastModified: new Date(),
                isConfirmed: true,
                workflowStage: "review",
                contentItems: [
                  {
                    id: "content-env-1",
                    nama: "Video Edukasi Reduce Reuse Recycle",
                    jenisKonten: "video",
                    mediaPemerintah: ["Instagram", "YouTube"],
                    mediaMassa: ["Antara"],
                    nomorSurat: "006/ENV/2025",
                    narasiText: "Video edukasi tentang pengelolaan sampah dengan konsep 3R",
                    sourceNarasi: ["text", "file"],
                    sourceAudioDubbing: ["file-audio"],
                    sourceAudioBacksound: ["file-audio"],
                    sourcePendukungLainnya: ["video", "foto"],
                    tanggalOrderMasuk: new Date("2025-08-07"),
                    tanggalJadi: new Date("2025-09-01"),
                    tanggalTayang: new Date("2025-09-05"),
                    keterangan: "Video untuk kampanye lingkungan hidup",
                    status: "pending"
                  },
                  {
                    id: "content-env-2",
                    nama: "Audio Spot Radio Lingkungan",
                    jenisKonten: "audio",
                    mediaPemerintah: ["Radio"],
                    mediaMassa: ["Radio Elshinta"],
                    nomorSurat: "007/ENV/2025",
                    narasiText: "Audio spot 30 detik tentang kebersihan lingkungan",
                    sourceNarasi: ["text"],
                    sourceAudioDubbing: ["file-audio"],
                    sourceAudioBacksound: ["file-audio"],
                    sourcePendukungLainnya: [],
                    tanggalOrderMasuk: new Date("2025-08-07"),
                    tanggalJadi: new Date("2025-08-28"),
                    tanggalTayang: new Date("2025-09-02"),
                    keterangan: "Audio untuk siaran radio",
                    status: "pending"
                  }
                ]
              }
            ]
            
            const combined = [...existingData, ...additionalSubmissions]
            localStorage.setItem("submissions", JSON.stringify(combined))
            console.log("✅ Additional test data added! Reload the page.")
            window.location.reload()
          }
          
          (window as any).clearTestData = () => {
            localStorage.removeItem("submissions")
            console.log("🗑️ Test data cleared! Reload the page.")
            window.location.reload()
          }
        }

        // Try to load from API first
        const response = await getReviews()
        console.log("Reviews response:", response)

        if (response.success && response.data) {
          // Transform API data to match our interface
          const reviewItems = response.data.map((submission: any) => {
            const reviewItem: Submission = {
              id: submission.id,
              noComtab: submission.noComtab || `COM-${submission.id}`,
              pin: submission.pin || "0000",
              tema: submission.tema || "Tidak ada tema",
              judul: submission.judul || "Tidak ada judul",
              jenisMedia: submission.jenisMedia || "",
              mediaPemerintah: submission.mediaPemerintah || [],
              mediaMassa: submission.mediaMassa || [],
              jenisKonten: submission.jenisKonten || [],
              tanggalOrder: submission.tanggalOrder ? new Date(submission.tanggalOrder) : undefined,
              petugasPelaksana: submission.petugasPelaksana || "",
              supervisor: submission.supervisor || "",
              durasi: submission.durasi || "",
              jumlahProduksi: submission.jumlahProduksi || "",
              tanggalSubmit: submission.tanggalSubmit ? new Date(submission.tanggalSubmit) : new Date(),
              lastModified: submission.lastModified ? new Date(submission.lastModified) : new Date(),
              uploadedBuktiMengetahui: submission.uploadedBuktiMengetahui,
              isConfirmed: true,
              tanggalKonfirmasi: submission.tanggalKonfirmasi,
              contentItems: submission.contentItems || [],
              buktiMengetahui: submission.buktiMengetahui,
              dokumenPendukung: submission.dokumenPendukung || [],
              workflowStage: getWorkflowStage(submission),
              tanggalReview: submission.tanggalReview,
            }
            return reviewItem
          })

          // Filter submissions that need review
          const reviewSubmissions = reviewItems.filter((sub: Submission) => {
            if (!sub.isConfirmed) return false
            if (sub.workflowStage && sub.workflowStage !== "review") return false
            const contentItems = sub.contentItems || []
            if (contentItems.length === 0) return true
            const hasPendingItems = contentItems.some((item: ContentItem) => !item.status || item.status === "pending")
            return hasPendingItems
          })

          setSubmissions(reviewSubmissions)
        } else {
          throw new Error("API not available")
        }
      } catch (error) {
        console.error("Error loading from API, falling back to localStorage:", error)

        // Fallback to localStorage
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("submissions")
          if (stored) {
            const parsedSubmissions = JSON.parse(stored)
            console.log("📊 Total submissions in localStorage:", parsedSubmissions.length)
            
            // Debug each submission
            parsedSubmissions.forEach((sub: any, index: number) => {
              console.log(`🔍 Submission ${index + 1}: ${sub.judul}`)
              console.log(`   - isConfirmed: ${sub.isConfirmed}`)
              console.log(`   - workflowStage: ${sub.workflowStage}`)
              console.log(`   - contentItems: ${sub.contentItems?.length || 0}`)
            })
            
            // Filter submissions that need review:
            // 1. Must be confirmed (submitted)
            // 2. Must have workflowStage as "review"
            // 3. Must have content items that are pending review OR no content items yet
            const reviewSubmissions = parsedSubmissions.filter((sub: any) => {
              // Must be confirmed/submitted
              if (!sub.isConfirmed) {
                console.log(`❌ ${sub.judul}: Not confirmed (isConfirmed: ${sub.isConfirmed})`)
                return false
              }
              
              // Check workflow stage - should be "review"
              if (sub.workflowStage !== "review") {
                console.log(`❌ ${sub.judul}: Wrong stage (${sub.workflowStage})`)
                return false
              }
              
              // If no content items, it needs review setup
              const contentItems = sub.contentItems || []
              if (contentItems.length === 0) {
                console.log(`✅ ${sub.judul}: No content items, needs review`)
                return true
              }
              
              // Check if any content items are still pending review
              const hasPendingItems = contentItems.some(
                (item: any) => !item.status || item.status === "pending",
              )
              console.log(`${hasPendingItems ? '✅' : '❌'} ${sub.judul}: Has pending items: ${hasPendingItems}`)
              return hasPendingItems
            })
            
            console.log("📋 Submissions filtered for review:", reviewSubmissions.length)
            setSubmissions(reviewSubmissions)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    setTimeout(() => loadSubmissions(), 800) // Simulate loading
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
  const pendingReview = submissions.filter((sub) => {
    const contentItems = sub.contentItems || []
    return contentItems.some((item) => !item.status || item.status === "pending")
  }).length

  const handleReviewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission)
    setIsDialogOpen(true)
  }

  // Called by ContentReviewDialog when the review is finished
  const handleUpdate = async (updatedSubmissions: Submission[]) => {
    try {
      // Update workflow stages and add review timestamp for all submissions
      const submissionsWithStages = updatedSubmissions.map((sub) => {
        const workflowStage = getWorkflowStage(sub)
        // Add review timestamp if all content items have been reviewed
        const contentItems = sub.contentItems || []
        const allReviewed = contentItems.every(
          (item: ContentItem) => item.status === "approved" || item.status === "rejected",
        )
        const updatedSub: Submission = {
          ...sub,
          workflowStage: workflowStage as "submitted" | "review" | "validation" | "completed",
          // Add review timestamp if this submission was just fully reviewed
          tanggalReview: allReviewed && !sub.tanggalReview ? new Date().toISOString() : sub.tanggalReview,
        }
        return updatedSub
      })

      // Save each updated submission to server
      for (const submission of submissionsWithStages) {
        try {
          console.log(`🔄 Saving review for submission ${submission.id}...`)
          
          // Use the review API endpoint
          await fetch(`/api/reviews/${submission.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: submission.workflowStage === 'validation' ? 'approved' : 'pending',
              notes: `Review completed at ${new Date().toISOString()}`,
              reviewerId: 'current-user-id', // TODO: Get from auth context
              contentItems: submission.contentItems
            })
          })
          
          console.log(`✅ Review saved for submission ${submission.id}`)
        } catch (error) {
          console.error(`❌ Failed to save review for submission ${submission.id}:`, error)
        }
      }

      // Update localStorage cache
      if (typeof window !== "undefined") {
        localStorage.setItem("submissions", JSON.stringify(submissionsWithStages))
      }

      // Filter only submissions that still need review
      const reviewSubmissions = submissionsWithStages.filter((sub: Submission) => {
        if (!sub.isConfirmed) return false
        if (sub.workflowStage && sub.workflowStage !== "review") return false
        const contentItems = sub.contentItems || []
        if (contentItems.length === 0) return true
        // Check if any content items are still pending review
        // const hasPendingItems = contentItems.some((item: ContentItem) => !item.status || item.status === "pending")
        // return hasPendingItems
      })

      setSubmissions(reviewSubmissions)

      // Show success message
      toast({
        title: "Review berhasil disimpan",
        description: "Dokumen yang sudah direview akan pindah ke tahap validasi",
        variant: "default",
      })
      
    } catch (error) {
      console.error("❌ Failed to save reviews:", error)
      toast({
        title: "Gagal menyimpan review",
        description: "Terjadi kesalahan saat menyimpan review ke server",
        variant: "destructive",
      })
    }
  }

  // Keep dialog & selection in-sync
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) setSelectedSubmission(null)
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Disetujui</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Ditolak</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">Pending</Badge>
    }
  }

  const getSubmissionStatus = (submission: Submission) => {
    const contentItems = submission.contentItems || []
    const hasPending = contentItems.some((item) => !item.status || item.status === "pending")
    const hasApproved = contentItems.some((item) => item.status === "approved")
    const hasRejected = contentItems.some((item) => item.status === "rejected")

    if (hasPending) return "pending"
    if (hasApproved && !hasRejected) return "approved"
    if (hasRejected) return "rejected"
    return "pending"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4 w-12 h-12"></div>
          <p className="font-semibold text-blue-700 text-base">Memuat Data Review...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3 flex-1"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/admin")}
                className="border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center space-x-2 px-3 py-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Kembali</span>
              </Button>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg w-10 h-10"
              >
                <FileText className="text-white h-5 w-5" />
              </motion.div>
              <div className="flex-1">
                <h1 className="font-bold text-blue-900 text-xl">Review Dokumen</h1>
                <p className="text-blue-600 text-sm">Kelola dan review dokumen yang masuk</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center space-x-2"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStats(!showStats)}
                className="text-blue-600 hover:bg-blue-50 p-2"
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="border-blue-200 text-blue-600 hover:bg-blue-50 p-2"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
          {/* Search Bar */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
            <Input
              placeholder="Cari dokumen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-blue-200 focus:ring-blue-500 focus:border-blue-500 bg-white/80 text-sm"
            />
          </div>
        </div>
      </motion.header>

      {/* Statistics */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-3 bg-white/50">
              <div className="grid gap-4 grid-cols-2">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-600 mb-1">Dokumen Perlu Review</p>
                        <motion.p
                          key={totalSubmissions}
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="font-bold text-blue-900 text-2xl"
                        >
                          {totalSubmissions}
                        </motion.p>
                      </div>
                      <motion.div
                        whileHover={{ rotate: 15 }}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg w-12 h-12"
                      >
                        <FileText className="h-6 w-6 text-white" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-orange-600 mb-1">Konten Pending</p>
                        <motion.p
                          key={pendingReview}
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="font-bold text-orange-900 text-2xl"
                        >
                          {submissions.reduce((total, sub) => {
                            const pendingItems =
                              sub.contentItems?.filter((item) => !item.status || item.status === "pending") || []
                            return total + pendingItems.length
                          }, 0)}
                        </motion.p>
                      </div>
                      <motion.div
                        whileHover={{ rotate: 15 }}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg w-12 h-12"
                      >
                        <Clock className="h-6 w-6 text-white" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 space-y-4 pb-20">
        {/* Results Info */}
        <div className="flex items-center justify-between text-sm text-blue-600">
          <span>Menampilkan {filteredSubmissions.length} dokumen</span>
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="text-blue-600 hover:bg-blue-50 p-1"
            >
              <XCircle className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Submissions List */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <AnimatePresence>
            {filteredSubmissions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12"
              >
                <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
                  <CardContent className="p-8">
                    <CheckCircle className="text-green-400 mx-auto mb-4 h-12 w-12" />
                    <h3 className="font-semibold text-blue-900 mb-2 text-lg">
                      {searchTerm || filterStatus !== "all"
                        ? "Tidak ada dokumen yang sesuai"
                        : "Semua dokumen sudah direview!"}
                    </h3>
                    <p className="text-blue-600 text-sm">
                      {searchTerm || filterStatus !== "all"
                        ? "Tidak ada dokumen yang sesuai dengan filter atau pencarian."
                        : "Tidak ada dokumen yang perlu direview saat ini. Dokumen yang sudah direview akan otomatis pindah ke tahap validasi."}
                    </p>
                    {!searchTerm && filterStatus === "all" && (
                      <div className="mt-4">
                        <Button
                          onClick={() => router.push("/dashboard/admin")}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        >
                          Kembali ke Dashboard
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {filteredSubmissions.map((submission, index) => {
                const submissionStatus = getSubmissionStatus(submission)
                const contentItems = submission.contentItems || []
                const pendingCount = contentItems.filter((item) => !item.status || item.status === "pending").length

                const approvedItems = contentItems.filter((item) => item.status === "approved")
                const rejectedItems = contentItems.filter((item) => item.status === "rejected")
                const publishedItems = contentItems.filter((item) => item.isTayang === true)
                const outputItems = approvedItems.filter((item) => item.hasilProdukFile || item.hasilProdukLink)

                return (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader className="pb-3 sm:pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg sm:rounded-xl flex-shrink-0">
                              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base sm:text-lg font-bold text-blue-900 truncate">
                                {submission.judul}
                              </CardTitle>
                              <CardDescription className="text-xs sm:text-sm text-gray-600 mt-1">
                                {submission.noComtab}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1 sm:space-y-2 flex-shrink-0">
                            {getStatusBadge(submissionStatus)}
                            {pendingCount > 0 && (
                              <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {pendingCount} Review
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3 sm:space-y-4">
                        {/* Content Statistics */}
                        <div className="grid grid-cols-4 gap-2 sm:gap-3">
                          <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                            <p className="text-sm sm:text-lg font-bold text-gray-900">{contentItems.length}</p>
                            <p className="text-xs text-gray-600">Total</p>
                          </div>
                          <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                            <p className="text-sm sm:text-lg font-bold text-green-600">{approvedItems.length}</p>
                            <p className="text-xs text-green-700">Disetujui</p>
                          </div>
                          <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                            <p className="text-sm sm:text-lg font-bold text-red-600">{rejectedItems.length}</p>
                            <p className="text-xs text-red-700">Ditolak</p>
                          </div>
                          <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                            <p className="text-sm sm:text-lg font-bold text-orange-600">{pendingCount}</p>
                            <p className="text-xs text-orange-700">Pending</p>
                          </div>
                        </div>

                        {/* Document Information */}
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <User className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>Petugas:</span>
                            </div>
                            <span className="font-medium text-gray-900 truncate max-w-32 sm:max-w-48">
                              {submission.petugasPelaksana}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>Supervisor:</span>
                            </div>
                            <span className="font-medium text-gray-900 truncate max-w-32 sm:max-w-48">{submission.supervisor}</span>
                          </div>

                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>Submit:</span>
                            </div>
                            <span className="font-medium text-gray-900">
                              {submission.tanggalSubmit
                                ? new Date(submission.tanggalSubmit).toLocaleDateString("id-ID")
                                : "Tidak diketahui"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Tag className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>Tema:</span>
                            </div>
                            <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs">
                              {submission.tema}
                            </Badge>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-2 border-t border-gray-100">
                          <Button
                            onClick={() => handleReviewSubmission(submission)}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Review Dokumen
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Review Dialog */}
      {selectedSubmission && (
        <>
          {isMobile ? (
            <MobileContentReviewDialog
              isOpen={isDialogOpen}
              onOpenChange={handleDialogOpenChange}
              submission={selectedSubmission}
              onUpdate={handleUpdate}
              onToast={(message, type) => toast({ title: message, variant: type === "error" ? "destructive" : "default" })}
            />
          ) : (
            <ContentReviewDialog
              isOpen={isDialogOpen}
              onOpenChange={handleDialogOpenChange}
              submission={selectedSubmission}
              onUpdate={handleUpdate}
              onToast={(message, type) => toast({ title: message, variant: type === "error" ? "destructive" : "default" })}
            />
          )}
        </>
      )}
    </div>
  )
}
