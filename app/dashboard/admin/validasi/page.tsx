"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
  Hash,
  TrendingUp,
  XCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { ValidasiOutputDialog } from "@/components/validasi-output-dialog"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"

// Define interfaces for type safety
interface ContentItem {
  id: string
  nama: string
  jenisKonten: string
  status?: "pending" | "approved" | "rejected"
  isTayang?: boolean
}

interface Submission {
  id: number
  noComtab: string
  tema: string
  judul: string
  tanggalSubmit: Date | undefined
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

  // Load submissions from localStorage
  useEffect(() => {
    const loadSubmissions = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("submissions")
        if (stored) {
          const parsedSubmissions = JSON.parse(stored).map((sub: any) => ({
            ...sub,
            tanggalSubmit: sub.tanggalSubmit ? new Date(sub.tanggalSubmit) : undefined,
          }))

          // Filter only submissions that need validation:
          // 1. Must have workflowStage as "validation" (moved from review)
          // 2. Must not be already validated
          // 3. Must have approved content items
          const validationSubmissions = parsedSubmissions.filter((sub: Submission) => {
            // Must be in validation stage (moved from review)
            if (sub.workflowStage !== "validation") return false
            // Must not be already validated
            if (sub.isOutputValidated) return false
            // Must have approved content items
            const hasApprovedItems = sub.contentItems?.some((item) => item.status === "approved")
            return hasApprovedItems
          })

          setSubmissions(validationSubmissions)
          setFilteredSubmissions(validationSubmissions)
        }
      }
      setIsLoading(false)
    }

    setTimeout(() => loadSubmissions(), 500) // Simulate loading
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

  const handleValidateSubmission = (submissionId: number) => {
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

    // Update localStorage with all submissions
    if (typeof window !== "undefined") {
      const allSubmissions = JSON.parse(localStorage.getItem("submissions") || "[]")
      const updatedAllSubmissions = allSubmissions.map((sub: Submission) =>
        sub.id === submissionId
          ? {
              ...sub,
              isOutputValidated: true,
              tanggalValidasiOutput: new Date().toISOString(),
              workflowStage: "completed", // Mark as completed after validation
            }
          : sub,
      )
      localStorage.setItem("submissions", JSON.stringify(updatedAllSubmissions))
    }
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Tanggal tidak tersedia"
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
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
        <div className={`mx-auto px-4 py-4 ${isMobile ? "max-w-full" : "max-w-4xl"}`}>
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
                onClick={() => router.back()}
                className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 p-2"
              >
                <ArrowLeft className="h-4 w-4" />
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
            <div className={`space-y-4 ${isMobile ? "px-4 py-3 bg-white/50" : "max-w-4xl mx-auto px-4 py-6"}`}>
              <div className="grid gap-4 grid-cols-2">
                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg w-12 h-12">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-yellow-900 text-base">Total Dokumen</h3>
                          <p className="text-yellow-700 text-sm">Dokumen yang direview</p>
                        </div>
                      </div>
                      <motion.p
                        key={totalSubmissions}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="font-bold text-yellow-800 text-2xl"
                      >
                        {totalSubmissions}
                      </motion.p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg w-12 h-12">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-orange-900 text-base">Perlu Validasi</h3>
                          <p className="text-orange-700 text-sm">Menunggu validasi output</p>
                        </div>
                      </div>
                      <motion.p
                        key={needValidation}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="font-bold text-orange-800 text-2xl"
                      >
                        {needValidation}
                      </motion.p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`space-y-4 pb-20 ${isMobile ? "px-4 py-4" : "max-w-4xl mx-auto px-4 py-6"}`}>
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
            <div className="space-y-3">
              {filteredSubmissions.map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-yellow-100 group">
                    <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-50 border-b border-yellow-100 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-md w-8 h-8">
                            <FileText className="text-white h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-gray-900 group-hover:text-yellow-800 transition-colors text-base truncate">
                              {submission.judul}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 flex-wrap gap-2 mt-1">
                              <div className="flex items-center space-x-1">
                                <Hash className="h-3 w-3" />
                                <span className="truncate">{submission.noComtab}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(submission.tanggalSubmit)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 flex-shrink-0 ml-2">
                          {submission.isOutputValidated ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Tervalidasi
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              Perlu Validasi
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Tema:</strong> {submission.tema}
                          </p>
                          <div className="flex items-center text-sm text-gray-600 flex-wrap gap-2">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                Konten: {submission.contentItems?.length || 0} item
                              </span>
                            </div>
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <span className="text-sm text-gray-600">
                              Approved:{" "}
                              {submission.contentItems?.filter((item) => item.status === "approved").length || 0} item
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          {!submission.isOutputValidated && (
                            <Button
                              size="sm"
                              onClick={() => setSelectedSubmission(submission)}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white w-full"
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Mulai Validasi
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
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
