"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Circle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  currentStep: number
  getStepValidation: (step: number) => boolean
}

export const StepIndicator = ({ currentStep, getStepValidation }: StepIndicatorProps) => {
  const steps = [
    { number: 1, title: "Informasi Dasar", description: "Data umum permohonan" },
    { number: 2, title: "Jenis Konten", description: "Pilih jenis konten yang dibutuhkan" },
    { number: 3, title: "Detail Konten", description: "Lengkapi detail setiap konten" },
    { number: 4, title: "Konfirmasi", description: "Review dan kirim permohonan" },
  ]

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return "completed"
    if (stepNumber === currentStep) return "current"
    return "pending"
  }

  const getStepIcon = (stepNumber: number) => {
    const status = getStepStatus(stepNumber)
    const isValid = getStepValidation(stepNumber)

    if (status === "completed") {
      return <CheckCircle2 className="w-6 h-6 text-white" />
    }
    if (status === "current") {
      return isValid ? <CheckCircle2 className="w-6 h-6 text-white" /> : <Clock className="w-6 h-6 text-white" />
    }
    return <Circle className="w-6 h-6 text-gray-400" />
  }

  const getStepColor = (stepNumber: number) => {
    const status = getStepStatus(stepNumber)
    const isValid = getStepValidation(stepNumber)

    if (status === "completed") return "bg-green-500"
    if (status === "current") {
      return isValid ? "bg-green-500" : "bg-blue-500"
    }
    return "bg-gray-300"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
    </motion.div>
  )
}
