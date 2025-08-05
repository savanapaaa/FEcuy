"use client"

import { useResponsiveRedirect } from "@/hooks/use-responsive-redirect"
import { MobileForm } from "@/components/forms/mobile/MobileForm"

export default function MobileFormPage() {
  useResponsiveRedirect({
    enableAutoRedirect: true,
    mobileBreakpoint: 768,
    debounceMs: 100,
  })

  return <MobileForm />
}
