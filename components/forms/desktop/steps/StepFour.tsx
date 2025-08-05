"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { FormData } from "@/app/form-types"
import { useFormSubmission } from "@/hooks/use-form-submission"
import { EnhancedFileOrLinkInput } from "@/components/form/enhanced-file-or-link-input"
import { FileText, Upload, Hash, Key, RefreshCw, CheckCircle, AlertCircle, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface StepFourProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  isFormCompleteForSubmission: () => boolean
  isStep4Valid: boolean
  generateCredentials: () => { noComtab: string; pinSandi: string }
  isEditMode: boolean
}

export default function StepFour({
  formData,
  updateFormData,
  isFormCompleteForSubmission,
  isStep4Valid,
  generateCredentials,
  isEditMode,
}: StepFourProps) {
  const { submitForm, isSubmitting } = useFormSubmission()
  const [isGenerating, setIsGenerating] = useState(false)

  // Generate credentials with proper format
  const handleGenerateCredentials = async () => {
    setIsGenerating(true)

    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const year = now.getFullYear()
    const randomNum = Math.floor(Math.random() * 9999) + 1

    const noComtab = `${String(randomNum).padStart(4, "0")}/IKP/${month}/${year}`
    const pinSandi = Math.random().toString(36).substring(2, 8).toUpperCase()

    updateFormData({
      noComtab,
      pinSandi,
    })

    setIsGenerating(false)
  }

  const handleSubmit = async () => {
    if (!isStep4Valid) return

    const result = await submitForm(formData, isEditMode, null)

    if (result.success) {
      // Handle successful submission
      console.log("Form submitted successfully")
    }
  }

  const isFormValid = !!(formData.buktiMengetahui && formData.noComtab && formData.pinSandi)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Finalisasi Dokumen</h2>
        </div>
        <p className="text-gray-600">Ringkasan dokumen dan upload bukti persetujuan kepala bidang</p>
      </motion.div>

      {/* Document Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <FileText className="h-5 w-5 text-green-600" />
              <span>Ringkasan Dokumen</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Tema:</p>
                <p className="text-gray-600">{formData.tema || "-"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Judul:</p>
                <p className="text-gray-600">{formData.judul || "-"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Petugas Pelaksana:</p>
                <p className="text-gray-600">{formData.petugasPelaksana || "-"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Supervisor:</p>
                <p className="text-gray-600">{formData.supervisor || "-"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Jumlah Konten:</p>
                <Badge variant="secondary">{formData.contentItems.length} item</Badge>
              </div>
              <div>
                <p className="font-medium text-gray-700">Status:</p>
                <Badge variant={isFormValid ? "default" : "secondary"}>
                  {isFormValid ? "Siap Dikirim" : "Belum Lengkap"}
                </Badge>
              </div>
            </div>

            {/* Content Items Summary */}
            {formData.contentItems.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="font-medium text-gray-700 mb-2">Detail Konten:</p>
                  <div className="space-y-2">
                    {formData.contentItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">{item.nama || `Konten ${index + 1}`}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.jenisKonten}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Upload Bukti Mengetahui */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Upload className="h-5 w-5 text-green-600" />
              <span>Bukti Persetujuan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buktiMengetahui" className="flex items-center space-x-2">
                <Upload className="h-4 w-4 text-green-600" />
                <span>Upload Bukti Mengetahui (Kepala Bidang)</span>
                <span className="text-red-500">*</span>
              </Label>
              <EnhancedFileOrLinkInput
                value={formData.buktiMengetahui || ""}
                onChange={(value) => updateFormData({ buktiMengetahui: value })}
                placeholder="Upload dokumen bukti persetujuan kepala bidang"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="border-green-200 focus:border-green-500 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500">
                Format yang didukung: PDF, DOC, DOCX, JPG, JPEG, PNG (Maksimal 10MB)
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Document Credentials */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Hash className="h-5 w-5 text-green-600" />
              <span>Kredensial Dokumen</span>
              {!isEditMode && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateCredentials}
                  disabled={isGenerating}
                  className="ml-auto border-green-200 text-green-600 hover:bg-green-50 bg-transparent"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Otomatis
                    </>
                  )}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* No Comtab */}
              <div className="space-y-2">
                <Label htmlFor="noComtab" className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-green-600" />
                  <span>No. Comtab</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="noComtab"
                  type="text"
                  value={formData.noComtab || ""}
                  onChange={(e) => updateFormData({ noComtab: e.target.value })}
                  placeholder="0000/IKP/MM/YYYY"
                  disabled={isEditMode}
                  className={cn(
                    "border-green-200 focus:border-green-500 focus:ring-green-500",
                    isEditMode && "bg-gray-50 cursor-not-allowed",
                  )}
                />
                <p className="text-xs text-gray-500">Format: nomor/IKP/bulan/tahun (contoh: 0001/IKP/01/2024)</p>
              </div>

              {/* Pin Dokumen */}
              <div className="space-y-2">
                <Label htmlFor="pinSandi" className="flex items-center space-x-2">
                  <Key className="h-4 w-4 text-green-600" />
                  <span>Pin Dokumen</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pinSandi"
                  type="text"
                  value={formData.pinSandi || ""}
                  onChange={(e) => updateFormData({ pinSandi: e.target.value })}
                  placeholder="Masukkan pin dokumen"
                  disabled={isEditMode}
                  className={cn(
                    "border-green-200 focus:border-green-500 focus:ring-green-500",
                    isEditMode && "bg-gray-50 cursor-not-allowed",
                  )}
                />
                <p className="text-xs text-gray-500">Pin untuk mengakses dan mengedit dokumen ini</p>
              </div>
            </div>

            {isEditMode && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <p className="text-sm text-amber-800">
                    Kredensial dokumen tidak dapat diubah dalam mode edit untuk menjaga keamanan.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Status Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-green-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-2">
              {isFormValid ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-600 font-medium">Dokumen siap untuk dikirim</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <span className="text-amber-600 font-medium">Lengkapi semua field yang diperlukan</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
