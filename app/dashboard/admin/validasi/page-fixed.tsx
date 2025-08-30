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
import { useAuth } from "@/hooks/use-auth"
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
  apiData?: any
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
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()

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
        tanggalTayang: undefined,
        keterangan: `Konten ${j + 1} siap untuk validasi output`,
        status: "approved" as const,
        tanggalDiproses: reviewDate.toISOString(),
        diprosesoleh: "Admin Review",
        isTayang: undefined,
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
        isOutputValidated: false,
        contentItems,
        tanggalReview: reviewDate.toISOString(),
        workflowStage: "validation" as const,
      }
    })
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("🚫 Not authenticated, redirecting to login...")
      router.push("/login")
    }
  }, [isAuthenticated, authLoading, router])

  // Load submissions from server
  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      setIsLoading(false)
      return
    }

    const loadSubmissions = async () => {
      try {
        setIsLoading(true)
        console.log("🔄 Loading validations from server...")
        
        const response = await getValidations()
        console.log("📡 API Response:", response)
        
        if (response.success && response.data) {
          console.log("✅ Validations loaded from server", response.data)
          
          const validationItems = response.data.data || response.data
          console.log("📋 Validation items extracted:", validationItems)
          
          // Transform API data to match frontend interface
          const transformedData = validationItems.map((item: any) => {
            const submission = item.submission || {}
            const user = submission.user || {}
            const validator = item.validation_assignee || {}
            
            const submissionDate = new Date(submission.created_at || item.created_at || Date.now())
            const comtabNumber = `${String(submission.id || item.submission_id).padStart(4, '0')}/IKP/${String(submissionDate.getMonth() + 1).padStart(2, '0')}/${submissionDate.getFullYear()}`
            
            const themeMap: { [key: string]: string } = {
              'content_creation': 'Pembuatan Konten',
              'social_media': 'Media Sosial', 
              'publication': 'Publikasi',
              'documentation': 'Dokumentasi'
            }
            
            const contentTypeMap: { [key: string]: string } = {
              'text': 'Artikel/Teks',
              'image': 'Gambar/Foto',
              'video': 'Video',
              'audio': 'Audio/Podcast',
              'infographic': 'Infografis'
            }
            
            const submissionId = submission.id || item.submission_id || item.id
            
            return {
              id: submissionId,
              noComtab: comtabNumber,
              pin: String(submissionId).padStart(4, '0'),
              tema: themeMap[submission.type] || submission.description || "Konten Umum",
              judul: submission.title || `Validasi Konten #${item.id}`,
              jenisMedia: "Digital Media",
              mediaPemerintah: ["Website Resmi", "Portal Berita"],
              mediaMassa: ["Media Online", "Sosial Media"],
              jenisKonten: [contentTypeMap[item.type] || item.type || "text"],
              tanggalOrder: submission.created_at ? new Date(submission.created_at) : new Date(item.created_at || Date.now()),
              petugasPelaksana: user.name || "Tim Konten",
              supervisor: validator.name || "Supervisor Validasi",
              durasi: `${Math.ceil((Date.now() - new Date(submission.created_at || item.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24))} hari`,
              jumlahProduksi: "1 konten",
              tanggalSubmit: submission.created_at ? new Date(submission.created_at) : new Date(item.created_at || Date.now()),
              isConfirmed: submission.is_confirmed || true,
              isOutputValidated: item.validation_status === "validated" || item.validation_status === "published",
              workflowStage: item.workflow_stage || "validation",
              tanggalReview: item.reviewed_at || submission.reviewed_at,
              contentItems: [{
                id: item.id?.toString() || "1",
                nama: item.title || "Konten Validasi",
                jenisKonten: contentTypeMap[item.type] || item.type || "text",
                mediaPemerintah: ["Website Resmi"],
                mediaMassa: ["Portal Berita"],
                nomorSurat: `${String(item.id).padStart(3, '0')}/VALID/${String(submissionDate.getMonth() + 1).padStart(2, '0')}/${submissionDate.getFullYear()}`,
                narasiText: item.content || "Konten siap untuk validasi output",
                sourceNarasi: ["Tim Internal"],
                sourceAudioDubbing: item.type === "video" || item.type === "audio" ? ["Audio Studio"] : [],
                sourceAudioBacksound: item.type === "video" ? ["Music Library"] : [],
                sourcePendukungLainnya: item.file_path ? [item.original_filename] : [],
                tanggalOrderMasuk: item.created_at ? new Date(item.created_at) : new Date(),
                tanggalJadi: item.updated_at ? new Date(item.updated_at) : new Date(),
                tanggalTayang: item.publish_date ? new Date(item.publish_date) : undefined,
                keterangan: item.validation_notes || "Siap untuk validasi output",
                status: item.review_status === "approved" ? "approved" : (item.review_status === "rejected" ? "rejected" : "pending"),
                tanggalDiproses: item.reviewed_at || item.updated_at,
                diprosesoleh: item.reviewer?.name || user.name || "Tim Review",
                isTayang: item.is_published || false,
                tanggalValidasiTayang: item.validated_at,
                validatorTayang: item.validator?.name || validator.name,
                keteranganValidasi: item.validation_notes,
                alasanPenolakan: item.review_status === "rejected" ? item.review_notes : undefined
              }],
              apiData: {
                item_id: item.id,
                submission_id: item.submission_id,
                validation_status: item.validation_status,
                review_status: item.review_status,
                workflow_stage: item.workflow_stage,
                validation_assigned_to: item.validation_assigned_to,
                validated_by: item.validated_by,
                file_info: {
                  file_path: item.file_path,
                  file_url: item.file_url,
                  original_filename: item.original_filename,
                  mime_type: item.mime_type,
                  file_size: item.file_size
                }
              }
            }
          })
          
          // Untuk debugging, tampilkan semua data dulu
          console.log("📊 Transformed data:", transformedData)
          setSubmissions(transformedData)
          setFilteredSubmissions(transformedData)
          
          if (transformedData.length === 0) {
            toast({
              title: "Info",
              description: "Tidak ada data validasi yang ditemukan",
              variant: "default",
            })
          }
          
        } else {
          throw new Error("Invalid API response")
        }
        
      } catch (error) {
        console.error("❌ Failed to load from server:", error)
        // Fallback ke dummy data
        const dummyData = generateDummyValidationData()
        setSubmissions(dummyData)
        setFilteredSubmissions(dummyData)
        
        toast({
          title: "Info",
          description: "Menggunakan data dummy - server tidak tersedia",
          variant: "default",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSubmissions()
  }, [isAuthenticated, authLoading, toast])

  // Filter submissions based on search term
  useEffect(() => {
    const filtered = submissions.filter(
      (submission: Submission) =>
        submission.noComtab.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.judul.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredSubmissions(filtered)
  }, [searchTerm, submissions])

  // Function to refresh data from API
  const refreshDataFromAPI = async () => {
    try {
      setIsLoading(true)
      const response = await getValidations()
      
      if (response.success && response.data) {
        const validationItems = response.data.data || response.data
        // Reuse transformation logic...
        setSubmissions(validationItems)
        setFilteredSubmissions(validationItems)
        
        toast({
          title: "Berhasil",
          description: `Data berhasil diperbarui`,
          variant: "default",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data dari server",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "Tanggal tidak tersedia"
    
    if (typeof date === "string") {
      const parsedDate = new Date(date)
      if (isNaN(parsedDate.getTime())) return "Tanggal tidak valid"
      return parsedDate.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    }
    
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

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-yellow-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="font-semibold text-yellow-700 text-base">Memeriksa autentikasi...</p>
        </motion.div>
      </div>
    )
  }

  // Return null if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
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
                onClick={refreshDataFromAPI}
                disabled={isLoading}
                className="border-yellow-200 text-yellow-600 hover:bg-yellow-50 px-3 py-2"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh API</span>
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
              className="pl-10 border-yellow-200 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-6"
        >
          <Badge variant="outline" className="border-yellow-300 text-yellow-700 px-4 py-2">
            Menampilkan {filteredSubmissions.length} dokumen
          </Badge>
        </motion.div>

        {/* Submissions Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredSubmissions.map((submission, index) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-yellow-200 hover:border-yellow-400 transition-all duration-300 hover:shadow-lg cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg font-bold text-yellow-900 line-clamp-2">
                          {submission.judul}
                        </CardTitle>
                        <CardDescription className="text-yellow-600">
                          {submission.noComtab}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="border-orange-300 text-orange-700 bg-orange-50 ml-2"
                      >
                        Perlu Validasi
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-yellow-900">
                          {submission.contentItems?.length || 0}
                        </div>
                        <div className="text-xs text-yellow-600">Total</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {submission.contentItems?.filter(item => item.status === "approved").length || 0}
                        </div>
                        <div className="text-xs text-yellow-600">Disetujui</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-red-600">0</div>
                        <div className="text-xs text-yellow-600">Ditolak</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">0</div>
                        <div className="text-xs text-yellow-600">Tayang</div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-yellow-500" />
                        <span className="text-yellow-700">Petugas:</span>
                        <span className="text-yellow-900 font-medium">{submission.petugasPelaksana}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-yellow-500" />
                        <span className="text-yellow-700">Supervisor:</span>
                        <span className="text-yellow-900 font-medium">{submission.supervisor}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-yellow-500" />
                        <span className="text-yellow-700">Submit:</span>
                        <span className="text-yellow-900 font-medium">{formatDate(submission.tanggalSubmit)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-yellow-500" />
                        <span className="text-yellow-700">Tema:</span>
                        <span className="text-yellow-900 font-medium">{submission.tema}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => setSelectedSubmission(submission)}
                      className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Mulai Validasi
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredSubmissions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Shield className="h-16 w-16 text-yellow-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-yellow-900 mb-2">Tidak ada data validasi</h3>
            <p className="text-yellow-600 mb-6">Belum ada dokumen yang memerlukan validasi output</p>
            <div className="space-x-4">
              <Button variant="outline" onClick={loadDummyData} className="border-yellow-200 text-yellow-600 hover:bg-yellow-50">
                <FileText className="h-4 w-4 mr-2" />
                Muat Data Dummy
              </Button>
              <Button variant="outline" onClick={refreshDataFromAPI} className="border-yellow-200 text-yellow-600 hover:bg-yellow-50">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh dari API
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Validasi Output Dialog */}
      {selectedSubmission && (
        <ValidasiOutputDialog
          isOpen={!!selectedSubmission}
          onOpenChange={(open) => {
            if (!open) setSelectedSubmission(null)
          }}
          submission={selectedSubmission}
          contentItem={null}
          onUpdate={() => {
            // Refresh data after update
            refreshDataFromAPI()
          }}
          onToast={(message: string, type: "success" | "error" | "info") => {
            toast({
              title: type === "success" ? "Berhasil" : type === "error" ? "Error" : "Informasi",
              description: message,
              variant: type === "success" ? "default" : type === "error" ? "destructive" : "default",
            })
          }}
        />
      )}
    </div>
  )
}
