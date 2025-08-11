import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// File handling utilities
export const saveSubmissionsToStorage = (submissions: any[]) => {
  try {
    localStorage.setItem("submissions", JSON.stringify(submissions))
    return true
  } catch (error) {
    console.error("Error saving submissions to storage:", error)
    return false
  }
}

export const loadSubmissionsFromStorage = () => {
  try {
    const saved = localStorage.getItem("submissions")
    if (saved) {
      const parsed = JSON.parse(saved)
      // Ensure we always return an array
      return Array.isArray(parsed) ? parsed : []
    }
    return []
  } catch (error) {
    console.error("Error loading submissions from storage:", error)
    return []
  }
}

export const getFileIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase()

  switch (extension) {
    case "pdf":
      return "📄"
    case "doc":
    case "docx":
      return "📝"
    case "xls":
    case "xlsx":
      return "📊"
    case "ppt":
    case "pptx":
      return "📋"
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return "🖼️"
    case "mp4":
    case "avi":
    case "mov":
      return "🎥"
    case "mp3":
    case "wav":
      return "🎵"
    case "zip":
    case "rar":
      return "📦"
    default:
      return "📎"
  }
}

export const downloadFile = (file: any, fileName?: string) => {
  try {
    if (typeof file === "string") {
      // If it's a URL or base64 string
      if (file.startsWith("http")) {
        // External URL
        window.open(file, "_blank")
      } else if (file.startsWith("data:")) {
        // Base64 data URL
        const link = document.createElement("a")
        link.href = file
        link.download = fileName || "download"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // Assume it's a file path
        window.open(file, "_blank")
      }
    } else if (file && typeof file === "object") {
      // File object
      if (file.url) {
        window.open(file.url, "_blank")
      } else if (file.base64) {
        const link = document.createElement("a")
        link.href = file.base64
        link.download = file.name || fileName || "download"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }
  } catch (error) {
    console.error("Error downloading file:", error)
  }
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export const validateFile = (file: File, maxSize: number = 10 * 1024 * 1024, allowedTypes: string[] = []) => {
  const errors: string[] = []

  if (file.size > maxSize) {
    errors.push(`File size must be less than ${formatFileSize(maxSize)}`)
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(", ")}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return "Belum diisi"

  try {
    let dateObj: Date

    if (typeof date === "string") {
      dateObj = new Date(date)
    } else if (date instanceof Date) {
      dateObj = date
    } else {
      return "Tanggal tidak valid"
    }

    if (isNaN(dateObj.getTime())) {
      return "Tanggal tidak valid"
    }

    return dateObj.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Tanggal tidak valid"
  }
}

export const formatDateTime = (date: Date | string | undefined): string => {
  if (!date) return "Belum diisi"

  try {
    let dateObj: Date

    if (typeof date === "string") {
      dateObj = new Date(date)
    } else if (date instanceof Date) {
      dateObj = date
    } else {
      return "Tanggal tidak valid"
    }

    if (isNaN(dateObj.getTime())) {
      return "Tanggal tidak valid"
    }

    return dateObj.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    console.error("Error formatting date time:", error)
    return "Tanggal tidak valid"
  }
}

export const truncateText = (text: string, maxLength = 100): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const isValidUrl = (string: string): boolean => {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

export const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/[^a-z0-9.-]/gi, "_").toLowerCase()
}

export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "approved":
    case "disetujui":
      return "bg-green-100 text-green-800 border-green-200"
    case "rejected":
    case "ditolak":
      return "bg-red-100 text-red-800 border-red-200"
    case "pending":
    case "menunggu":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "review":
    case "direview":
      return "bg-blue-100 text-blue-800 border-blue-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error("Failed to copy to clipboard:", error)
    return false
  }
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
