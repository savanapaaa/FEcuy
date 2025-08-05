"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { useFormHandler } from "@/hooks/useFormHandler"
import { FormHeader } from "./FormHeader"
import { StepIndicator } from "./StepIndicator"
import NavigationButtons from "./NavigationButtons"
import StepOne from "./steps/StepOne"
import StepTwo from "./steps/StepTwo"
import StepThree from "./steps/StepThree"
import StepFour from "./steps/StepFour"

export default function DesktopForm() {
  const formHandler = useFormHandler()

  // Add this function before the renderStep function
  const updateContentItem = (index: number, updatedValues: any) => {
    const updatedItems = [...formHandler.formData.contentItems]
    updatedItems[index] = { ...updatedItems[index], ...updatedValues }
    formHandler.updateFormData({ contentItems: updatedItems })
  }

  const renderStep = () => {
    switch (formHandler.currentStep) {
      case 1:
        return <StepOne formData={formHandler.formData} updateFormData={formHandler.updateFormData} />
      case 2:
        return <StepTwo formData={formHandler.formData} updateFormData={formHandler.updateFormData} />
      case 3:
        return <StepThree formData={formHandler.formData} updateContentItem={updateContentItem} />
      case 4:
        return (
          <StepFour
            formData={formHandler.formData}
            updateFormData={formHandler.updateFormData}
            isFormCompleteForSubmission={() => formHandler.getStepValidation(4)}
            isStep4Valid={formHandler.getStepValidation(4)}
            generateCredentials={formHandler.generateCredentials}
            isEditMode={formHandler.isEditMode}
          />
        )
      default:
        return null
    }
  }

  // Get current step validation status
  const isCurrentStepValid = formHandler.getStepValidation(formHandler.currentStep)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <FormHeader isEditMode={formHandler.isEditMode} isMobile={false} />

          {/* Step Indicator */}
          <StepIndicator currentStep={formHandler.currentStep} getStepValidation={formHandler.getStepValidation} />

          {/* Main Form Card */}
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl">
            <CardContent className="p-8">
              {/* Step Content */}
              <motion.div
                key={formHandler.currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>

              {/* Navigation Buttons */}
              <NavigationButtons
                currentStep={formHandler.currentStep}
                totalSteps={4}
                onPrevious={formHandler.prevStep}
                onNext={formHandler.nextStep}
                onSubmit={formHandler.handleSubmit}
                isSubmitting={formHandler.isSubmitting}
                isFormValid={isCurrentStepValid}
                isEditMode={formHandler.isEditMode}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
