"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileText, ImageIcon, Video, Music, File, X, Eye, AlertTriangle } from "lucide-react"

interface PreviewModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  file: any
  url: string
  type: string
  fileName: string
  title: string
}

export function PreviewModal({ isOpen, onOpenChange, file, url, type, fileName, title }: PreviewModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  // Simple close handler
  const handleClose = () => {
    onOpenChange(false)
  }

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Process file URL
  useEffect(() => {
    if (!isOpen) return

    const processFile = () => {
      setIsLoading(true)
      setError("")

      try {
        let processedUrl = ""

        // Handle different file input types
        if (url) {
          processedUrl = url
        } else if (file) {
          if (typeof file === "string") {
            processedUrl = file
          } else if (file instanceof File || file instanceof Blob) {
            processedUrl = URL.createObjectURL(file as Blob)
          } else if (file && typeof file === "object") {
            if (file.url) {
              processedUrl = file.url
            } else if (file.base64) {
              processedUrl = file.base64.startsWith("data:") ? file.base64 : `data:${type};base64,${file.base64}`
            }
          }
        }

        if (!processedUrl) {
          setError("File tidak dapat diakses")
          setIsLoading(false)
          return
        }

        setPreviewUrl(processedUrl)
        setIsLoading(false)
      } catch (err) {
        setError("Gagal memproses file")
        setIsLoading(false)
      }
    }

    processFile()
  }, [isOpen, file, url, type])

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="h-12 w-12 text-blue-500" />
    if (fileType.startsWith("video/")) return <Video className="h-12 w-12 text-red-500" />
    if (fileType.startsWith("audio/")) return <Music className="h-12 w-12 text-purple-500" />
    if (fileType === "application/pdf") return <FileText className="h-12 w-12 text-red-600" />
    if (fileType.startsWith("text/")) return <FileText className="h-12 w-12 text-green-500" />
    return <File className="h-12 w-12 text-gray-500" />
  }

  // Check if file is previewable
  const isPreviewable = (fileType: string) => {
    return fileType.startsWith("image/") || 
           fileType.startsWith("video/") || 
           fileType.startsWith("audio/") || 
           fileType === "application/pdf" ||
           fileType.startsWith("text/")
  }

  // Handle download
  const handleDownload = () => {
    if (!previewUrl && !url) return

    const downloadUrl = previewUrl || url
    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = fileName || "download"
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Render preview content
  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Memuat preview...</span>
        </div>
      )
    }

    if (error || !previewUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <AlertTriangle className="h-16 w-16 text-red-400" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview Tidak Tersedia</h3>
            <p className="text-gray-600">{error || "File tidak dapat diakses"}</p>
          </div>
        </div>
      )
    }

    if (!isPreviewable(type)) {
      return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          {getFileIcon(type)}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">File Tersedia</h3>
            <p className="text-gray-600 mb-4">
              Format file ini tidak mendukung preview, tetapi Anda dapat mendownloadnya.
            </p>
            <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Download File
            </Button>
          </div>
        </div>
      )
    }

    // Render based on file type
    if (type.startsWith("image/")) {
      return (
        <div className="flex items-center justify-center">
          <img
            src={previewUrl}
            alt={fileName}
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
            onError={() => setError("Gagal memuat gambar")}
          />
        </div>
      )
    }

    if (type.startsWith("video/")) {
      return (
        <div className="flex items-center justify-center">
          <video
            src={previewUrl}
            controls
            className="max-w-full max-h-[70vh] rounded-lg shadow-lg"
            onError={() => setError("Gagal memuat video")}
          >
            Browser Anda tidak mendukung tag video.
          </video>
        </div>
      )
    }

    if (type.startsWith("audio/")) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Music className="h-16 w-16 text-purple-500" />
          <audio src={previewUrl} controls className="w-full max-w-md">
            Browser Anda tidak mendukung tag audio.
          </audio>
          <p className="text-gray-600 text-center">{fileName}</p>
        </div>
      )
    }

    if (type === "application/pdf") {
      return (
        <div className="w-full h-[70vh]">
          <iframe
            src={previewUrl}
            className="w-full h-full border-0 rounded-lg"
            title={fileName}
          />
        </div>
      )
    }

    if (type.startsWith("text/")) {
      return (
        <div className="w-full h-[60vh] border rounded-lg p-4 bg-gray-50 overflow-auto">
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title={fileName}
          />
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertTriangle className="h-16 w-16 text-yellow-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview Tidak Didukung</h3>
          <p className="text-gray-600 mb-4">Format file ini tidak dapat ditampilkan dalam preview.</p>
          <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Download File
          </Button>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">{title}</h2>
              <p className="text-sm text-gray-600 truncate">{fileName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {previewUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="h-8 text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
          {renderPreview()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {fileName && <span>{fileName}</span>}
          </div>
          <div className="flex space-x-2">
            {previewUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={handleClose}
            >
              Tutup
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Keep the default export for backward compatibility
export default PreviewModal
