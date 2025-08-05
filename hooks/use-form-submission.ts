"use client"

import { useState } from "react"
import type { FormData } from "@/app/form-types"
import Swal from "sweetalert2"

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

    return `COMTAB-${year}${month}${day}-${hours}${minutes}${seconds}`
  }

  const submitForm = async (
    formData: FormData,
    isEditMode = false,
    editingSubmissionId: number | null = null,
  ): Promise<SubmissionResult> => {
    setIsSubmitting(true)

    try {
      // Show loading alert
      Swal.fire({
        title: isEditMode ? "Menyimpan Perubahan..." : "Mengirim Formulir...",
        html: `
          <div class="flex flex-col items-center space-y-4">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p class="text-gray-600">${isEditMode ? "Sedang menyimpan perubahan Anda" : "Sedang memproses pengiriman formulir"}</p>
          </div>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        customClass: {
          popup: "rounded-xl shadow-2xl",
        },
      })

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Get existing submissions
      const existingSubmissions = JSON.parse(localStorage.getItem("submissions") || "[]")

      if (isEditMode && editingSubmissionId) {
        // Update existing submission
        const submissionIndex = existingSubmissions.findIndex((sub: any) => sub.id === editingSubmissionId)

        if (submissionIndex !== -1) {
          const existingSubmission = existingSubmissions[submissionIndex]

          // Update the submission while preserving certain fields
          existingSubmissions[submissionIndex] = {
            ...existingSubmission,
            tema: formData.tema,
            judul: formData.judul,
            contentItems: formData.contentItems,
            buktiMengetahui: formData.buktiMengetahui,
            dokumenPendukung: formData.dokumenPendukung,
            username: formData.username,
            password: formData.password,
            namaLengkap: formData.namaLengkap,
            nip: formData.nip,
            jabatan: formData.jabatan,
            unitKerja: formData.unitKerja,
            lastModified: new Date(),
          }

          localStorage.setItem("submissions", JSON.stringify(existingSubmissions))

          // Show success alert
          await Swal.fire({
            icon: "success",
            title: "Perubahan Berhasil Disimpan!",
            html: `
              <div class="text-center space-y-3">
                <p class="text-gray-600">Perubahan pada dokumen <strong>${existingSubmission.noComtab}</strong> telah berhasil disimpan.</p>
                <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p class="text-green-800 font-medium">Dokumen: ${formData.judul}</p>
                  <p class="text-green-600 text-sm">Terakhir diubah: ${new Date().toLocaleString("id-ID")}</p>
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
            comtabNumber: existingSubmission.noComtab,
          }
        } else {
          throw new Error("Submission not found")
        }
      } else {
        // Create new submission
        const comtabNumber = generateComtabNumber()
        const newSubmission = {
          id: Date.now(),
          noComtab: comtabNumber,
          tema: formData.tema,
          judul: formData.judul,
          contentItems: formData.contentItems,
          buktiMengetahui: formData.buktiMengetahui,
          dokumenPendukung: formData.dokumenPendukung,
          username: formData.username,
          password: formData.password,
          namaLengkap: formData.namaLengkap,
          nip: formData.nip,
          jabatan: formData.jabatan,
          unitKerja: formData.unitKerja,
          tanggalSubmit: new Date(),
          isConfirmed: false,
          workflowStage: "submitted" as const,
          lastModified: new Date(),
        }

        const updatedSubmissions = [...existingSubmissions, newSubmission]
        localStorage.setItem("submissions", JSON.stringify(updatedSubmissions))

        // Show success alert with auto-close timer
        let timerInterval: NodeJS.Timeout
        await Swal.fire({
          icon: "success",
          title: "Formulir Berhasil Dikirim!",
          html: `
            <div class="text-center space-y-4">
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <p class="text-green-800 font-bold text-lg mb-2">Nomor COMTAB</p>
                <p class="text-green-900 font-mono text-xl bg-white px-3 py-2 rounded border">${comtabNumber}</p>
              </div>
              <p class="text-gray-600">Simpan nomor COMTAB ini untuk referensi Anda.</p>
              <p class="text-sm text-gray-500">Halaman akan otomatis tertutup dalam <strong id="timer">5</strong> detik</p>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div id="progress" class="bg-green-600 h-2 rounded-full transition-all duration-1000" style="width: 100%"></div>
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
          timerProgressBar: false,
          willOpen: () => {
            let timeLeft = 5
            const timerElement = document.getElementById("timer")
            const progressElement = document.getElementById("progress")

            timerInterval = setInterval(() => {
              timeLeft--
              if (timerElement) timerElement.textContent = timeLeft.toString()
              if (progressElement) {
                progressElement.style.width = `${(timeLeft / 5) * 100}%`
              }
              if (timeLeft <= 0) {
                clearInterval(timerInterval)
              }
            }, 1000)
          },
          willClose: () => {
            if (timerInterval) clearInterval(timerInterval)
          },
        })

        return {
          success: true,
          comtabNumber,
        }
      }
    } catch (error) {
      console.error("Submission error:", error)

      // Show error alert
      await Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        html: `
          <div class="text-center space-y-3">
            <p class="text-gray-600">Maaf, terjadi kesalahan saat ${isEditMode ? "menyimpan perubahan" : "mengirim formulir"}.</p>
            <div class="bg-red-50 border border-red-200 rounded-lg p-3">
              <p class="text-red-800 text-sm">${error instanceof Error ? error.message : "Kesalahan tidak diketahui"}</p>
            </div>
            <p class="text-sm text-gray-500">Silakan coba lagi atau hubungi administrator jika masalah berlanjut.</p>
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
