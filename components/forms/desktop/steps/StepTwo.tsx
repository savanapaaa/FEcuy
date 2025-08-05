"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Video, ImageIcon, FileText, Mic, Radio, Camera, Plus, Minus, CheckCircle, AlertCircle } from "lucide-react"
import type { FormData } from "@/hooks/useFormHandler"

interface StepTwoProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}

const contentTypeOptions = [
  {
    id: "infografis",
    label: "Infografis",
    description: "Desain grafis informatif dan menarik",
    icon: ImageIcon,
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "naskah-berita",
    label: "Naskah Berita",
    description: "Artikel berita untuk publikasi",
    icon: FileText,
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    id: "audio",
    label: "Audio",
    description: "Konten audio untuk radio atau podcast",
    icon: Mic,
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    id: "video",
    label: "Video",
    description: "Konten video promosi atau dokumenter",
    icon: Video,
    color: "from-red-500 to-pink-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  {
    id: "fotografis",
    label: "Fotografis",
    description: "Foto dokumentasi atau promosi",
    icon: Camera,
    color: "from-orange-500 to-amber-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  {
    id: "bumper",
    label: "Bumper",
    description: "Video bumper atau intro singkat",
    icon: Radio,
    color: "from-indigo-500 to-purple-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
  },
]

export default function StepTwo({ formData, updateFormData }: StepTwoProps) {
  const selectedContentTypes = formData.contentItems.map((item) => item.jenisKonten)
  const contentQuantities = formData.contentItems.reduce(
    (acc, item) => {
      acc[item.jenisKonten] = (acc[item.jenisKonten] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const handleContentTypeChange = (contentType: string, checked: boolean) => {
    if (checked) {
      // Add one item of this type
      const newItem = {
        id: `${contentType}-${Date.now()}`,
        jenisKonten: contentType,
        nama: "",
        nomorSurat: "",
        tanggalOrderMasuk: null,
        tanggalJadi: null,
        tanggalTayang: null,
        mediaPemerintah: [],
        mediaMassa: [],
        narasiSourceType: [],
        narasiText: "",
        narasiFile: null,
        suratFile: null,
        audioDubbingSourceType: [],
        audioDubbingFile: null,
        audioDubbingLainLainFile: null,
        audioBacksoundSourceType: [],
        audioBacksoundFile: null,
        audioBacksoundLainLainFile: null,
        pendukungLainnyaSourceType: [],
        pendukungVideoFile: null,
        pendukungFotoFile: null,
        pendukungLainLainFile: null,
        keterangan: "",
      }
      updateFormData({
        contentItems: [...formData.contentItems, newItem],
      })
    } else {
      // Remove all items of this type
      updateFormData({
        contentItems: formData.contentItems.filter((item) => item.jenisKonten !== contentType),
      })
    }
  }

  const handleQuantityChange = (contentType: string, quantity: number) => {
    const currentItems = formData.contentItems.filter((item) => item.jenisKonten === contentType)
    const currentQuantity = currentItems.length

    if (quantity > currentQuantity) {
      // Add more items
      const newItems = Array.from({ length: quantity - currentQuantity }, (_, index) => ({
        id: `${contentType}-${Date.now()}-${index}`,
        jenisKonten: contentType,
        nama: "",
        nomorSurat: "",
        tanggalOrderMasuk: null,
        tanggalJadi: null,
        tanggalTayang: null,
        mediaPemerintah: [],
        mediaMassa: [],
        narasiSourceType: [],
        narasiText: "",
        narasiFile: null,
        suratFile: null,
        audioDubbingSourceType: [],
        audioDubbingFile: null,
        audioDubbingLainLainFile: null,
        audioBacksoundSourceType: [],
        audioBacksoundFile: null,
        audioBacksoundLainLainFile: null,
        pendukungLainnyaSourceType: [],
        pendukungVideoFile: null,
        pendukungFotoFile: null,
        pendukungLainLainFile: null,
        keterangan: "",
      }))
      updateFormData({
        contentItems: [...formData.contentItems, ...newItems],
      })
    } else if (quantity < currentQuantity) {
      // Remove excess items
      const itemsToKeep = currentItems.slice(0, quantity)
      const otherItems = formData.contentItems.filter((item) => item.jenisKonten !== contentType)
      updateFormData({
        contentItems: [...otherItems, ...itemsToKeep],
      })
    }
  }

  const totalItems = formData.contentItems.length

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Pilih Jenis Konten</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Pilih jenis konten yang ingin Anda ajukan. Anda dapat memilih lebih dari satu jenis konten dan menentukan
          jumlah untuk setiap jenis.
        </p>
      </motion.div>

      {/* Content Selection Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {contentTypeOptions.map((option, index) => {
          const isSelected = selectedContentTypes.includes(option.id)
          const quantity = contentQuantities[option.id] || 0
          const IconComponent = option.icon

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card
                className={`
                  relative overflow-hidden transition-all duration-300 cursor-pointer group
                  ${
                    isSelected
                      ? `${option.bgColor} ${option.borderColor} border-2 shadow-lg scale-105`
                      : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
                  }
                `}
                onClick={() => handleContentTypeChange(option.id, !isSelected)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div
                      className={`
                      p-3 rounded-xl bg-gradient-to-r ${option.color} 
                      ${isSelected ? "shadow-lg" : "group-hover:shadow-md"} 
                      transition-all duration-300
                    `}
                    >
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleContentTypeChange(option.id, !isSelected)}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      {isSelected && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Dipilih
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardTitle className="text-lg font-semibold text-gray-900">{option.label}</CardTitle>
                  <p className="text-sm text-gray-600 leading-relaxed">{option.description}</p>
                </CardHeader>

                {isSelected && (
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Jumlah Item:</span>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (quantity > 1) {
                                handleQuantityChange(option.id, quantity - 1)
                              }
                            }}
                            disabled={quantity <= 1}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <span className="w-8 text-center font-semibold text-gray-900">{quantity}</span>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleQuantityChange(option.id, quantity + 1)
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        {quantity === 1 ? "1 item akan dibuat" : `${quantity} item akan dibuat`}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Summary Section */}
      {selectedContentTypes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-900">
                <CheckCircle className="h-5 w-5" />
                <span>Ringkasan Pilihan</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Jenis Konten Dipilih:</h4>
                  <div className="space-y-2">
                    {selectedContentTypes.map((typeId) => {
                      const option = contentTypeOptions.find((opt) => opt.id === typeId)
                      const quantity = contentQuantities[typeId] || 0
                      return (
                        <div key={typeId} className="flex items-center justify-between bg-white rounded-lg p-2">
                          <span className="text-sm font-medium text-gray-700">{option?.label}</span>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            {quantity} item
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Total:</h4>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
                      <div className="text-sm text-gray-600">Total Item Konten</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* No Selection Message */}
      {selectedContentTypes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center py-12"
        >
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 max-w-md mx-auto">
            <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-amber-900 mb-2">Belum Ada Konten Dipilih</h3>
            <p className="text-sm text-amber-700">
              Silakan pilih minimal satu jenis konten untuk melanjutkan ke langkah berikutnya.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
