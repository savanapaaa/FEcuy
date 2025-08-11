"use client"

import { useState, useEffect, useMemo } from "react"
import * as apiClient from "@/lib/api-client"

export interface RiwayatItem {
  id: string
  tema: string
  judul: string
  petugasPelaksana: string
  tanggalPengajuan: string
  status: "draft" | "submitted" | "review" | "approved" | "rejected"
  contentItems: {
    id: string
    type: "video" | "foto" | "artikel" | "infografis" | "podcast"
    title: string
    description: string
    status: "pending" | "approved" | "rejected"
    feedback?: string
    createdAt: string
    updatedAt: string
  }[]
  createdAt: string
  updatedAt: string
}

export interface RiwayatFilters {
  status: string
  type: string
  dateRange: string
  search: string
}

export interface RiwayatStats {
  total: number
  pending: number
  approved: number
  rejected: number
  draft: number
}

// Helper function to map server status to frontend status
const mapServerStatus = (serverStatus: string): RiwayatItem['status'] => {
  const statusMap: Record<string, RiwayatItem['status']> = {
    'draft': 'draft',
    'submitted': 'submitted', 
    'pending': 'review',
    'review': 'review',
    'approved': 'approved',
    'rejected': 'rejected',
    'completed': 'approved',
    'published': 'approved'
  }
  
  return statusMap[serverStatus?.toLowerCase()] || 'draft'
}

