"use client"

import { useState, useEffect, useMemo } from "react"

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

  // Load data (in real app, this would be an API call)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Try to load from localStorage first
        const storedData = localStorage.getItem("form_submissions")
        if (storedData) {
          const parsedData = JSON.parse(storedData)
          // Transform stored data to match RiwayatItem interface
          const transformedData = parsedData.map((item: any) => ({
            ...item,
            contentItems: item.contentItems || [],
            status: item.status || "draft",
          }))
          setData([...transformedData, ...mockRiwayatData])
        } else {
          setData(mockRiwayatData)
        }

        setError(null)
      } catch (err) {
        setError("Gagal memuat data riwayat")
        setData(mockRiwayatData) // Fallback to mock data
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
      // Simulate API refresh
      await new Promise((resolve) => setTimeout(resolve, 500))

      const storedData = localStorage.getItem("form_submissions")
      if (storedData) {
        const parsedData = JSON.parse(storedData)
        const transformedData = parsedData.map((item: any) => ({
          ...item,
          contentItems: item.contentItems || [],
          status: item.status || "draft",
        }))
        setData([...transformedData, ...mockRiwayatData])
      }

      setError(null)
    } catch (err) {
      setError("Gagal memuat ulang data")
    } finally {
      setLoading(false)
    }
  }

  const deleteItem = async (id: string) => {
    try {
      setData((prev) => prev.filter((item) => item.id !== id))

      // Update localStorage
      const storedData = localStorage.getItem("form_submissions")
      if (storedData) {
        const parsedData = JSON.parse(storedData)
        const updatedData = parsedData.filter((item: any) => item.id !== id)
        localStorage.setItem("form_submissions", JSON.stringify(updatedData))
      }
    } catch (err) {
      setError("Gagal menghapus item")
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
