"use client"

import { useResponsiveRedirect } from "@/hooks/use-responsive-redirect"
import { MobileForm } from "@/components/forms/mobile/MobileForm"

export default function MobileFormPage() {
  // Disable responsive redirect if in edit mode to prevent redirect loops
  const urlParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
  const isEditMode = urlParams.get("edit") || urlParams.get("editId")
  
  useResponsiveRedirect({
    enableAutoRedirect: !isEditMode, // Disable if editing
    mobileBreakpoint: 768,
    debounceMs: 100,
  })

  return <MobileForm />
}
