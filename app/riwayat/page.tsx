"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"
import RiwayatDesktop from "@/components/riwayat/RiwayatDesktop"
import RiwayatMobile from "@/components/riwayat/RiwayatMobile"
import { EnhancedLoadingSpinner } from "@/components/enhanced-loading-spinner"

export default function RiwayatPage() {
  const router = useRouter()
  const isMobile = useMobile()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleEdit = (id: string) => {
    if (isMobile) {
      router.push(`/mobile/edit?id=${id}`)
    } else {
      router.push(`/desktop/edit?id=${id}`)
    }
  }

  if (!mounted) {
    return <EnhancedLoadingSpinner />
  }

  return <>{isMobile ? <RiwayatMobile onEdit={handleEdit} /> : <RiwayatDesktop onEdit={handleEdit} />}</>
}
