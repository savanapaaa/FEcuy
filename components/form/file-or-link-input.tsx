"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Link, X, FileText, Eye, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface FileOrLinkInputProps {
  value: File | string | null
  onChange: (value: File | string | null) => void
  currentType?: "file" | "link"
  accept?: string
  placeholder?: string
  label?: string
  required?: boolean
  disabled?: boolean
}

const FileOrLinkInput: React.FC<FileOrLinkInputProps> = ({
  value,
  onChange,
  currentType = "file",
  accept = "*",
  placeholder,
  label,
  required = false,
  disabled = false,
}) => {
  const [activeType, setActiveType] = useState<"file" | "link">(currentType)
  const [linkValue, setLinkValue] = useState(typeof value === "string" ? value : "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    onChange(file)
  }

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const link = e.target.value
    setLinkValue(link)
    onChange(link || null)
  }

  const clearValue = () => {
    onChange(null)
    setLinkValue("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getFileName = () => {
    if (value instanceof File) {
      return value.name
    }
    return null
  }

  const getFileSize = () => {
    if (value instanceof File) {
      const bytes = value.size
      if (bytes === 0) return "0 Bytes"
      const k = 1024
      const sizes = ["Bytes", "KB", "MB", "GB"]
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }
    return null
  }

  return (
    <div className="w-full space-y-3">
      {label && (
        <Label className="text-sm font-semibold text-gray-700 flex items-center">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      {/* Type Toggle */}
      <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={() => setActiveType("file")}
          disabled={disabled}
          className={cn(
            "flex-1 py-2 px-4 text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2",
            activeType === "file"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-100",
          )}
        >
          <Upload className="h-4 w-4" />
          <span>File</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveType("link")}
          disabled={disabled}
          className={cn(
            "flex-1 py-2 px-4 text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2",
            activeType === "link"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-100",
          )}
        >
          <Link className="h-4 w-4" />
          <span>Link</span>
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeType === "file" ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {value instanceof File ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">{getFileName()}</p>
                      <p className="text-sm text-green-600">{getFileSize()}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearValue}
                    disabled={disabled}
                    className="text-green-600 hover:text-green-800 hover:bg-green-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  disabled={disabled}
                  className="hidden"
                  accept={accept}
                />
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">{placeholder || "Klik untuk memilih file"}</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="text-sm"
                >
                  Pilih File
                </Button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="link"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <Input
              type="url"
              placeholder={placeholder || "https://example.com/file.pdf"}
              value={linkValue}
              onChange={handleLinkChange}
              disabled={disabled}
              className="w-full"
            />
            {linkValue && (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800 truncate">{linkValue}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(linkValue, "_blank")}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearValue}
                    disabled={disabled}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FileOrLinkInput
