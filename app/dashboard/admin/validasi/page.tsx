"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Search,
  Shield,
  CheckCircle,
  Clock,
  FileText,
  RefreshCw,
  Calendar,
  User,
  Users,
  Hash,
  TrendingUp,
  XCircle,
  Tag,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { ValidasiOutputDialog } from "@/components/validasi-output-dialog"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { getValidations, submitValidation } from "@/lib/api-client"

// Define interfaces for type safety
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
  isTayang?: boolean
  tanggalValidasiTayang?: string
  validatorTayang?: string
  keteranganValidasi?: string
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
  isConfirmed?: boolean
  isOutputValidated?: boolean
  contentItems?: ContentItem[]
  tanggalReview?: string
  workflowStage?: "submitted" | "review" | "validation" | "completed"
  priority?: "high" | "normal" | "low"
  deadline?: Date | undefined
}

export default function ValidasiOutputPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showStats, setShowStats] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const isMobile = useMobile()

  // Generate dummy data for validation
  const generateDummyValidationData = (): Submission[] => {
    const today = new Date()
    const getRandomDate = (daysAgo: number) => {
      const date = new Date(today)
      date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
      return date
    }

    const themes = ["sosial", "ekonomi", "lingkungan"]
    const contentTypes = ["video", "foto", "audio", "infografis", "podcast"]
    const mediaOptions = ["TV", "Radio", "Facebook", "Instagram", "YouTube", "Website"]
    const staff = ["Ahmad Rizki", "Siti Nurjannah", "Budi Santoso", "Dewi Lestari", "Eko Prasetyo"]
    const supervisors = ["Dr. Agus Wibowo", "Ir. Lina Marlina", "Drs. Roni Saputra"]

    return Array.from({ length: 8 }, (_, i) => {
      const id = 1000 + i
      const theme = themes[Math.floor(Math.random() * themes.length)]
      const submitDate = getRandomDate(15)
      const reviewDate = new Date(submitDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000)
      
      // Generate content items that have been approved and need validation
      const contentItems: ContentItem[] = Array.from({ length: Math.floor(Math.random() * 4) + 2 }, (_, j) => ({
        id: `content-${id}-${j}`,
        nama: `Konten ${j + 1} - ${theme.charAt(0).toUpperCase() + theme.slice(1)}`,
        jenisKonten: contentTypes[Math.floor(Math.random() * contentTypes.length)],
        mediaPemerintah: [mediaOptions[Math.floor(Math.random() * mediaOptions.length)]],
        mediaMassa: [mediaOptions[Math.floor(Math.random() * mediaOptions.length)]],
        nomorSurat: `001/SURAT/${String(j + 1).padStart(2, '0')}/2024`,
        narasiText: `Narasi untuk konten ${j + 1} mengenai ${theme}`,
        sourceNarasi: ["Internal"],
        sourceAudioDubbing: [],
        sourceAudioBacksound: [],
        sourcePendukungLainnya: [],
        tanggalOrderMasuk: getRandomDate(20),
        tanggalJadi: reviewDate,
        tanggalTayang: undefined, // Will be set during validation
        keterangan: `Konten ${j + 1} siap untuk validasi output`,
        status: "approved" as const, // Only approved items need validation
        tanggalDiproses: reviewDate.toISOString(),
        diprosesoleh: "Admin Review",
        isTayang: undefined, // To be determined during validation
      }))

      return {
        id,
        noComtab: `${String(i + 1).padStart(4, '0')}/IKP/${String(submitDate.getMonth() + 1).padStart(2, '0')}/${submitDate.getFullYear()}`,
        pin: String(Math.floor(Math.random() * 9000) + 1000),
        tema: theme,
        judul: `Pengajuan ${theme.charAt(0).toUpperCase() + theme.slice(1)} - Batch ${i + 1}`,
        jenisMedia: "Digital Media",
        mediaPemerintah: [mediaOptions[Math.floor(Math.random() * mediaOptions.length)]],
        mediaMassa: [mediaOptions[Math.floor(Math.random() * mediaOptions.length)]],
        jenisKonten: contentItems.map(item => item.jenisKonten),
        tanggalOrder: getRandomDate(25),
        petugasPelaksana: staff[Math.floor(Math.random() * staff.length)],
        supervisor: supervisors[Math.floor(Math.random() * supervisors.length)],
        durasi: `${Math.floor(Math.random() * 10) + 5} hari`,
        jumlahProduksi: `${contentItems.length} konten`,
        tanggalSubmit: submitDate,
        isConfirmed: true,
        isOutputValidated: false, // Needs validation
        contentItems,
        tanggalReview: reviewDate.toISOString(),
        workflowStage: "validation" as const,
      }
    })
  }

  // Load submissions from server first, fallback to localStorage
  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setIsLoading(true)
        console.log("🔄 Loading validations from server...")

        // Use the API client function instead of fetch
        const response = await getValidations()

        if (response.success && response.data) {
          console.log("✅ Validations loaded from server", response.data)

          // Support paginated response: data.data is the array
          const responseData = response.data as any
          // If paginated, use responseData.data; else fallback to array or object
          const validationItems = Array.isArray(responseData)
            ? responseData
            : (Array.isArray(responseData.data) ? responseData.data : (responseData.data ? [responseData.data] : []))
          console.log("📋 Validation items extracted:", validationItems)

          // Transform API data to match frontend interface
          const transformedData = validationItems.map((item: any) => {
            const user = item.user || {}
            const validator = item.assigned_validator || {}
            const reviews = item.reviews || []
            const latestReview = reviews.length > 0 ? reviews[reviews.length - 1] : null

            console.log(`🔄 Transforming validation item ${item.id}:`, {
              item_id: item.id,
              user_id: item.user_id,
              workflow_stage: item.workflow_stage,
              status: item.status,
              title: item.title,
              description: item.description,
              type: item.type,
              latest_review_status: latestReview?.status,
              validator: validator.name
            })

            const submissionDate = new Date(item.created_at || Date.now())
            const comtabNumber = `${String(item.id).padStart(4, '0')}/IKP/${String(submissionDate.getMonth() + 1).padStart(2, '0')}/${submissionDate.getFullYear()}`

            // Map submission type to readable theme
            const themeMap: { [key: string]: string } = {
              'content_creation': 'Pembuatan Konten',
              'media_upload': 'Upload Media',
              'social_media': 'Media Sosial',
              'publication': 'Publikasi',
              'documentation': 'Dokumentasi'
            }

            // Map content type to readable format
            const contentTypeMap: { [key: string]: string } = {
              'content_creation': 'Pembuatan Konten',
              'media_upload': 'Upload Media',
              'text': 'Artikel/Teks',
              'image': 'Gambar/Foto',
              'video': 'Video',
              'audio': 'Audio/Podcast',
              'infographic': 'Infografis'
            }

            // Get platform information from metadata
            const metadata = item.metadata || {}
            const platforms = Array.isArray(metadata.platform) ? metadata.platform : []
            const tags = Array.isArray(metadata.tags) ? metadata.tags : []

            const submissionId = item.id

            return {
              id: submissionId,
              noComtab: comtabNumber,
              pin: String(submissionId).padStart(4, '0'),
              tema: themeMap[item.type] || (metadata.category || "Konten Umum"),
              judul: item.title || `Validasi Konten #${item.id}`,
              jenisMedia: "Digital Media",
              mediaPemerintah: platforms.includes('website') ? ["Website Resmi"] : ["Portal Berita"],
              mediaMassa: platforms.filter((p: string) => ['instagram', 'facebook', 'tiktok', 'youtube'].includes(p)) || ["Media Online"],
              jenisKonten: [contentTypeMap[item.type] || item.type || "content"],
              tanggalOrder: new Date(item.created_at || Date.now()),
              petugasPelaksana: user.name || "Tim Konten",
              supervisor: validator.name || "Supervisor Validasi",
              durasi: `${Math.ceil((Date.now() - new Date(item.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24))} hari`,
              jumlahProduksi: "1 konten",
              tanggalSubmit: item.submitted_at ? new Date(item.submitted_at) : (item.created_at ? new Date(item.created_at) : undefined),
              isConfirmed: item.is_confirmed !== false,
              isOutputValidated: item.validated_at !== null,
              workflowStage: item.workflow_stage || "validation",
              tanggalReview: item.reviewed_at,
              priority: item.priority || "normal",
              deadline: item.deadline ? new Date(item.deadline) : undefined,
              contentItems: [{
                id: item.id?.toString() || "1",
                nama: item.title || "Konten Validasi",
                jenisKonten: contentTypeMap[item.type] || item.type || "content",
                mediaPemerintah: platforms.includes('website') ? ["Website Resmi"] : ["Portal Berita"],
                mediaMassa: platforms.filter((p: string) => ['instagram', 'facebook', 'tiktok', 'youtube'].includes(p)) || ["Media Online"],
                nomorSurat: `${String(item.id).padStart(3, '0')}/VALID/${String(submissionDate.getMonth() + 1).padStart(2, '0')}/${submissionDate.getFullYear()}`,
                narasiText: item.description || "Konten siap untuk validasi output",
                sourceNarasi: ["Tim Internal"],
                sourceAudioDubbing: item.type === "media_upload" && metadata.category === "video" ? ["Audio Studio"] : [],
                sourceAudioBacksound: item.type === "media_upload" && metadata.category === "video" ? ["Music Library"] : [],
                sourcePendukungLainnya: tags.length > 0 ? tags : [],
                tanggalOrderMasuk: new Date(item.created_at || Date.now()),
                tanggalJadi: item.updated_at ? new Date(item.updated_at) : new Date(),
                tanggalTayang: item.published_at ? new Date(item.published_at) : undefined,
                keterangan: item.notes || item.description || "Siap untuk validasi output",
                status: latestReview?.status === "approved" ? "approved" : (latestReview?.status === "rejected" ? "rejected" : "pending"),
                tanggalDiproses: item.reviewed_at || item.updated_at,
                diprosesoleh: latestReview?.reviewer?.name || user.name || "Tim Review",
                isTayang: item.published_at !== null,
                tanggalValidasiTayang: item.validated_at,
                validatorTayang: validator.name,
                keteranganValidasi: item.notes,
                alasanPenolakan: latestReview?.status === "rejected" ? latestReview.notes : undefined
              }]
            }
          })

          // Filter hanya data yang perlu validasi berdasarkan kriteria API
          const validationSubmissions = transformedData.filter((sub: Submission) => {
            // Berdasarkan response API: workflow_stage = "validation" dan belum divalidasi
            // Tambahkan kondisi yang lebih fleksibel untuk menampilkan semua data validation
            const needsValidation = sub.workflowStage === "validation" 

            console.log(`🔍 Item ${sub.id} validation check:`, {
              workflowStage: sub.workflowStage,
              isOutputValidated: sub.isOutputValidated,
              isConfirmed: sub.isConfirmed,
              hasContentItems: sub.contentItems && sub.contentItems.length > 0,
              contentItemStatus: sub.contentItems?.[0]?.status,
              needsValidation
            })

            return needsValidation
          })

          console.log("📊 Total items from API:", transformedData.length)
          console.log("📊 Items needing validation:", validationSubmissions.length)
          console.log("📊 Final validation data:", validationSubmissions)

          setSubmissions(validationSubmissions)
          setFilteredSubmissions(validationSubmissions)

          const validationStageCount = transformedData.filter((s: any) => s.workflowStage === "validation").length

          if (validationSubmissions.length === 0) {
            toast({
              title: "Info",
              description: `Ditemukan ${transformedData.length} submission dari API, ${validationStageCount} dalam tahap validasi, tapi semua sudah divalidasi`,
              variant: "default",
            })
          } else {
            toast({
              title: "Berhasil",
              description: `Ditemukan ${validationSubmissions.length} item yang perlu validasi dari ${transformedData.length} total submission`,
              variant: "default",
            })
          }

          // Update cache
          if (typeof window !== "undefined") {
            localStorage.setItem("validations_cache", JSON.stringify(validationSubmissions))
          }

          return
        }

        throw new Error("Server not available")

      } catch (error) {
        console.error("❌ Failed to load from server, using cache:", error)
        
        // Fallback to localStorage cache
        if (typeof window !== "undefined") {
          // Try new cache format first
          let stored = localStorage.getItem("validations_cache")
          if (!stored) {
            // Fallback to old format
            stored = localStorage.getItem("submissions")
          }
          
          let submissionsData: Submission[] = []
          
          if (stored) {
            const parsedSubmissions = JSON.parse(stored).map((sub: any) => ({
              ...sub,
              tanggalSubmit: sub.tanggalSubmit ? new Date(sub.tanggalSubmit) : undefined,
            }))

            // Filter only submissions that need validation
            submissionsData = parsedSubmissions.filter((sub: Submission) => {
              if (sub.workflowStage !== "validation") return false
              if (sub.isOutputValidated) return false
              if (!sub.isConfirmed) return false
              return true // Simplify condition
            })
            
            setSubmissions(submissionsData)
            setFilteredSubmissions(submissionsData)
          } else {
            // If no cache data exists, use dummy data
            const dummyData = generateDummyValidationData()
            console.log("Using dummy validation data - no cache found")
            setSubmissions(dummyData)
            setFilteredSubmissions(dummyData)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadSubmissions()
  }, [])

  // Filter submissions based on search term
  useEffect(() => {
    const filtered = submissions.filter(
      (submission) =>
        submission.noComtab.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.judul.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredSubmissions(filtered)
  }, [searchTerm, submissions])

  // Function to reset and load dummy data
  const loadDummyData = () => {
    const dummyData = generateDummyValidationData()
    setSubmissions(dummyData)
    setFilteredSubmissions(dummyData)
    toast({
      title: "Berhasil",
      description: "Data dummy validasi berhasil dimuat",
      variant: "default",
    })
  }

  const handleValidateSubmission = async (submissionId: number) => {
    try {
      console.log(`🔄 Validating submission ${submissionId}...`)
      
      // Check if user is authenticated first
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("auth_token")
        const user = localStorage.getItem("user")
        
        if (!token || !user) {
          console.log("🔐 No authentication found, performing auto-login for validation...")
          
          // Auto-login as validator for testing
          const { login } = await import("@/lib/api-client")
          const loginResponse = await login({ username: "validasi", password: "password" })
          
          if (!loginResponse.success) {
            throw new Error("Authentication failed - unable to login as validator")
          }
          
          console.log("✅ Auto-login successful for validator")
        }
      }
      
      // Prepare validation data according to API schema
      const validationData = {
        status: 'validated' as const,
        notes: `Validated at ${new Date().toISOString()} - Content approved for publication`,
        validatorId: '1', // TODO: Get from auth context - current user ID
        publishDate: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
        publishedContent: {
          platform: 'website',
          scheduled: true,
          validatedAt: new Date().toISOString()
        }
      }
      
      console.log(`📤 Sending validation data:`, validationData)
      
      // Submit validation using API client
      const response = await submitValidation(submissionId.toString(), validationData)
      
      if (response.success) {
        console.log(`✅ Submission ${submissionId} validated on server:`, response.data)
        
        // Update local state
        const updatedSubmissions = submissions.map((sub) =>
          sub.id === submissionId
            ? {
                ...sub,
                isOutputValidated: true,
                tanggalValidasiOutput: new Date().toISOString(),
                workflowStage: "completed" as const,
              }
            : sub,
        )

        // Remove validated submission from current view
        const stillNeedValidation = updatedSubmissions.filter((sub) => {
          if (sub.workflowStage !== "validation") return false
          if (sub.isOutputValidated) return false
          if (!sub.isConfirmed) return false
          return true // Simplify condition - show all validation stage items that aren't validated yet
        })

        setSubmissions(stillNeedValidation)
        setFilteredSubmissions(
          stillNeedValidation.filter(
            (sub) =>
              sub.noComtab.toLowerCase().includes(searchTerm.toLowerCase()) ||
              sub.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
              sub.judul.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
        )

        // Update cache
        if (typeof window !== "undefined") {
          localStorage.setItem("validations_cache", JSON.stringify(stillNeedValidation))
          
          // Also update main submissions cache if exists
          const stored = localStorage.getItem("submissions")
          if (stored) {
            const allSubmissions = JSON.parse(stored)
            const updatedAllSubmissions = allSubmissions.map((sub: Submission) =>
              sub.id === submissionId
                ? {
                    ...sub,
                    isOutputValidated: true,
                    tanggalValidasiOutput: new Date().toISOString(),
                    workflowStage: "completed",
                  }
                : sub,
            )
            localStorage.setItem("submissions", JSON.stringify(updatedAllSubmissions))
          }
        }
        
        toast({
          title: "Validasi Berhasil",
          description: response.message || "Submission telah divalidasi dan disimpan ke server",
          variant: "default",
        })
        
      } else {
        throw new Error(`Server error: ${response.message || 'Unknown error'}`)
      }
      
    } catch (error) {
      console.error(`❌ Failed to validate submission ${submissionId}:`, error)
      toast({
        title: "Gagal Validasi",
        description: `Terjadi kesalahan saat menyimpan validasi ke server: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    }
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "Tanggal tidak tersedia"
    
    // Handle string dates (from localStorage)
    if (typeof date === "string") {
      const parsedDate = new Date(date)
      if (isNaN(parsedDate.getTime())) return "Tanggal tidak valid"
      return parsedDate.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    }
    
    // Handle Date objects
    if (date instanceof Date) {
      if (isNaN(date.getTime())) return "Tanggal tidak valid"
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    }
    
    return "Tanggal tidak tersedia"
  }

  // Calculate statistics
  const totalSubmissions = submissions.length
  const needValidation = submissions.filter((sub) => !sub.isOutputValidated).length

  // Handle toast notifications
  const handleToast = (message: string, type: "success" | "error" | "info") => {
    toast({
      title: type === "success" ? "Berhasil" : type === "error" ? "Error" : "Informasi",
      description: message,
      variant: type === "success" ? "default" : type === "error" ? "destructive" : "default",
    })
  }

  // Handle submission update
  const handleSubmissionUpdate = (updatedSubmissions: any[]) => {
    // Update localStorage
    localStorage.setItem("submissions", JSON.stringify(updatedSubmissions))

    // Update current view - only show submissions that still need validation
    const validationSubmissions = updatedSubmissions.filter((sub: Submission) => {
      if (sub.workflowStage !== "validation") return false
      if (sub.isOutputValidated) return false
      if (!sub.isConfirmed) return false
      return true // Simplify condition
    })

    setSubmissions(validationSubmissions)
    setFilteredSubmissions(
      validationSubmissions.filter(
        (sub) =>
          sub.noComtab.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.judul.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-yellow-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-4 w-12 h-12"></div>
          <p className="font-semibold text-yellow-700 text-base">Memuat data validasi...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-yellow-50">
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
                className="border-yellow-200 text-yellow-600 hover:bg-yellow-50 flex items-center space-x-2 px-3 py-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Kembali</span>
              </Button>
              <motion.div
                whileHover={{ rotate: 15 }}
                className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-xl flex items-center justify-center shadow-lg w-10 h-10"
              >
                <Shield className="text-white h-5 w-5" />
              </motion.div>
              <div className="flex-1">
                <h1 className="font-bold text-yellow-900 text-xl">Validasi Output</h1>
                <p className="text-yellow-600 text-sm">Validasi hasil produksi yang sudah direview</p>
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
                className="text-yellow-600 hover:bg-yellow-50 p-2"
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadDummyData}
                className="border-yellow-200 text-yellow-600 hover:bg-yellow-50 px-3 py-2"
              >
                <FileText className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Data Dummy</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="border-yellow-200 text-yellow-600 hover:bg-yellow-50 p-2"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
          {/* Search Bar */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400 h-4 w-4" />
            <Input
              placeholder="Cari dokumen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-yellow-200 focus:ring-yellow-500 focus:border-yellow-500 bg-white/80 text-sm"
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
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-600 mb-1">Total Dokumen</p>
                        <motion.p
                          key={totalSubmissions}
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="font-bold text-yellow-900 text-2xl"
                        >
                          {totalSubmissions}
                        </motion.p>
                      </div>
                      <motion.div
                        whileHover={{ rotate: 15 }}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg w-12 h-12"
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
                        <p className="text-sm font-medium text-orange-600 mb-1">Perlu Validasi</p>
                        <motion.p
                          key={needValidation}
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="font-bold text-orange-900 text-2xl"
                        >
                          {needValidation}
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
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-600 mb-1">Tervalidasi Hari Ini</p>
                        <motion.p
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="font-bold text-green-900 text-2xl"
                        >
                          0
                        </motion.p>
                      </div>
                      <motion.div
                        whileHover={{ rotate: 15 }}
                        className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg w-12 h-12"
                      >
                        <CheckCircle className="h-6 w-6 text-white" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-600 mb-1">Total Konten</p>
                        <motion.p
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="font-bold text-blue-900 text-2xl"
                        >
                          {submissions.reduce((acc, sub) => acc + (sub.contentItems?.length || 0), 0)}
                        </motion.p>
                      </div>
                      <motion.div
                        whileHover={{ rotate: 15 }}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg w-12 h-12"
                      >
                        <Shield className="h-6 w-6 text-white" />
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
        <div className="flex items-center justify-between text-sm text-yellow-600">
          <span>Menampilkan {filteredSubmissions.length} dokumen</span>
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="text-yellow-600 hover:bg-yellow-50 p-1"
            >
              <XCircle className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Submissions List */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
          {filteredSubmissions.length === 0 ? (
            <Card className="border-yellow-200 shadow-lg">
              <CardContent className="text-center p-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <CheckCircle className="text-yellow-400 mx-auto mb-4 h-12 w-12" />
                  <h3 className="font-bold text-yellow-900 mb-2 text-lg">Semua Dokumen Sudah Divalidasi!</h3>
                  <p className="text-yellow-600 mb-6 text-sm">
                    Tidak ada dokumen yang perlu divalidasi saat ini. Semua konten yang disetujui sudah divalidasi.
                  </p>
                  <Button
                    onClick={() => router.push("/dashboard/admin/rekap")}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Lihat Rekap Data
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {filteredSubmissions.map((submission, index) => {
                const contentItems = submission.contentItems || []
                const approvedItems = contentItems.filter(item => item.status === "approved")
                const rejectedItems = contentItems.filter(item => item.status === "rejected")
                const publishedItems = contentItems.filter(item => item.isTayang === true)
                
                return (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-yellow-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-3 sm:pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                          <div className="p-1.5 sm:p-2 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg sm:rounded-xl flex-shrink-0">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base sm:text-lg font-bold text-yellow-900 truncate">
                              {submission.judul}
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm text-gray-600 mt-1">
                              {submission.noComtab}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1 sm:space-y-2 flex-shrink-0">
                          {submission.isOutputValidated ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">Tervalidasi</span>
                              <span className="sm:hidden">Selesai</span>
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">Perlu Validasi</span>
                              <span className="sm:hidden">Pending</span>
                            </Badge>
                          )}
                          {approvedItems.length > 0 && (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              {approvedItems.length} Approved
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
                        <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                          <p className="text-sm sm:text-lg font-bold text-blue-600">{publishedItems.length}</p>
                          <p className="text-xs text-blue-700">Tayang</p>
                        </div>
                      </div>

                      {/* Priority and Deadline Info */}
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Hash className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
                            <span className="text-xs sm:text-sm font-medium text-yellow-700">
                              Priority: {submission.priority === 'high' ? 'High' : 
                                       submission.priority === 'normal' ? 'Normal' : 
                                       submission.priority === 'low' ? 'Low' : 'Medium'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                          <span className="text-xs sm:text-sm font-medium text-orange-700">
                            {submission.durasi}
                          </span>
                        </div>
                      </div>

                      {/* Document Information */}
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Validator:</span>
                          </div>
                          <span className="font-medium text-gray-900 truncate max-w-32 sm:max-w-48">
                            {submission.supervisor || 'Tidak tersedia'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <User className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Pembuat:</span>
                          </div>
                          <span className="font-medium text-gray-900 truncate max-w-32 sm:max-w-48">
                            {submission.petugasPelaksana || 'Tidak tersedia'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Submit:</span>
                          </div>
                          <span className="font-medium text-gray-900">{formatDate(submission.tanggalSubmit)}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Tag className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Platform:</span>
                          </div>
                          <div className="flex flex-wrap gap-1 max-w-32 sm:max-w-48">
                            {submission.mediaMassa?.slice(0, 2).map((media, idx) => (
                              <Badge key={idx} variant="outline" className="border-blue-200 text-blue-700 text-xs px-1 py-0">
                                {media}
                              </Badge>
                            ))}
                            {submission.mediaMassa && submission.mediaMassa.length > 2 && (
                              <Badge variant="outline" className="border-gray-200 text-gray-600 text-xs px-1 py-0">
                                +{submission.mediaMassa.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Tag className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Tema:</span>
                          </div>
                          <Badge variant="outline" className="border-yellow-200 text-yellow-700 text-xs">
                            {submission.tema}
                          </Badge>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2 border-t border-gray-100">
                        {!submission.isOutputValidated && (
                          <Button
                            onClick={() => setSelectedSubmission(JSON.parse(JSON.stringify(submission)))}
                            className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Mulai Validasi
                          </Button>
                        )}
                        {submission.isOutputValidated && (
                          <div className="text-center text-sm text-green-600 font-medium">
                            <CheckCircle className="h-4 w-4 mx-auto mb-1" />
                            Sudah Divalidasi
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </main>

      {/* Validasi Output Dialog */}
      {selectedSubmission && (
        <ValidasiOutputDialog
          isOpen={!!selectedSubmission}
          onOpenChange={(open) => {
            if (!open) setSelectedSubmission(null)
          }}
          submission={selectedSubmission}
          contentItem={null}
          onUpdate={handleSubmissionUpdate}
          onToast={handleToast}
        />
      )}
    </div>
  )
}
