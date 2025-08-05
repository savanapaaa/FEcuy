"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Home } from "lucide-react"
import { useFormHandler } from "@/hooks/useFormHandler"
import Swal from "sweetalert2"

interface FormHeaderProps {
  isEditMode?: boolean
  isMobile?: boolean
}

export const FormHeader = ({ isEditMode = false, isMobile = false }: FormHeaderProps) => {
  const { navigateToHome, formData, currentStep } = useFormHandler()

  const handleBackToDashboard = async () => {
    // Check if form has any data
    const hasFormData =
      formData.tema ||
      formData.judul ||
      formData.petugasPelaksana ||
      formData.supervisor ||
      formData.jenisKonten.length > 0 ||
      formData.contentItems.length > 0 ||
      formData.noComtab ||
      formData.pinSandi

    if (hasFormData) {
      const result = await Swal.fire({
        title: "Kembali ke Dashboard?",
        text: "Data form yang telah diisi akan hilang. Apakah Anda yakin ingin kembali ke dashboard?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Ya, Kembali",
        cancelButtonText: "Batal",
        reverseButtons: true,
        customClass: {
          popup: "rounded-2xl",
          confirmButton: "rounded-xl px-6 py-2",
          cancelButton: "rounded-xl px-6 py-2",
        },
      })

      if (result.isConfirmed) {
        navigateToHome()
      }
    } else {
      navigateToHome()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToDashboard}
            className="flex items-center space-x-2 bg-white/80 hover:bg-white border-gray-200 hover:border-gray-300 transition-all duration-200"
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>

          <div className="h-6 w-px bg-gray-300" />

          <div className="flex items-center space-x-2 text-gray-600">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Kembali ke Dashboard</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Pengajuan Konten" : "Form Pengajuan Konten"}
            </h1>
            <p className="text-sm text-gray-600">Platform Layanan Publik - Diskominfo</p>
          </div>
        </div>
      </div>

      {/* Progress Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Langkah {currentStep} dari 4</h3>
              <p className="text-sm text-gray-600">
                {currentStep === 1 && "Informasi Dasar"}
                {currentStep === 2 && "Pilih Jenis Konten"}
                {currentStep === 3 && "Detail Konten"}
                {currentStep === 4 && "Review & Submit"}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-medium text-blue-600">{Math.round((currentStep / 4) * 100)}% Selesai</div>
            <div className="w-24 h-2 bg-blue-100 rounded-full mt-1">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
