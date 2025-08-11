"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { FormData, FormContentItem } from "@/app/form-types"
import { useFormSubmission } from "./use-form-submission"

// Content type configurations
const contentTypeConfig = {
  infografis: {
    name: "Infografis",
    color: "bg-pink-500",
    icon: "🎨",
  },
  "naskah-berita": {
    name: "Naskah Berita",
    color: "bg-blue-500",
    icon: "📰",
  },
  audio: {
    name: "Audio",
    color: "bg-green-500",
    icon: "🎵",
  },
  video: {
    name: "Video",
    color: "bg-purple-500",
    icon: "🎬",
  },
  fotografis: {
    name: "Fotografis",
    color: "bg-yellow-500",
    icon: "📸",
  },
  bumper: {
    name: "Bumper",
    color: "bg-red-500",
    icon: "🎭",
  },
}

export const useFormHandler = () => {
  const router = useRouter()
  const { submitForm, isSubmitting } = useFormSubmission()

  // Form state
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([])
  const [contentQuantities, setContentQuantities] = useState<Record<string, number>>({})
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingSubmissionId, setEditingSubmissionId] = useState<number | null>(null)

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    tema: "",
    judul: "",
    petugasPelaksana: "",
    supervisor: "",
    contentItems: [],
    buktiMengetahui: null,
    dokumenPendukung: [],
    noComtab: "",
    pinSandi: "",
  })

  // Load edit data if in edit mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const editId = urlParams.get("edit") || urlParams.get("editId")
    const editPin = urlParams.get("editPin")

    console.log("useFormHandler: Checking edit parameters", { 
      editId, 
      editPin, 
      url: window.location.href,
      searchParams: urlParams.toString()
    })

    if (editId) {
      console.log("useFormHandler: Setting edit mode for ID:", editId)
      setIsEditMode(true)
      // Try to parse as number first, if it fails, find the submission to get the numeric ID
      const numericId = parseInt(editId, 10)
      if (!isNaN(numericId)) {
        setEditingSubmissionId(numericId)
      } else {
        // If editId is not a number (like noComtab), find the submission and use its id
        const submissions = JSON.parse(localStorage.getItem("formSubmissions") || "[]")
        let submission = submissions.find((s: any) => s.noComtab === editId)
        
        // If editPin is provided, verify the PIN for security
        if (editPin && submission && submission.pin !== editPin) {
          console.error("Invalid PIN for edit access")
          return
        }
        
        if (submission) {
          setEditingSubmissionId(submission.id)
        }
      }
      loadEditData(editId)
    } else {
      console.log("useFormHandler: No edit parameters found, normal form mode")
    }
  }, [])

  const loadEditData = (submissionId: string) => {
    try {
      const submissions = JSON.parse(localStorage.getItem("formSubmissions") || "[]")
      // Try to find by noComtab first (for editing from riwayat), then by id (for numeric IDs)
      let submission = submissions.find((s: any) => s.noComtab === submissionId)
      
      if (!submission) {
        // Fallback: try to find by id if submissionId is numeric
        submission = submissions.find((s: any) => s.id === submissionId)
      }

      if (submission) {
        setFormData(submission.formData)

        // Extract selected content types and quantities
        const types: string[] = []
        const quantities: Record<string, number> = {}

        submission.formData.contentItems?.forEach((item: FormContentItem) => {
          if (!types.includes(item.jenisKonten)) {
            types.push(item.jenisKonten)
            quantities[item.jenisKonten] = 1
          } else {
            quantities[item.jenisKonten] = (quantities[item.jenisKonten] || 0) + 1
          }
        })

        setSelectedContentTypes(types)
        setContentQuantities(quantities)
      }
    } catch (error) {
      console.error("Error loading edit data:", error)
    }
  }

  // Navigation functions
  const nextStep = () => {
    if (currentStep < 4 && getStepValidation(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Form data update functions
  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const updateContentItem = (index: number, updates: Partial<FormContentItem>) => {
    setFormData((prev) => ({
      ...prev,
      contentItems: prev.contentItems.map((item, i) => (i === index ? { ...item, ...updates } : item)),
    }))
  }

  // Content type management
  const handleContentTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      // Add content type
      setSelectedContentTypes((prev) => [...prev, type])
      setContentQuantities((prev) => ({ ...prev, [type]: 1 }))

      // Create content item
      const newContentItem: FormContentItem = {
        id: `${type}-${Date.now()}`,
        jenisKonten: type,
        nama: "",
        nomorSurat: "",
        tanggalOrderMasuk: null,
        tanggalJadi: null,
        tanggalTayang: null,
        mediaPemerintah: [],
        mediaMassa: [],
        narasiSourceType: [],
        narasiText: "",
        narasiFile: null,
        suratFile: null,
        audioDubbingSourceType: [],
        audioDubbingFile: null,
        audioDubbingLainLainFile: null,
        audioBacksoundSourceType: [],
        audioBacksoundFile: null,
        audioBacksoundLainLainFile: null,
        pendukungLainnyaSourceType: [],
        pendukungVideoFile: null,
        pendukungFotoFile: null,
        pendukungLainLainFile: null,
        keterangan: "",
      }

      setFormData((prev) => ({
        ...prev,
        contentItems: [...prev.contentItems, newContentItem],
      }))
    } else {
      // Remove content type
      setSelectedContentTypes((prev) => prev.filter((t) => t !== type))
      setContentQuantities((prev) => {
        const newQuantities = { ...prev }
        delete newQuantities[type]
        return newQuantities
      })

      // Remove content items of this type
      setFormData((prev) => ({
        ...prev,
        contentItems: prev.contentItems.filter((item) => item.jenisKonten !== type),
      }))
    }
  }

  const handleQuantityChange = (type: string, change: number) => {
    const currentQuantity = contentQuantities[type] || 1
    const newQuantity = Math.max(1, Math.min(10, currentQuantity + change))

    if (newQuantity !== currentQuantity) {
      setContentQuantities((prev) => ({ ...prev, [type]: newQuantity }))

      // Adjust content items
      const currentItems = formData.contentItems.filter((item) => item.jenisKonten === type)

      if (newQuantity > currentItems.length) {
        // Add more items
        const itemsToAdd = newQuantity - currentItems.length
        const newItems: FormContentItem[] = []

        for (let i = 0; i < itemsToAdd; i++) {
          newItems.push({
            id: `${type}-${Date.now()}-${i}`,
            jenisKonten: type,
            nama: "",
            nomorSurat: "",
            tanggalOrderMasuk: null,
            tanggalJadi: null,
            tanggalTayang: null,
            mediaPemerintah: [],
            mediaMassa: [],
            narasiSourceType: [],
            narasiText: "",
            narasiFile: null,
            suratFile: null,
            audioDubbingSourceType: [],
            audioDubbingFile: null,
            audioDubbingLainLainFile: null,
            audioBacksoundSourceType: [],
            audioBacksoundFile: null,
            audioBacksoundLainLainFile: null,
            pendukungLainnyaSourceType: [],
            pendukungVideoFile: null,
            pendukungFotoFile: null,
            pendukungLainLainFile: null,
            keterangan: "",
          })
        }

        setFormData((prev) => ({
          ...prev,
          contentItems: [...prev.contentItems, ...newItems],
        }))
      } else if (newQuantity < currentItems.length) {
        // Remove excess items
        const itemsToKeep = currentItems.slice(0, newQuantity)
        const otherItems = formData.contentItems.filter((item) => item.jenisKonten !== type)

        setFormData((prev) => ({
          ...prev,
          contentItems: [...otherItems, ...itemsToKeep],
        }))
      }
    }
  }

  // Utility functions
  const getContentTypeDisplayName = (type: string): string => {
    return contentTypeConfig[type as keyof typeof contentTypeConfig]?.name || type
  }

  const getContentTypeColor = (type: string): string => {
    return contentTypeConfig[type as keyof typeof contentTypeConfig]?.color || "bg-gray-500"
  }

  const getContentTypeIcon = (type: string): string => {
    return contentTypeConfig[type as keyof typeof contentTypeConfig]?.icon || "📄"
  }

  // Enhanced validation functions with no comtab check
  const getStepValidation = (step: number): boolean => {
    switch (step) {
      case 1:
        // Step 1: Basic information - all fields required
        return !!(
          formData.tema &&
          formData.tema.trim() !== "" &&
          formData.judul &&
          formData.judul.trim() !== "" &&
          formData.petugasPelaksana &&
          formData.petugasPelaksana.trim() !== "" &&
          formData.supervisor &&
          formData.supervisor.trim() !== ""
        )

      case 2:
        // Step 2: Content type selection - at least one content type selected
        const step2Valid = formData.contentItems.length > 0
        console.log("🔍 Step 2 validation:", step2Valid, "content items:", formData.contentItems.length)
        return step2Valid

      case 3:
        // Step 3: Content details - all required fields for each content item
        if (formData.contentItems.length === 0) return false

        return formData.contentItems.every((item) => {
          return !!(
            item.nama &&
            item.nama.trim() !== "" &&
            item.tanggalOrderMasuk &&
            item.tanggalJadi &&
            item.tanggalTayang
          )
        })

      case 4:
        // Step 4: Final submission - credentials and bukti mengetahui required
        const basicValidation = !!(
          formData.buktiMengetahui &&
          formData.noComtab &&
          formData.noComtab.trim() !== "" &&
          formData.pinSandi &&
          formData.pinSandi.trim() !== ""
        )
        
        // Check for duplicate no comtab (only for new submissions)
        if (basicValidation && !isEditMode && formData.noComtab) {
          const isDuplicate = isNoComtabExists(formData.noComtab)
          if (isDuplicate) {
            console.warn("🚨 Duplicate no comtab detected:", formData.noComtab)
            return false
          }
        }
        
        return basicValidation

      default:
        return false
    }
  }

  // Check if all steps are valid for final submission
  const isSubmitDisabled = (): boolean => {
    return !(getStepValidation(1) && getStepValidation(2) && getStepValidation(3) && getStepValidation(4))
  }

  // Check if form has been filled with data
  const hasFormData = () => {
    // Check if any step has been filled
    const step1HasData = formData.tema?.trim() || 
                        formData.judul?.trim() || 
                        formData.petugasPelaksana?.trim() || 
                        formData.supervisor?.trim()

    const step2HasData = selectedContentTypes.length > 0 || formData.contentItems.length > 0

    const step3HasData = formData.contentItems.some(item => 
      item.nama?.trim() || 
      item.nomorSurat?.trim() || 
      item.tanggalOrderMasuk || 
      item.tanggalJadi || 
      item.tanggalTayang ||
      item.narasiText?.trim() ||
      item.keterangan?.trim()
    )

    const step4HasData = formData.buktiMengetahui || 
                        formData.noComtab?.trim() || 
                        formData.pinSandi?.trim()

    return !!(step1HasData || step2HasData || step3HasData || step4HasData)
  }

  // Get validation details for debugging
  const getValidationDetails = () => {
    return {
      step1: {
        valid: getStepValidation(1),
        details: {
          tema: !!(formData.tema && formData.tema.trim() !== ""),
          judul: !!(formData.judul && formData.judul.trim() !== ""),
          petugasPelaksana: !!(formData.petugasPelaksana && formData.petugasPelaksana.trim() !== ""),
          supervisor: !!(formData.supervisor && formData.supervisor.trim() !== ""),
        },
      },
      step2: {
        valid: getStepValidation(2),
        details: {
          selectedContentTypes: selectedContentTypes.length,
          contentItems: formData.contentItems.length,
        },
      },
      step3: {
        valid: getStepValidation(3),
        details: {
          totalItems: formData.contentItems.length,
          validItems: formData.contentItems.filter(
            (item) =>
              item.nama && item.nama.trim() !== "" && item.tanggalOrderMasuk && item.tanggalJadi && item.tanggalTayang,
          ).length,
        },
      },
      step4: {
        valid: getStepValidation(4),
        details: {
          buktiMengetahui: !!formData.buktiMengetahui,
          noComtab: !!(formData.noComtab && formData.noComtab.trim() !== ""),
          pinSandi: !!(formData.pinSandi && formData.pinSandi.trim() !== ""),
          isNoComtabUnique: !isEditMode ? !isNoComtabExists(formData.noComtab || "") : true,
        },
      },
    }
  }

  // Check if no comtab already exists
  const isNoComtabExists = (noComtab: string): boolean => {
    try {
      // Check in localStorage submissions
      const localSubmissions = JSON.parse(localStorage.getItem("formSubmissions") || "[]")
      const existsInLocal = localSubmissions.some((submission: any) => 
        submission.noComtab === noComtab && submission.id !== editingSubmissionId
      )
      
      if (existsInLocal) {
        return true
      }

      // TODO: In future, could also check with backend API
      // const response = await fetch(`${API_URL}/submissions/check-comtab/${noComtab}`)
      // return response.json().exists
      
      return false
    } catch (error) {
      console.error("Error checking no comtab:", error)
      return false
    }
  }

  // Generate unique no comtab
  const generateUniqueNoComtab = (): string => {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const year = now.getFullYear()
    
    let attempts = 0
    let noComtab = ""
    
    do {
      const randomNum = Math.floor(Math.random() * 9999) + 1
      noComtab = `${String(randomNum).padStart(4, "0")}/IKP/${month}/${year}`
      attempts++
      
      // Failsafe: if too many attempts, use timestamp
      if (attempts > 100) {
        const timestamp = Date.now().toString().slice(-4)
        noComtab = `${timestamp}/IKP/${month}/${year}`
        break
      }
    } while (isNoComtabExists(noComtab))
    
    return noComtab
  }

  // Credential generation
  const generateCredentials = () => {
    const noComtab = generateUniqueNoComtab()
    const pinSandi = Math.random().toString(36).substring(2, 8).toUpperCase()

    updateFormData({ noComtab, pinSandi })

    return { noComtab, pinSandi }
  }

  // Form submission
  const handleSubmit = async () => {
    // Final validation before submission
    if (isSubmitDisabled()) {
      console.error("Form validation failed:", getValidationDetails())
      return
    }

    try {
      await submitForm(formData, isEditMode, editingSubmissionId)

      // Reset form after successful submission
      if (!isEditMode) {
        setFormData({
          tema: "",
          judul: "",
          petugasPelaksana: "",
          supervisor: "",
          contentItems: [],
          buktiMengetahui: null,
          dokumenPendukung: [],
          noComtab: "",
          pinSandi: "",
        })
        setSelectedContentTypes([])
        setContentQuantities({})
        setCurrentStep(1)
      }

      // Navigate to success page or back to home
      router.push(isEditMode ? "/mobile" : "/mobile")
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  return {
    // State
    currentStep,
    selectedContentTypes,
    contentQuantities,
    formData,
    isEditMode,
    editingSubmissionId,
    isSubmitting,

    // Actions
    nextStep,
    prevStep,
    updateFormData,
    updateContentItem,
    handleContentTypeChange,
    handleQuantityChange,
    handleSubmit,
    generateCredentials,

    // Utilities
    getContentTypeDisplayName,
    getContentTypeColor,
    getContentTypeIcon,
    getStepValidation,
    isSubmitDisabled,
    getValidationDetails,
    hasFormData,
    isNoComtabExists,
    generateUniqueNoComtab,

    // Edit mode
    setIsEditMode,
    setEditingSubmissionId,
  }
}
