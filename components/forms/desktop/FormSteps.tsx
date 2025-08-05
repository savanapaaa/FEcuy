"use client"

import { motion, AnimatePresence } from "framer-motion"
import { StepOne } from "./steps/StepOne"
import { StepTwo } from "./steps/StepTwo"
import { StepThree } from "./steps/StepThree"
import { StepFour } from "./steps/StepFour"
import type { FormData, FormContentItem } from "@/hooks/useFormHandler"

interface FormStepsProps {
  currentStep: number
  formData: FormData
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void
  selectedContentTypes: string[]
  contentQuantities: Record<string, number>
  onContentTypeChange: (contentType: string, checked: boolean) => void
  setContentQuantities: (
    quantities: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>),
  ) => void
  initialFormContentItemState: FormContentItem
  updateContentItem: (index: number, updatedValues: Partial<FormContentItem>) => void
  handleSourceToggle: (
    contentIndex: number,
    sourceType:
      | "narasiSourceType"
      | "audioDubbingSourceType"
      | "audioBacksoundSourceType"
      | "pendukungLainnyaSourceType",
    value: string,
    checked: boolean,
  ) => void
  generateCredentials: () => { noComtab: string; password: string }
  submissions: any[]
  isEditMode: boolean
  isMobile: boolean
  getContentTypeDisplayName: (jenisKonten: string) => string
  handleQuantityChange: (contentType: string, newQuantity: number) => void
}

export const FormSteps = ({
  currentStep,
  formData,
  setFormData,
  selectedContentTypes,
  contentQuantities,
  onContentTypeChange,
  setContentQuantities,
  initialFormContentItemState,
  updateContentItem,
  handleSourceToggle,
  generateCredentials,
  submissions,
  isEditMode,
  isMobile,
  getContentTypeDisplayName,
  handleQuantityChange,
}: FormStepsProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {currentStep === 1 && <StepOne formData={formData} setFormData={setFormData} isMobile={isMobile} />}

        {currentStep === 2 && (
          <StepTwo
            selectedContentTypes={selectedContentTypes}
            contentQuantities={contentQuantities}
            onContentTypeChange={onContentTypeChange}
            setContentQuantities={setContentQuantities}
            formData={formData}
            setFormData={setFormData}
            initialFormContentItemState={initialFormContentItemState}
            isMobile={isMobile}
            getContentTypeDisplayName={getContentTypeDisplayName}
            handleQuantityChange={handleQuantityChange}
          />
        )}

        {currentStep === 3 && (
          <StepThree
            formData={formData}
            updateContentItem={updateContentItem}
            handleSourceToggle={handleSourceToggle}
            isMobile={isMobile}
            getContentTypeDisplayName={getContentTypeDisplayName}
          />
        )}

        {currentStep === 4 && (
          <StepFour
            formData={formData}
            setFormData={setFormData}
            generateCredentials={generateCredentials}
            submissions={submissions}
            isEditMode={isEditMode}
            isMobile={isMobile}
          />
        )}
      </motion.div>
    </AnimatePresence>
  )
}
