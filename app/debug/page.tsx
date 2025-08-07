"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ApiTestPanel from "@/components/api-test-panel"
import DataMigrationTool from "@/components/data-migration-tool"
import DataSourceStatus from "@/components/data-source-status"

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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🔧 Debug & Development Tools</h1>
        <DataSourceStatus />
      </div>
      
      <Tabs defaultValue="migration" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="migration">Data Migration</TabsTrigger>
          <TabsTrigger value="api-test">API Integration Test</TabsTrigger>
          <TabsTrigger value="data-management">Data Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="migration">
          <DataMigrationTool />
        </TabsContent>
        
        <TabsContent value="api-test">
          <ApiTestPanel />
        </TabsContent>
        
        <TabsContent value="data-management">
          <Card>
            <CardHeader>
              <CardTitle>🗄️ Debug Tool - Submissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button onClick={addTestData} className="w-full">Add Test Data</Button>
                <Button onClick={clearData} variant="destructive" className="w-full">Clear Data</Button>
                <Button onClick={viewData} variant="outline" className="w-full">View Current Data</Button>
              </div>
              
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
