"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileStepTwoProps {
  selectedContentTypes: string[]
  contentQuantities: Record<string, number>
  onContentTypeChange: (type: string, checked: boolean) => void
  handleQuantityChange: (type: string, change: number) => void
  getContentTypeDisplayName: (type: string) => string
  getContentTypeColor: (type: string) => string
  getContentTypeIcon: (type: string) => React.ReactNode
}

const contentTypes = [
  {
    id: "infografis",
    name: "Infografis",
    description: "Desain visual informatif",
    emoji: "🎨",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    id: "naskah-berita",
    name: "Naskah Berita",
    description: "Artikel berita tertulis",
    emoji: "📰",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "audio",
    name: "Audio",
    description: "Konten suara/podcast",
    emoji: "🎵",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "video",
    name: "Video",
    description: "Konten video multimedia",
    emoji: "🎬",
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    id: "fotografis",
    name: "Fotografis",
    description: "Foto dokumentasi",
    emoji: "📸",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    id: "bumper",
    name: "Bumper",
    description: "Video intro/outro pendek",
    emoji: "🎭",
    gradient: "from-red-500 to-pink-500",
  },
]

export const MobileStepTwo = ({
  selectedContentTypes = [],
  contentQuantities = {},
  onContentTypeChange,
  handleQuantityChange,
  getContentTypeDisplayName,
  getContentTypeColor,
  getContentTypeIcon,
}: MobileStepTwoProps) => {
  // Ensure we have valid arrays and objects
  const safeSelectedContentTypes = selectedContentTypes || []
  const safeContentQuantities = contentQuantities || {}

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
        <CardContent className="p-6 space-y-6">
          <motion.h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>Pilih Jenis Konten</span>
          </motion.h2>

          <div className="space-y-4">
            {contentTypes.map((contentType) => {
              const isSelected = safeSelectedContentTypes.includes(contentType.id)
              const quantity = safeContentQuantities[contentType.id] || 1

              return (
                <motion.div
                  key={contentType.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: contentTypes.indexOf(contentType) * 0.1 }}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border-2 transition-all duration-300",
                    isSelected
                      ? "border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md",
                  )}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Content Type Icon */}
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-r",
                            contentType.gradient,
                          )}
                        >
                          <span className="text-2xl">{contentType.emoji}</span>
                        </div>

                        {/* Content Info */}
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 text-base">{contentType.name}</h3>
                          <p className="text-sm text-gray-500">{contentType.description}</p>
                          {isSelected && (
                            <Badge variant="secondary" className="mt-1 bg-purple-100 text-purple-700">
                              {quantity} item{quantity > 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <Switch
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          if (onContentTypeChange) {
                            onContentTypeChange(contentType.id, checked)
                          }
                        }}
                        className="data-[state=checked]:bg-purple-600"
                      />
                    </div>

                    {/* Quantity Controls - Show when selected */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-purple-200"
                      >
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-gray-700">Jumlah:</Label>
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (handleQuantityChange) {
                                  handleQuantityChange(contentType.id, -1)
                                }
                              }}
                              disabled={quantity <= 1 ? true : undefined}
                              className="h-8 w-8 p-0 rounded-full border-purple-300 hover:bg-purple-50"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-bold text-lg text-purple-700 min-w-[2rem] text-center">
                              {quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (handleQuantityChange) {
                                  handleQuantityChange(contentType.id, 1)
                                }
                              }}
                              disabled={quantity >= 10 ? true : undefined}
                              className="h-8 w-8 p-0 rounded-full border-purple-300 hover:bg-purple-50"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Summary Section */}
          {safeSelectedContentTypes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl border border-purple-200"
            >
              <h3 className="font-bold text-gray-800 mb-2 flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600" />
                <span>Ringkasan Pilihan</span>
              </h3>
              <div className="space-y-1">
                {safeSelectedContentTypes.map((type) => (
                  <div key={type} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">
                      {getContentTypeDisplayName ? getContentTypeDisplayName(type) : type}
                    </span>
                    <Badge variant="secondary" className="bg-purple-200 text-purple-800">
                      {safeContentQuantities[type] || 1} item{(safeContentQuantities[type] || 1) > 1 ? "s" : ""}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-purple-300">
                <div className="flex justify-between items-center font-bold text-purple-800">
                  <span>Total Konten:</span>
                  <span>
                    {safeSelectedContentTypes.reduce((total, type) => total + (safeContentQuantities[type] || 1), 0)}{" "}
                    items
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
