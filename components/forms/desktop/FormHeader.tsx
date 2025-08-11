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
  const { formData, currentStep } = useFormHandler()

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-8"
    >
    </motion.div>
  )
}
