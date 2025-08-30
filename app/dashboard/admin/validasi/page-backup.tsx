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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("🚫 Not authenticated, redirecting to login...")
      router.push("/login")
    }
  }, [isAuthenticated, authLoading, router])

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
    // Skip if auth is still loading or user not authenticated
    if (authLoading || !isAuthenticated) {
      setIsLoading(false) // Set loading false if not authenticated
      return
    }

    const loadSubmissions = async () => {
      try {
        setIsLoading(true)
        console.log("🔄 Loading validations from server...")
        
        // Check authentication first
        const token = localStorage.getItem("auth_token")
        const sessionData = localStorage.getItem("auth_session")
        console.log("🔐 Auth status:", { 
          hasToken: !!token, 
          hasSession: !!sessionData,
          tokenPreview: token ? `${token.substring(0, 10)}...` : null
        })
        
        // Use the API client function instead of fetch
        const response = await getValidations()
        console.log("📡 API Response:", response)
        
        if (response.success && response.data) {
          console.log("✅ Validations loaded from server", response.data)
          console.log("🔍 Raw API structure:", JSON.stringify(response.data, null, 2))
          
          // Handle paginated data structure
          const validationItems = response.data.data || response.data
          console.log("📋 Validation items extracted:", validationItems)
          console.log("📋 Number of items:", validationItems?.length || 0)
          
          // Transform API data to match frontend interface
          const transformedData = validationItems.map((item: any) => {
            const submission = item.submission || {}
            const user = submission.user || {}
            const validator = item.validation_assignee || {}
            
            console.log(`🔄 Transforming item ${item.id}:`, {
              item_id: item.id,
              submission_id: item.submission_id,
              workflow_stage: item.workflow_stage,
              validation_status: item.validation_status,
              review_status: item.review_status,
              submission: submission
            })
            
            // Generate dynamic COMTAB number based on submission data
            const submissionDate = new Date(submission.created_at || item.created_at || Date.now())
            const comtabNumber = `${String(submission.id || item.submission_id).padStart(4, '0')}/IKP/${String(submissionDate.getMonth() + 1).padStart(2, '0')}/${submissionDate.getFullYear()}`
            
            // Map submission type to readable theme
            const themeMap: { [key: string]: string } = {
              'content_creation': 'Pembuatan Konten',
              'social_media': 'Media Sosial', 
              'publication': 'Publikasi',
              'documentation': 'Dokumentasi'
            }
            
            // Map content type to readable format
            const contentTypeMap: { [key: string]: string } = {
              'text': 'Artikel/Teks',
              'image': 'Gambar/Foto',
              'video': 'Video',
              'audio': 'Audio/Podcast',
              'infographic': 'Infografis'
            }
            
            // Gunakan submission_id sebagai ID utama untuk submission
            const submissionId = submission.id || item.submission_id || item.id
            
            const transformed = {
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
              isConfirmed: submission.is_confirmed || true, // Default true untuk data API
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
              // Additional fields from API
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
            
            console.log(`✅ Transformed item ${item.id}:`, transformed)
            return transformed
          })
          
          // Filter submissions that need validation - sementara tampilkan semua untuk debugging
          const validationSubmissions = transformedData.filter((sub: Submission) => {
            // Log setiap item untuk debugging
            console.log(`🔍 Checking item ${sub.id}:`, {
              workflowStage: sub.workflowStage,
              isOutputValidated: sub.isOutputValidated,
              contentItems: sub.contentItems?.length || 0,
              hasApprovedContent: sub.contentItems?.some(item => item.status === "approved"),
              apiData: sub.apiData
            })
            
            // Sementara tampilkan semua data untuk debugging
            // Nanti bisa dikembalikan ke filter yang lebih ketat
            return true // Menampilkan semua data dulu
            
            // Kondisi asli untuk validasi (commented sementara):
            /*
            const isValidationStage = sub.workflowStage === "validation"
            const notYetValidated = !sub.isOutputValidated
            const hasContentItems = sub.contentItems && sub.contentItems.length > 0
            const hasApprovedItems = sub.contentItems?.some(item => item.status === "approved")
            
            const shouldInclude = isValidationStage && notYetValidated && hasContentItems && hasApprovedItems
            
            console.log(`📋 Item ${sub.id} decision:`, {
              isValidationStage,
              notYetValidated, 
              hasContentItems,
              hasApprovedItems,
              shouldInclude
            })
            
            return shouldInclude
            */
          })
          
          console.log("📊 Total items from API:", validationItems.length)
          console.log("📊 Items after transformation:", transformedData.length)
          console.log("📊 Items showing (all for debug):", validationSubmissions.length)
          console.log("📊 Final validation data:", validationSubmissions)
          setSubmissions(validationSubmissions)
          setFilteredSubmissions(validationSubmissions)
          
          // Update cache
          if (typeof window !== "undefined") {
            localStorage.setItem("validations_cache", JSON.stringify(validationSubmissions))
          }
          
          // Show message if no data needs validation
          if (validationSubmissions.length === 0) {
            console.log("ℹ️ No items need validation at this time")
            toast({
              title: "Info",
              description: "Tidak ada item yang memerlukan validasi saat ini",
              variant: "default",
            })
          }
          
          return
        }
        
        console.log("❌ No valid data from API response")
        throw new Error("Invalid API response format")
        
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
              const hasApprovedItems = sub.contentItems?.some((item) => item.status === "approved")
              return hasApprovedItems
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
  }, [isAuthenticated, authLoading]) // Add dependencies

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

  // Function to refresh data from API
  const refreshDataFromAPI = async () => {
    try {
      setIsLoading(true)
      console.log("🔄 Refreshing data from API...")
      
      const response = await getValidations()
      
      if (response.success && response.data) {
        const validationItems = response.data.data || response.data
        
        // Transform API data
        const transformedData = validationItems.map((item: any) => {
          const submission = item.submission || {}
          const user = submission.user || {}
          const validator = item.validation_assignee || {}
          
          const submissionDate = new Date(submission.created_at || Date.now())
          const comtabNumber = `${String(submission.id).padStart(4, '0')}/IKP/${String(submissionDate.getMonth() + 1).padStart(2, '0')}/${submissionDate.getFullYear()}`
          
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
          
          return {
            id: submission.id || item.id,
            noComtab: comtabNumber,
            pin: String(submission.id || item.id).padStart(4, '0'),
            tema: themeMap[submission.type] || submission.description || "Konten Umum",
            judul: submission.title || `Validasi Konten #${item.id}`,
            jenisMedia: "Digital Media",
            mediaPemerintah: ["Website Resmi", "Portal Berita"],
            mediaMassa: ["Media Online", "Sosial Media"],
            jenisKonten: [contentTypeMap[item.type] || item.type || "text"],
            tanggalOrder: submission.created_at ? new Date(submission.created_at) : new Date(),
            petugasPelaksana: user.name || "Tim Konten",
            supervisor: validator.name || "Supervisor Validasi",
            durasi: `${Math.ceil((Date.now() - new Date(submission.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24))} hari`,
            jumlahProduksi: "1 konten",
            tanggalSubmit: submission.created_at ? new Date(submission.created_at) : new Date(),
            isConfirmed: submission.is_confirmed || false,
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
        
        const validationSubmissions = transformedData.filter((sub: Submission) => {
          return sub.workflowStage === "validation" && 
                 !sub.isOutputValidated &&
                 sub.contentItems &&
                 sub.contentItems.length > 0 &&
                 sub.contentItems.some(item => item.status === "approved")
        })
        
        setSubmissions(validationSubmissions)
        setFilteredSubmissions(validationSubmissions)
        
        toast({
          title: "Berhasil",
          description: `Data berhasil diperbarui. Ditemukan ${validationSubmissions.length} item untuk validasi`,
          variant: "default",
        })
      } else {
        throw new Error("Failed to fetch data")
      }
    } catch (error) {
      console.error("❌ Failed to refresh data:", error)
      toast({
        title: "Error",
        description: "Gagal memuat data dari server",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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
      
      // Submit validation using API client
      const response = await submitValidation(submissionId.toString(), {
        status: 'validated',
        notes: `Validated at ${new Date().toISOString()}`,
        validatorId: 'current-user-id', // TODO: Get from auth context
        publishDate: new Date().toISOString()
      })
      
      if (response.success) {
        console.log(`✅ Submission ${submissionId} validated on server`)
        
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
          const hasApprovedItems = sub.contentItems?.some((item) => item.status === "approved")
          return hasApprovedItems
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
          description: "Submission telah divalidasi dan disimpan ke server",
          variant: "default",
        })
        
      } else {
        throw new Error(`Server error: ${response.status}`)
      }
      
    } catch (error) {
      console.error(`❌ Failed to validate submission ${submissionId}:`, error)
      toast({
        title: "Gagal Validasi",
        description: "Terjadi kesalahan saat menyimpan validasi ke server",
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
      const hasApprovedItems = sub.contentItems?.some((item) => item.status === "approved")
      return hasApprovedItems
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

                      {/* Document Information */}
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <User className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Petugas:</span>
                          </div>
                          <span className="font-medium text-gray-900 truncate max-w-32 sm:max-w-48">
                            {submission.petugasPelaksana || 'Tidak tersedia'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Supervisor:</span>
                          </div>
                          <span className="font-medium text-gray-900 truncate max-w-32 sm:max-w-48">
                            {submission.supervisor || 'Tidak tersedia'}
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
                            onClick={() => setSelectedSubmission(submission)}
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
