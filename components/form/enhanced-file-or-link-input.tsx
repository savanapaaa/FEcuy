"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Link, X, FileText, ImageIcon, Video, Music, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Enhanced FileData interface for better file handling and preview
interface FileDataForForm {
  name: string
  size: number
  type: string
  lastModified: number
  base64?: string // For preview and persistence
  url?: string // Blob URL for temporary preview
  preview?: string // Optimized preview URL
  thumbnailBase64?: string // Compressed thumbnail for lists
}

interface EnhancedFileOrLinkInputProps {
  id: string
  label: string
  value?: File | string | null
  onChange: (newValue: File | string | null) => void
  accept?: string
  sourceTypes?: string[]
  onSourceToggle?: () => void
  className?: string
}

// Enhanced file processing functions
const createThumbnail = async (file: File, maxWidth = 200, maxHeight = 200, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      resolve("") // Return empty string for non-images
      return
    }

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)
      const thumbnailDataUrl = canvas.toDataURL("image/jpeg", quality)
      resolve(thumbnailDataUrl)
    }

    img.onerror = () => reject(new Error("Failed to create thumbnail"))
    img.src = URL.createObjectURL(file)
  })
}

const createFileDataForPreview = async (file: File): Promise<FileDataForForm> => {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })

  // Create thumbnail for images
  let thumbnailBase64 = ""
  try {
    if (file.type.startsWith("image/")) {
      thumbnailBase64 = await createThumbnail(file)
    }
  } catch (error) {
    console.warn("Failed to create thumbnail:", error)
  }

  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    base64: base64,
    url: base64,
    preview: base64,
    thumbnailBase64: thumbnailBase64 || base64,
  }
}

// Enhanced file type detection
const getFileIcon = (file: any) => {
  if (!file) return FileText

  const fileType =
    typeof file === "string"
      ? file.split(".").pop()?.toLowerCase()
      : file.type?.split("/")[0] || file.name?.split(".").pop()?.toLowerCase()

  switch (fileType) {
    case "pdf":
      return FileText
    case "image":
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
      return ImageIcon
    case "video":
    case "mp4":
    case "avi":
    case "mov":
    case "wmv":
      return Video
    case "audio":
    case "mp3":
    case "wav":
    case "ogg":
    case "m4a":
      return Music
    case "doc":
    case "docx":
      return FileText
    default:
      return FileText
  }
}

const isImageFile = (file: any): boolean => {
  if (!file) return false

  const imageTypes = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"]

  if (typeof file === "string") {
    const ext = file.split(".").pop()?.toLowerCase()
    return imageTypes.includes(ext || "")
  }

  if (file.type) {
    return file.type.startsWith("image/")
  }

  if (file.name) {
    const ext = file.name.split(".").pop()?.toLowerCase()
    return imageTypes.includes(ext || "")
  }

  return false
}

const getPreviewUrl = (file: any): string | null => {
  if (!file) return null

  try {
    // Handle string URLs
    if (typeof file === "string") {
      if (file.startsWith("http://") || file.startsWith("https://") || file.startsWith("data:")) {
        return file
      }
      return null
    }

    // Handle File/Blob objects
    if (file instanceof File || file instanceof Blob) {
      return URL.createObjectURL(file)
    }

    // Handle file objects with properties
    if (typeof file === "object") {
      // Priority: preview > base64 > url
      if (file.preview && typeof file.preview === "string") {
        return file.preview
      }

      if (file.base64 && typeof file.base64 === "string") {
        return file.base64
      }

      if (file.url && typeof file.url === "string") {
        return file.url
      }
    }

    return null
  } catch (error) {
    console.error("Error getting preview URL:", error)
    return null
  }
}

// Helper function to format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

const EnhancedFileOrLinkInput: React.FC<EnhancedFileOrLinkInputProps> = ({
  id,
  label,
  value,
  onChange,
  accept = "*",
  className = "",
}) => {
  const [inputType, setInputType] = useState<"file" | "link">("file")
  const [linkValue, setLinkValue] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    onChange(file)
  }

  const handleLinkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const link = event.target.value
    setLinkValue(link)
    onChange(link)
  }

  const clearValue = () => {
    onChange(null)
    setLinkValue("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const renderFileInput = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor={`${id}-file`}
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-4 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Klik untuk upload</span> atau drag and drop
            </p>
            <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (MAX. 10MB)</p>
          </div>
          <input
            ref={fileInputRef}
            id={`${id}-file`}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleFileChange}
          />
        </label>
      </div>

      {value && value instanceof File && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
        >
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">{value.name}</span>
            <span className="text-xs text-blue-600">({(value.size / 1024 / 1024).toFixed(2)} MB)</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearValue}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </div>
  )

  const renderLinkInput = () => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <ExternalLink className="w-4 h-4 text-gray-500" />
        <Input
          id={`${id}-link`}
          type="url"
          placeholder="https://example.com/document.pdf"
          value={linkValue}
          onChange={handleLinkChange}
          className="flex-1"
        />
      </div>

      {linkValue && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
        >
          <div className="flex items-center space-x-2">
            <Link className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800 truncate">{linkValue}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearValue}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </div>
  )

  return (
    <div className={`space-y-4 ${className}`}>
      <Label htmlFor={id} className="text-sm font-semibold text-gray-700">
        {label}
      </Label>

      <div className="flex space-x-2 mb-4">
        <Button
          type="button"
          variant={inputType === "file" ? "default" : "outline"}
          size="sm"
          onClick={() => setInputType("file")}
          className="flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload File</span>
        </Button>
        <Button
          type="button"
          variant={inputType === "link" ? "default" : "outline"}
          size="sm"
          onClick={() => setInputType("link")}
          className="flex items-center space-x-2"
        >
          <Link className="w-4 h-4" />
          <span>Link URL</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={inputType}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {inputType === "file" ? renderFileInput() : renderLinkInput()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}

export { EnhancedFileOrLinkInput }
export default EnhancedFileOrLinkInput
