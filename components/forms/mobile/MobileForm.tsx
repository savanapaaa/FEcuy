"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useFormHandler } from "@/hooks/useFormHandler"
import { MobileFormHeader } from "./MobileFormHeader"
import { MobileStepIndicator } from "./MobileStepIndicator"
import { MobileBottomNav } from "./MobileBottomNav"
import { MobileStepOne } from "./steps/MobileStepOne"
import { MobileStepTwo } from "./steps/MobileStepTwo"
import { MobileStepThree } from "./steps/MobileStepThree"
import MobileStepFour from "./steps/MobileStepFour"
import { EnhancedFileOrLinkInput } from "@/components/form/enhanced-file-or-link-input"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

// Mobile File Input Component
const MobileFileInput = ({
  id,
  label,
  value,
  onChange,
  accept,
  fileId,
  onFileIdChange,
}: {
  id: string
  label: string
  value: any
  onChange: (newValue: any) => void
  accept?: string
  fileId?: string
  onFileIdChange?: (id: string) => void
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 block">
        {label}
      </label>
      <EnhancedFileOrLinkInput
        value={value || ""}
        onChange={onChange}
        placeholder={`Upload ${label.toLowerCase()} atau masukkan link`}
        className="text-sm"
        accept={accept}
      />
    </div>
  )
}

export const MobileForm = () => {
  const router = useRouter()
  const formHandler = useFormHandler()

  // Debug validation in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Form validation details:", formHandler.getValidationDetails())
    }
  }, [formHandler.formData, formHandler.selectedContentTypes, formHandler.currentStep])

  const handleBackToHome = () => {
    // In edit mode, ask for confirmation before leaving
    if (formHandler.isEditMode) {
      const confirmLeave = window.confirm(
        "Anda sedang dalam mode edit. Perubahan yang belum disimpan akan hilang. Apakah Anda yakin ingin kembali ke beranda?",
      )
      if (!confirmLeave) return

      // Reset edit mode
      formHandler.setIsEditMode(false)
      formHandler.setEditingSubmissionId(null)
    } else {
      // Check if there's unsaved data for new submissions
      const hasUnsavedData =
        formHandler.formData.tema ||
        formHandler.formData.judul ||
        formHandler.formData.petugasPelaksana ||
        formHandler.formData.supervisor ||
        formHandler.selectedContentTypes.length > 0

      if (hasUnsavedData) {
        const confirmLeave = window.confirm(
          "Anda memiliki data yang belum disimpan. Apakah Anda yakin ingin kembali ke beranda?",
        )
        if (!confirmLeave) return
      }
    }

    router.push("/mobile")
  }

  const handleSourceToggle = (
    contentIndex: number,
    sourceType:
      | "narasiSourceType"
      | "audioDubbingSourceType"
      | "audioBacksoundSourceType"
      | "pendukungLainnyaSourceType",
    value: string,
    checked: boolean,
  ) => {
    const currentItem = formHandler.formData.contentItems?.[contentIndex]
    if (!currentItem) return

    const currentSourceType = (currentItem[sourceType] as string[]) || []
    const updatedSourceType = checked
      ? [...currentSourceType, value]
      : currentSourceType.filter((item) => item !== value)

    formHandler.updateContentItem(contentIndex, { [sourceType]: updatedSourceType })
  }

  // Enhanced step validation
  const isCurrentStepValid = () => {
    return formHandler.getStepValidation(formHandler.currentStep)
  }

  const renderCurrentStep = () => {
    switch (formHandler.currentStep) {
      case 1:
        return <MobileStepOne formData={formHandler.formData} updateFormData={formHandler.updateFormData} />
      case 2:
        return (
          <MobileStepTwo
            selectedContentTypes={formHandler.selectedContentTypes}
            contentQuantities={formHandler.contentQuantities}
            onContentTypeChange={formHandler.handleContentTypeChange}
            handleQuantityChange={formHandler.handleQuantityChange}
            getContentTypeDisplayName={formHandler.getContentTypeDisplayName}
            getContentTypeColor={formHandler.getContentTypeColor}
            getContentTypeIcon={formHandler.getContentTypeIcon}
          />
        )
      case 3:
        return (
          <MobileStepThree
            formData={formHandler.formData}
            updateContentItem={formHandler.updateContentItem}
            handleSourceToggle={handleSourceToggle}
            getContentTypeDisplayName={formHandler.getContentTypeDisplayName}
            getContentTypeColor={formHandler.getContentTypeColor}
            getContentTypeIcon={formHandler.getContentTypeIcon}
            MobileFileInput={MobileFileInput}
          />
        )
      case 4:
        return (
          <MobileStepFour
            formData={formHandler.formData}
            updateFormData={formHandler.updateFormData}
            generateCredentials={formHandler.generateCredentials}
            isEditMode={formHandler.isEditMode}
            isNoComtabExists={formHandler.isNoComtabExists}
            generateUniqueNoComtab={formHandler.generateUniqueNoComtab}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-32">
      {/* Enhanced Mobile Header */}
      <MobileFormHeader isEditMode={formHandler.isEditMode} onBackToHome={handleBackToHome} />

      {/* Mobile Step Indicator */}
      <div className="px-4 py-4">
        <MobileStepIndicator currentStep={formHandler.currentStep} totalSteps={4} />
      </div>

      {/* Mobile Form Content */}
      <motion.div className="px-4 py-6 space-y-8">
        <AnimatePresence mode="wait">{renderCurrentStep()}</AnimatePresence>
      </motion.div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        currentStep={formHandler.currentStep}
        totalSteps={4}
        onPrev={formHandler.prevStep}
        onNext={formHandler.nextStep}
        onSubmit={formHandler.handleSubmit}
        isNextDisabled={!isCurrentStepValid()}
        isSubmitDisabled={formHandler.isSubmitDisabled()}
        isSubmitting={formHandler.isSubmitting}
        isEditMode={formHandler.isEditMode}
      />
    </div>
  )
}
