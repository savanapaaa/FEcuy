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
  const {formData, currentStep } = useFormHandler()



}
