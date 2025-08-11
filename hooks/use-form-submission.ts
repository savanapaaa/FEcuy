"use client"

import { useState } from "react"
import type { FormData } from "@/app/form-types"
import Swal from "sweetalert2"
import { createSubmission, updateSubmission } from "@/lib/api-client"
import { showServerError } from "@/lib/api-notifications"

interface SubmissionResult {
  success: boolean
  comtabNumber?: string
  error?: string
}

export function useFormSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const generateComtabNumber = (): string => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")
    const seconds = String(now.getSeconds()).padStart(2, "0")

    return `${year}${month}${day}${hours}${minutes}${seconds}/IKP/DDMM/YYYY`
  }

  const generatePIN = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString()
  }

  const submitForm = async (
    formData: FormData,
    isEditMode = false,
    editingSubmissionId: number | null = null,
  ): Promise<SubmissionResult> => {
    // Show confirmation popup before submitting
    if (!isEditMode) {
      const confirmResult = await Swal.fire({
        title: "Konfirmasi Pengiriman",
        html: `
          <div class="text-center space-y-4">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p class="text-blue-800 font-semibold mb-2">Judul Pengajuan:</p>
              <p class="text-blue-900">${formData.judul}</p>
            </div>
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p class="text-amber-800 font-semibold mb-2">Petugas Pelaksana:</p>
              <p class="text-amber-900">${formData.petugasPelaksana}</p>
            </div>
            <p class="text-gray-600">Apakah Anda yakin ingin mengirim formulir ini?</p>
            <p class="text-sm text-gray-500">Data akan disimpan di backend server.</p>
          </div>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, Kirim ke Server",
        cancelButtonText: "Batal",
        confirmButtonColor: "#16a34a",
        cancelButtonColor: "#6b7280",
        customClass: {
          popup: "rounded-xl shadow-2xl",
          confirmButton: "rounded-lg px-6 py-2",
          cancelButton: "rounded-lg px-6 py-2",
        },
      })

      if (!confirmResult.isConfirmed) {
        return {
          success: false,
          error: "Pengiriman dibatalkan oleh user"
        }
      }
    }

    setIsSubmitting(true)

    try {
      // Show loading alert
      Swal.fire({
        title: isEditMode ? "Menyimpan Perubahan..." : "Mengirim ke Server...",
        html: `
          <div class="flex flex-col items-center space-y-4">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p class="text-gray-600">${isEditMode ? "Sedang menyimpan perubahan ke server" : "Sedang mengirim data ke backend server"}</p>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p class="text-blue-800 text-sm">🌐 Connecting to: ${process.env.NEXT_PUBLIC_API_URL}</p>
            </div>
          </div>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        customClass: {
          popup: "rounded-xl shadow-2xl",
        },
      })

      // Brief delay for UX
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (isEditMode && editingSubmissionId) {
        // **UPDATE SUBMISSION ON SERVER**
        console.log("🔄 Updating submission on server:", editingSubmissionId)
        
        const updateData = {
          title: formData.judul,
          description: `${formData.tema} - ${formData.petugasPelaksana}`,
          content_items: formData.contentItems,
          attachments: formData.dokumenPendukung || [],
          supervisor: formData.supervisor,
          tema: formData.tema,
          petugas_pelaksana: formData.petugasPelaksana,
          bukti_mengetahui: formData.buktiMengetahui,
        }

        const response = await updateSubmission(editingSubmissionId.toString(), updateData)
        
        if (response.success && response.data) {
          console.log("✅ Submission updated successfully on server")
          
          // Show success alert
          await Swal.fire({
            icon: "success",
            title: "✅ Berhasil Disimpan di Server!",
            html: `
              <div class="text-center space-y-3">
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p class="text-green-800 font-semibold">Dokumen: ${formData.judul}</p>
                  <p class="text-green-600 text-sm">Server ID: ${response.data?.id || editingSubmissionId}</p>
                  <p class="text-green-600 text-sm">Terakhir diubah: ${new Date().toLocaleString("id-ID")}</p>
                </div>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p class="text-blue-800 font-semibold">🌐 Tersimpan di Backend Server</p>
                  <p class="text-blue-700 text-sm">Data Anda telah berhasil diperbarui di server.</p>
                </div>
              </div>
            `,
            confirmButtonText: "OK",
            confirmButtonColor: "#16a34a",
            customClass: {
              popup: "rounded-xl shadow-2xl",
              confirmButton: "rounded-lg px-6 py-2",
            },
            timer: 5000,
            timerProgressBar: true,
          })

          return {
            success: true,
            comtabNumber: response.data?.id || editingSubmissionId.toString(),
          }
        } else {
          throw new Error(response.message || response.error || "Failed to update submission")
        }
      } else {
        // **CREATE NEW SUBMISSION ON SERVER**
        console.log("🔄 Creating new submission on server...")
        
        const submissionData = {
          title: formData.judul,
          description: `${formData.tema} - ${formData.petugasPelaksana}`,
          content_items: formData.contentItems,
          attachments: formData.dokumenPendukung || [],
          supervisor: formData.supervisor,
          tema: formData.tema,
          petugas_pelaksana: formData.petugasPelaksana,
          bukti_mengetahui: formData.buktiMengetahui,
          status: "submitted",
          workflow_stage: "review"
        }

        const response = await createSubmission(submissionData)
        
        if (response.success && response.data) {
          console.log("✅ Submission created successfully on server:", response.data)
          
          const pinNumber = generatePIN()

          // Show success alert
          await Swal.fire({
            icon: "success",
            title: "🎉 Formulir Berhasil Dikirim ke Server!",
            html: `
              <div class="text-center space-y-4">
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p class="text-green-800 font-bold text-lg mb-3">Data Akses Pengajuan</p>
                  <div class="space-y-3">
                    <div class="bg-white border border-green-300 rounded-lg p-3">
                      <p class="text-green-700 font-semibold mb-1">Server ID:</p>
                      <p class="text-green-900 font-mono text-lg">${response.data.id}</p>
                    </div>
                    <div class="bg-white border border-green-300 rounded-lg p-3">
                      <p class="text-green-700 font-semibold mb-1">PIN Sandi:</p>
                      <p class="text-green-900 font-mono text-lg font-bold">${pinNumber}</p>
                    </div>
                  </div>
                </div>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p class="text-blue-800 font-semibold">🌐 Tersimpan di Backend Server</p>
                  <p class="text-blue-700 text-sm">Data Anda telah tersimpan dengan aman di server backend.</p>
                  <p class="text-blue-600 text-xs">Backend URL: ${process.env.NEXT_PUBLIC_API_URL}</p>
                </div>
                <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p class="text-amber-800 font-semibold">⚠️ Penting!</p>
                  <p class="text-amber-700 text-sm">Simpan Server ID dan PIN dengan baik untuk tracking pengajuan.</p>
                </div>
              </div>
            `,
            confirmButtonText: "OK",
            confirmButtonColor: "#16a34a",
            customClass: {
              popup: "rounded-xl shadow-2xl",
              confirmButton: "rounded-lg px-6 py-2",
            },
            timer: 10000,
            timerProgressBar: true,
          })

          return {
            success: true,
            comtabNumber: response.data.id,
          }
        } else {
          throw new Error(response.message || response.error || "Failed to create submission")
        }
      }
    } catch (error) {
      console.error("❌ Form submission error:", error)

      // Show error alert
      await Swal.fire({
        icon: "error",
        title: "❌ Terjadi Kesalahan",
        html: `
          <div class="text-center space-y-3">
            <p class="text-gray-600">Maaf, terjadi kesalahan saat ${isEditMode ? "menyimpan perubahan" : "mengirim formulir"} ke server.</p>
            <div class="bg-red-50 border border-red-200 rounded-lg p-3">
              <p class="text-red-800 text-sm">${error instanceof Error ? error.message : "Kesalahan tidak diketahui"}</p>
            </div>
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p class="text-yellow-800 text-sm">💡 <strong>Tips:</strong></p>
              <ul class="text-yellow-700 text-sm text-left mt-2 space-y-1">
                <li>• Pastikan koneksi internet stabil</li>
                <li>• Cek apakah server backend dapat diakses</li>
                <li>• Coba refresh halaman dan kirim ulang</li>
                <li>• Hubungi administrator jika masalah berlanjut</li>
              </ul>
            </div>
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p class="text-gray-600 text-xs">Backend URL: ${process.env.NEXT_PUBLIC_API_URL}</p>
            </div>
          </div>
        `,
        confirmButtonText: "Coba Lagi",
        confirmButtonColor: "#dc2626",
        customClass: {
          popup: "rounded-xl shadow-2xl",
          confirmButton: "rounded-lg px-6 py-2",
        },
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    submitForm,
    isSubmitting,
  }
}