// Mock data for development
const mockRiwayatData: RiwayatItem[] = [
  {
    id: "1",
    tema: "Kesehatan Masyarakat",
    judul: "Kampanye Vaksinasi COVID-19",
    petugasPelaksana: "Dr. Ahmad Santoso",
    tanggalPengajuan: "2024-01-15",
    status: "approved",
    contentItems: [
      {
        id: "c1",
        type: "video",
        title: "Video Edukasi Vaksinasi",
        description: "Video edukasi tentang pentingnya vaksinasi COVID-19",
        status: "approved",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-16T14:30:00Z",
      },
      {
        id: "c2",
        type: "infografis",
        title: "Infografis Manfaat Vaksin",
        description: "Infografis yang menjelaskan manfaat vaksinasi",
        status: "approved",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-16T14:30:00Z",
      },
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-16T14:30:00Z",
  },
  {
    id: "2",
    tema: "Pendidikan",
    judul: "Program Beasiswa Mahasiswa",
    petugasPelaksana: "Prof. Siti Nurhaliza",
    tanggalPengajuan: "2024-01-20",
    status: "review",
    contentItems: [
      {
        id: "c3",
        type: "artikel",
        title: "Artikel Beasiswa Pendidikan",
        description: "Artikel tentang program beasiswa untuk mahasiswa berprestasi",
        status: "pending",
        createdAt: "2024-01-20T09:00:00Z",
        updatedAt: "2024-01-20T09:00:00Z",
      },
    ],
    createdAt: "2024-01-20T09:00:00Z",
    updatedAt: "2024-01-20T09:00:00Z",
  },
  {
    id: "3",
    tema: "Lingkungan",
    judul: "Kampanye Reduce Plastic",
    petugasPelaksana: "Ir. Budi Hartono",
    tanggalPengajuan: "2024-01-25",
    status: "rejected",
    contentItems: [
      {
        id: "c4",
        type: "foto",
        title: "Foto Kampanye Anti Plastik",
        description: "Dokumentasi kegiatan kampanye pengurangan penggunaan plastik",
        status: "rejected",
        feedback: "Kualitas foto kurang baik, mohon diperbaiki",
        createdAt: "2024-01-25T11:00:00Z",
        updatedAt: "2024-01-26T16:00:00Z",
      },
    ],
    createdAt: "2024-01-25T11:00:00Z",
    updatedAt: "2024-01-26T16:00:00Z",
  },
  {
    id: "4",
    tema: "Teknologi",
    judul: "Digitalisasi Pelayanan Publik",
    petugasPelaksana: "Drs. Eko Prasetyo",
    tanggalPengajuan: "2024-02-01",
    status: "draft",
    contentItems: [
      {
        id: "c5",
        type: "podcast",
        title: "Podcast Digital Government",
        description: "Podcast tentang transformasi digital pemerintahan",
        status: "pending",
        createdAt: "2024-02-01T08:00:00Z",
        updatedAt: "2024-02-01T08:00:00Z",
      },
    ],
    createdAt: "2024-02-01T08:00:00Z",
    updatedAt: "2024-02-01T08:00:00Z",
  },
]

export function useRiwayatData() {
  const [data, setData] = useState<RiwayatItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<RiwayatFilters>({
    status: "all",
    type: "all",
    dateRange: "all",
    search: "",
  })

  // Load data from server first, fallback to localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("🔄 Loading riwayat data from server...")
        
        // Try to load from server first
        const response = await apiClient.getSubmissions()
        
        if (response.success && response.data) {
          console.log("✅ Riwayat data loaded from server")
          
          // Transform server data to match RiwayatItem interface
          const transformedData = response.data.map((item: any) => ({
            id: item.id?.toString() || Math.random().toString(),
            tema: item.tema || "Tidak ada tema",
            judul: item.judul || "Tidak ada judul", 
            petugasPelaksana: item.petugasPelaksana || "Tidak diketahui",
            tanggalPengajuan: item.created_at || item.createdAt || new Date().toISOString(),
            status: mapServerStatus(item.status || item.workflowStage) as RiwayatItem['status'],
            contentItems: (item.contentItems || []).map((content: any) => ({
              id: content.id?.toString() || Math.random().toString(),
              type: content.type || "artikel",
              title: content.nama || content.title || "Konten",
              description: content.keterangan || content.description || "",
              status: content.status || "pending",
              feedback: content.feedback || "",
              createdAt: content.created_at || content.createdAt || new Date().toISOString(),
              updatedAt: content.updated_at || content.updatedAt || new Date().toISOString(),
            })),
            createdAt: item.created_at || item.createdAt || new Date().toISOString(),
            updatedAt: item.updated_at || item.updatedAt || new Date().toISOString(),
          }))
          
          setData(transformedData)
          
          // Update localStorage cache
          if (typeof window !== "undefined") {
            localStorage.setItem("riwayat_cache", JSON.stringify(transformedData))
          }
          
        } else {
          throw new Error(response.message || "Failed to load from server")
        }

      } catch (err) {
        console.error("❌ Failed to load from server:", err)
        setError("Server tidak tersedia, menggunakan data cache")
        
        // Fallback to localStorage cache
        try {
          const cachedData = localStorage.getItem("riwayat_cache")
          if (cachedData) {
            console.log("⚠️ Using cached riwayat data")
            setData(JSON.parse(cachedData))
          } else {
            // If no cache, try old localStorage format
            const storedData = localStorage.getItem("form_submissions")
            if (storedData) {
              const parsedData = JSON.parse(storedData)
              const transformedData = parsedData.map((item: any) => ({
                id: item.id?.toString() || Math.random().toString(),
                tema: item.tema || "Tidak ada tema",
                judul: item.judul || "Tidak ada judul",
                petugasPelaksana: item.petugasPelaksana || "Tidak diketahui",
                tanggalPengajuan: item.createdAt || new Date().toISOString(),
                status: (item.status || "draft") as RiwayatItem['status'],
                contentItems: (item.contentItems || []).map((content: any) => ({
                  id: content.id?.toString() || Math.random().toString(),
                  type: content.type || "artikel",
                  title: content.nama || content.title || "Konten",
                  description: content.keterangan || content.description || "",
                  status: content.status || "pending",
                  feedback: content.feedback || "",
                  createdAt: content.createdAt || new Date().toISOString(),
                  updatedAt: content.updatedAt || new Date().toISOString(),
                })),
                createdAt: item.createdAt || new Date().toISOString(),
                updatedAt: item.updatedAt || new Date().toISOString(),
              }))
              setData(transformedData)
            } else {
              // Last resort: use mock data
              console.log("📋 Using mock data as last resort")
              setData(mockRiwayatData)
            }
          }
        } catch (cacheErr) {
          console.error("❌ Failed to load from cache:", cacheErr)
          setData(mockRiwayatData)
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Filtered and sorted data
  const filteredData = useMemo(() => {
    let filtered = [...data]

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter((item) => item.status === filters.status)
    }

    // Filter by content type
    if (filters.type !== "all") {
      filtered = filtered.filter((item) => item.contentItems.some((content) => content.type === filters.type))
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.judul.toLowerCase().includes(searchLower) ||
          item.tema.toLowerCase().includes(searchLower) ||
          item.petugasPelaksana.toLowerCase().includes(searchLower),
      )
    }

    // Filter by date range
    if (filters.dateRange !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (filters.dateRange) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }

      filtered = filtered.filter((item) => new Date(item.createdAt) >= filterDate)
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [data, filters])

  // Statistics
  const stats = useMemo((): RiwayatStats => {
    return {
      total: data.length,
      pending: data.filter((item) => item.status === "submitted" || item.status === "review").length,
      approved: data.filter((item) => item.status === "approved").length,
      rejected: data.filter((item) => item.status === "rejected").length,
      draft: data.filter((item) => item.status === "draft").length,
    }
  }, [data])

  // Actions
  const updateFilters = (newFilters: Partial<RiwayatFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const refreshData = async () => {
    setLoading(true)
    try {
      console.log("🔄 Refreshing riwayat data from server...")
      
      // Reload from server
      const response = await apiClient.getSubmissions()
      
      if (response.success && response.data) {
        console.log("✅ Riwayat data refreshed from server")
        
        const transformedData = response.data.map((item: any) => ({
          id: item.id?.toString() || Math.random().toString(),
          tema: item.tema || "Tidak ada tema",
          judul: item.judul || "Tidak ada judul",
          petugasPelaksana: item.petugasPelaksana || "Tidak diketahui",
          tanggalPengajuan: item.created_at || item.createdAt || new Date().toISOString(),
          status: mapServerStatus(item.status || item.workflowStage) as RiwayatItem['status'],
          contentItems: (item.contentItems || []).map((content: any) => ({
            id: content.id?.toString() || Math.random().toString(),
            type: content.type || "artikel",
            title: content.nama || content.title || "Konten",
            description: content.keterangan || content.description || "",
            status: content.status || "pending",
            feedback: content.feedback || "",
            createdAt: content.created_at || content.createdAt || new Date().toISOString(),
            updatedAt: content.updated_at || content.updatedAt || new Date().toISOString(),
          })),
          createdAt: item.created_at || item.createdAt || new Date().toISOString(),
          updatedAt: item.updated_at || item.updatedAt || new Date().toISOString(),
        }))
        
        setData(transformedData)
        
        // Update cache
        if (typeof window !== "undefined") {
          localStorage.setItem("riwayat_cache", JSON.stringify(transformedData))
        }
        
        setError(null)
      } else {
        throw new Error(response.message || "Failed to refresh from server")
      }
    } catch (err) {
      console.error("❌ Failed to refresh from server:", err)
      setError("Gagal memuat ulang data dari server")
      
      // Try to use cache
      try {
        const cachedData = localStorage.getItem("riwayat_cache")
        if (cachedData) {
          setData(JSON.parse(cachedData))
        }
      } catch (cacheErr) {
        console.error("❌ Failed to load from cache:", cacheErr)
      }
    } finally {
      setLoading(false)
    }
  }

  const deleteItem = async (id: string) => {
    try {
      console.log(`🔄 Deleting item ${id} from server...`)
      
      // Delete from server first
      const response = await apiClient.deleteSubmission(id)
      
      if (response.success) {
        console.log(`✅ Item ${id} deleted from server`)
        
        // Update local state
        setData((prev) => prev.filter((item) => item.id !== id))
        
        // Update cache
        const updatedData = data.filter((item) => item.id !== id)
        if (typeof window !== "undefined") {
          localStorage.setItem("riwayat_cache", JSON.stringify(updatedData))
        }
        
      } else {
        throw new Error(response.message || "Failed to delete from server")
      }
    } catch (err) {
      console.error(`❌ Failed to delete item ${id}:`, err)
      setError("Gagal menghapus item dari server")
      
      // Don't update local state if server delete failed
      // This ensures data consistency
    }
  }

  return {
    data: filteredData,
    loading,
    error,
    filters,
    stats,
    updateFilters,
    refreshData,
    deleteItem,
  }
}
