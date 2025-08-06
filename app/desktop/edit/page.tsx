"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { DiskomInfoLoading } from "@/components/global/diskominfo-loading"

function MobileEditContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Add a small delay to ensure everything is loaded
    const timer = setTimeout(() => {
      // Get edit parameters and redirect to form with edit params
      const editId = searchParams.get("id") || searchParams.get("editId")
      const editPin = searchParams.get("pin") || searchParams.get("editPin")
      
      console.log("MobileEditPage: Edit parameters received", { 
        editId, 
        editPin, 
        searchParams: searchParams.toString(),
        fullUrl: window.location.href 
      })

      if (editId) {
        // Validate submission exists before redirecting
        try {
          const submissions = JSON.parse(localStorage.getItem("submissions") || "[]")
          console.log("MobileEditPage: All submissions in localStorage:", submissions)
          console.log("MobileEditPage: Looking for editId:", editId)
          console.log("MobileEditPage: Looking for editPin:", editPin)
          
          // Debug: log all noComtab values
          const noComtabList = submissions.map((s: any) => s.noComtab)
          console.log("MobileEditPage: Available noComtab values:", noComtabList)
          
          let submission = submissions.find((s: any) => {
            console.log("MobileEditPage: Comparing", s.noComtab, "with", editId)
            return s.noComtab === editId || s.id === editId
          })

          if (!submission) {
            console.error("MobileEditPage: Submission not found for ID:", editId)
            console.error("MobileEditPage: Available submissions:", submissions.length)
            router.replace("/riwayat?error=submission-not-found")
            return
          }

          console.log("MobileEditPage: Found submission:", submission)

          // Validate PIN if provided
          if (editPin && submission.pin !== editPin) {
            console.error("MobileEditPage: Invalid PIN. Expected:", submission.pin, "Got:", editPin)
            router.replace("/riwayat?error=invalid-pin")
            return
          }

          console.log("MobileEditPage: Validation successful, redirecting to form")
          
          // Redirect to form with edit parameters
          let url = `/mobile/form?edit=${editId}`
          if (editPin) {
            url += `&editPin=${editPin}`
          }
          
          console.log("MobileEditPage: Redirecting to:", url)
          router.replace(url)
        } catch (error) {
          console.error("MobileEditPage: Error during validation:", error)
          router.replace("/riwayat?error=validation-failed")
        }
      } else {
        console.log("MobileEditPage: No edit ID provided, redirecting to riwayat")
        router.replace("/riwayat")
      }
    }, 100) // Small delay to prevent immediate redirect issues

    return () => clearTimeout(timer)
  }, [router, searchParams])

  return <DiskomInfoLoading />
}

export default function MobileEditPage() {
  return (
    <Suspense fallback={<DiskomInfoLoading />}>
      <MobileEditContent />
    </Suspense>
  )
}