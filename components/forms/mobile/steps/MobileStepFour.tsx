"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { FormData } from "@/app/form-types"
import { useFormSubmission } from "@/hooks/use-form-submission"
import { EnhancedFileOrLinkInput } from "@/components/form/enhanced-file-or-link-input"
import { FileText, Upload, Hash, Key, RefreshCw, CheckCircle, AlertCircle, Sparkles, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface MobileStepFourProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  generateCredentials: () => { noComtab: string; pinSandi: string }
  isEditMode: boolean
  isNoComtabExists?: (noComtab: string) => boolean
  generateUniqueNoComtab?: () => string
}

export default function MobileStepFour({
  formData,
  updateFormData,
  generateCredentials,
  isEditMode,
  isNoComtabExists,
  generateUniqueNoComtab,
}: MobileStepFourProps) {
  const { submitForm, isSubmitting } = useFormSubmission()
  const [isGenerating, setIsGenerating] = useState(false)
  const [noComtabError, setNoComtabError] = useState("")

  // Check for duplicate no comtab when field changes
  useEffect(() => {
    if (!isEditMode && formData.noComtab && isNoComtabExists) {
      const isDuplicate = isNoComtabExists(formData.noComtab)
      if (isDuplicate) {
        setNoComtabError("No. Comtab sudah digunakan. Silakan generate ulang.")
      } else {
        setNoComtabError("")
      }
    } else {
      setNoComtabError("")
    }
  }, [formData.noComtab, isEditMode, isNoComtabExists])

  // Generate credentials with proper format
  const handleGenerateCredentials = async () => {
    setIsGenerating(true)
    setNoComtabError("")

    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      if (generateUniqueNoComtab) {
        // Use the unique generator from hook
        const noComtab = generateUniqueNoComtab()
        const pinSandi = Math.random().toString(36).substring(2, 8).toUpperCase()
        
        updateFormData({
          noComtab,
          pinSandi,
        })
      } else {
        // Fallback to original method
        const credentials = generateCredentials()
      }
    } catch (error) {
      console.error("Error generating credentials:", error)
      setNoComtabError("Gagal generate No. Comtab. Silakan coba lagi.")
    }

    setIsGenerating(false)
  }

  // Enhanced validation for step 4
  const isFormValid = !!(
    formData.buktiMengetahui &&
    formData.noComtab &&
    formData.noComtab.trim() !== "" &&
    formData.pinSandi &&
    formData.pinSandi.trim() !== "" &&
    !noComtabError
  )

  const getMissingFields = () => {
    const missing = []
    if (!formData.buktiMengetahui) missing.push("Bukti Persetujuan")
    if (!formData.noComtab || formData.noComtab.trim() === "") missing.push("No. Comtab")
    if (!formData.pinSandi || formData.pinSandi.trim() === "") missing.push("Pin Dokumen")
    if (noComtabError) missing.push("No. Comtab Valid")
    return missing
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 px-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Finalisasi Dokumen</h2>
        </div>
        <p className="text-gray-600 text-sm">Ringkasan dokumen dan upload bukti persetujuan kepala bidang</p>
      </motion.div>

      {/* Document Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-4"
      >
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <FileText className="h-4 w-4 text-green-600" />
              <span>Ringkasan Dokumen</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-700">Tema:</p>
                <p className="text-gray-600 text-xs">{formData.tema || "-"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Judul:</p>
                <p className="text-gray-600 text-xs">{formData.judul || "-"}</p>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-gray-700">Petugas:</p>
                  <p className="text-gray-600 text-xs">{formData.petugasPelaksana || "-"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Supervisor:</p>
                  <p className="text-gray-600 text-xs">{formData.supervisor || "-"}</p>
                </div>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-gray-700">Jumlah Konten:</p>
                  <Badge variant="secondary" className="text-xs">
                    {formData.contentItems.length} item
                  </Badge>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Status:</p>
                  <Badge variant={isFormValid ? "default" : "secondary"} className="text-xs">
                    {isFormValid ? "Siap Dikirim" : "Belum Lengkap"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Content Items Summary */}
            {formData.contentItems.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="font-medium text-gray-700 mb-2 text-sm">Detail Konten:</p>
                  <div className="space-y-1">
                    {formData.contentItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                        <span className="text-gray-600">{item.nama || `Konten ${index + 1}`}</span>
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-4"
      >
        <Card className={cn("shadow-lg", formData.buktiMengetahui ? "border-green-200" : "border-red-200")}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Upload className={cn("h-4 w-4", formData.buktiMengetahui ? "text-green-600" : "text-red-600")} />
              <span>Bukti Persetujuan</span>
              {!formData.buktiMengetahui && <span className="text-red-500 text-xs">*Wajib</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="buktiMengetahui" className="flex items-center space-x-2 text-sm">
                <Upload className="h-3 w-3 text-green-600" />
                <span>Upload Bukti Mengetahui (Kepala Bidang)</span>
                <span className="text-red-500">*</span>
              </Label>
              <EnhancedFileOrLinkInput
                id="buktiMengetahui"
                label="Upload Bukti Mengetahui"
                value={formData.buktiMengetahui || ""}
                onChange={(value) => updateFormData({ buktiMengetahui: value })}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className={cn(
                  "text-sm",
                  formData.buktiMengetahui
                    ? "border-green-200 focus:border-green-500 focus:ring-green-500"
                    : "border-red-200 focus:border-red-500 focus:ring-red-500",
                )}
              />
              <p className="text-xs text-gray-500">Format: PDF, DOC, DOCX, JPG, JPEG, PNG (Max 10MB)</p>
              {formData.buktiMengetahui && (
                <div className="flex items-center space-x-2 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span>File berhasil diupload</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Document Credentials */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-4"
      >
        <Card
          className={cn("shadow-lg", formData.noComtab && formData.pinSandi ? "border-green-200" : "border-red-200")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center space-x-2">
                <Hash
                  className={cn("h-4 w-4", formData.noComtab && formData.pinSandi ? "text-green-600" : "text-red-600")}
                />
                <span>Kredensial Dokumen</span>
                {(!formData.noComtab || !formData.pinSandi) && <span className="text-red-500 text-xs">*Wajib</span>}
              </div>
              {!isEditMode && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateCredentials}
                  disabled={isGenerating}
                  className="border-green-200 text-green-600 hover:bg-green-50 text-xs px-2 py-1 bg-transparent"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 mr-1" />
                      Generate
                    </>
                  )}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* No Comtab */}
            <div className="space-y-2">
              <Label htmlFor="noComtab" className="flex items-center space-x-2 text-sm">
                <Hash className="h-3 w-3 text-green-600" />
                <span>No. Comtab</span>
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="noComtab"
                type="text"
                value={formData.noComtab || ""}
                onChange={(e) => {
                  updateFormData({ noComtab: e.target.value })
                  // Clear error when user types
                  if (noComtabError) setNoComtabError("")
                }}
                placeholder="0000/IKP/MM/YYYY"
                disabled={isEditMode}
                className={cn(
                  "text-sm",
                  isEditMode && "bg-gray-50 cursor-not-allowed",
                  noComtabError
                    ? "border-red-200 focus:border-red-500 focus:ring-red-500"
                    : formData.noComtab
                    ? "border-green-200 focus:border-green-500 focus:ring-green-500"
                    : "border-red-200 focus:border-red-500 focus:ring-red-500",
                )}
              />
              {noComtabError && (
                <div className="flex items-center space-x-1 text-red-600 text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{noComtabError}</span>
                </div>
              )}
              <p className="text-xs text-gray-500">Format: nomor/IKP/bulan/tahun</p>
              {formData.noComtab && (
                <div className="flex items-center space-x-2 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span>No. Comtab valid</span>
                </div>
              )}
            </div>

            {/* Pin Dokumen */}
            <div className="space-y-2">
              <Label htmlFor="pinSandi" className="flex items-center space-x-2 text-sm">
                <Key className="h-3 w-3 text-green-600" />
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
                  "text-sm",
                  isEditMode && "bg-gray-50 cursor-not-allowed",
                  formData.pinSandi
                    ? "border-green-200 focus:border-green-500 focus:ring-green-500"
                    : "border-red-200 focus:border-red-500 focus:ring-red-500",
                )}
              />
              <p className="text-xs text-gray-500">Pin untuk mengakses dokumen ini</p>
              {formData.pinSandi && (
                <div className="flex items-center space-x-2 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span>Pin dokumen valid</span>
                </div>
              )}
            </div>

            {isEditMode && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-800">
                    Kredensial dokumen tidak dapat diubah dalam mode edit untuk menjaga keamanan.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="px-4"
      >
        <Card className={cn("shadow-lg", isFormValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-2">
              {isFormValid ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium text-sm">Dokumen siap untuk dikirim</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <div className="text-center">
                    <span className="text-red-600 font-medium text-sm block">Lengkapi field yang diperlukan</span>
                    <span className="text-red-500 text-xs">Kurang: {getMissingFields().join(", ")}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
