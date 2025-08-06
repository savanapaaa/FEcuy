"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPage() {
  const [status, setStatus] = useState("")

  const addTestData = () => {
    const testSubmissions = [
      {
        id: Date.now(),
        noComtab: "20250806101530/IKP/08/2025",
        pin: "1234",
        tema: "Kesehatan",
        judul: "Kampanye Hidup Sehat",
        jenisMedia: "Digital",
        mediaPemerintah: ["Website", "Instagram"],
        mediaMassa: ["Kompas", "Detik"],
        jenisKonten: ["video", "infografis"],
        tanggalOrder: new Date().toISOString(),
        petugasPelaksana: "John Doe",
        supervisor: "Jane Smith",
        durasi: "30 hari",
        jumlahProduksi: "5 konten",
        tanggalSubmit: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        isConfirmed: true,
        workflowStage: "review",
        contentItems: [
          {
            id: "content-1",
            nama: "Video Edukasi Hidup Sehat",
            jenisKonten: "video",
            mediaPemerintah: ["Instagram", "YouTube"],
            mediaMassa: ["TV One"],
            nomorSurat: "001/KEK/2025",
            narasiText: "Video edukasi tentang pola hidup sehat",
            sourceNarasi: ["text"],
            sourceAudioDubbing: [],
            sourceAudioBacksound: [],
            sourcePendukungLainnya: [],
            tanggalOrderMasuk: new Date().toISOString(),
            tanggalJadi: new Date().toISOString(),
            tanggalTayang: new Date().toISOString(),
            keterangan: "Konten untuk kampanye kesehatan",
            status: "pending"
          }
        ]
      }
    ]

    localStorage.setItem("submissions", JSON.stringify(testSubmissions))
    setStatus("✅ Test data added! Check console for details.")
    console.log("✅ Test data added:", testSubmissions)
  }

  const clearData = () => {
    localStorage.removeItem("submissions")
    setStatus("🗑️ Data cleared!")
  }

  const viewData = () => {
    const data = localStorage.getItem("submissions")
    if (data) {
      const submissions = JSON.parse(data)
      console.log("📊 Current submissions:", submissions)
      setStatus(`📊 Found ${submissions.length} submissions. Check console for details.`)
    } else {
      setStatus("📭 No data found")
    }
  }

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Debug Tool - Submissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={addTestData}>Add Test Data</Button>
          <Button onClick={clearData} variant="destructive">Clear Data</Button>
          <Button onClick={viewData} variant="outline">View Current Data</Button>
          
          <div className="p-4 bg-gray-100 rounded">
            Status: {status}
          </div>

          <div className="space-y-2">
            <a href="/dashboard/admin/review" className="block text-blue-600 hover:underline">
              → Go to Review Page
            </a>
            <a href="/dashboard/admin" className="block text-blue-600 hover:underline">
              → Go to Admin Dashboard  
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
