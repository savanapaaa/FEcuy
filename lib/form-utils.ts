import type { FileData as PersistedFileData } from "@/lib/utils"
import type { FormContentItem } from "@/app/form-types"

// Define a FileData interface for form state (can include base64 for temporary preview)
interface FileDataForForm {
  name: string
  size: number
  type: string
  lastModified: number
  base64?: string // Temporary for preview, not persisted
  url?: string // Temporary for preview (data URI or blob URL), not persisted
}

// Function to create FileDataForForm object from a File (includes base64 for preview)
export const createFileDataForPreview = async (file: File): Promise<FileDataForForm> => {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    base64: base64,
    url: base64, // Use base64 as URL for preview
  }
}

// Function to create PersistedFileData object from a File (metadata only)
export const createPersistedFileData = (file: File): PersistedFileData => {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  }
}

// Helper function to generate content title with number
export const generateContentTitle = (jenisKonten: string, existingItems: FormContentItem[]) => {
  const sameTypeItems = existingItems.filter((item) => item.jenisKonten === jenisKonten)
  const nextNumber = sameTypeItems.length + 1
  const displayName = getContentTypeDisplayName(jenisKonten)
  return `${displayName} ${nextNumber}`
}

// Helper function to get content type display name
export const getContentTypeDisplayName = (jenisKonten: string) => {
  const typeNames: Record<string, string> = {
    infografis: "Infografis",
    "naskah-berita": "Naskah Berita",
    audio: "Audio",
    video: "Video",
    fotografis: "Fotografis",
    bumper: "Bumper",
  }
  return typeNames[jenisKonten] || jenisKonten.charAt(0).toUpperCase() + jenisKonten.slice(1).replace("-", " ")
}
