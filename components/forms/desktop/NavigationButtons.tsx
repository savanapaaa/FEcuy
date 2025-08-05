"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Send, Loader2, Edit } from "lucide-react"

interface NavigationButtonsProps {
  currentStep: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => Promise<boolean>
  isSubmitting: boolean
  isFormValid: boolean
  isEditMode?: boolean
}

export default function NavigationButtons({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting,
  isFormValid,
  isEditMode = false,
}: NavigationButtonsProps) {
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200"
    >
      {/* Previous Button */}
      <div>
        {!isFirstStep && (
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-6 py-3 text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Sebelumnya</span>
          </Button>
        )}
      </div>

      {/* Step Indicator */}
      <div className="flex items-center space-x-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i + 1 === currentStep ? "bg-blue-600 w-8" : i + 1 < currentStep ? "bg-green-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Next/Submit Button */}
      <div>
        {isLastStep ? (
          <Button
            onClick={onSubmit}
            disabled={!isFormValid || isSubmitting}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{isEditMode ? "Memperbarui..." : "Mengirim..."}</span>
              </>
            ) : (
              <>
                {isEditMode ? <Edit className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                <span>{isEditMode ? "Perbarui Pengajuan" : "Kirim Pengajuan"}</span>
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={onNext}
            disabled={!isFormValid || isSubmitting}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Selanjutnya</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  )
}
