"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  CheckCircle2,
  ChevronDown,
  FileText,
  Clock,
  Layers,
  Sparkles,
  Tv,
  Smartphone,
  Newspaper,
  Globe,
  Radio,
  Upload,
  AudioWaveform,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import FileOrLinkInput from "@/components/form/file-or-link-input"
import type { FormData, FormContentItem } from "@/hooks/useFormHandler"

interface StepThreeProps {
  formData: FormData
  updateContentItem: (index: number, updatedValues: Partial<FormContentItem>) => void
}

const getContentTypeDisplayName = (jenisKonten: string) => {
  const nameMap: Record<string, string> = {
    infografis: "Infografis",
    "naskah-berita": "Naskah Berita",
    audio: "Audio",
    video: "Video",
    fotografis: "Fotografis",
    bumper: "Bumper",
  }
  return nameMap[jenisKonten] || jenisKonten
}

const getContentTypeColor = (jenisKonten: string) => {
  const colorMap: Record<string, string> = {
    infografis: "from-blue-500 to-cyan-500",
    "naskah-berita": "from-green-500 to-emerald-500",
    audio: "from-purple-500 to-pink-500",
    video: "from-red-500 to-orange-500",
    fotografis: "from-yellow-500 to-amber-500",
    bumper: "from-indigo-500 to-purple-500",
  }
  return colorMap[jenisKonten] || "from-gray-500 to-gray-600"
}

// Media Pemerintah Categories
const mediaPemerintahCategories = [
  {
    id: "elektronik",
    label: "Media Elektronik",
    icon: Tv,
    channels: [
      { id: "videotron", label: "Videotron" },
      { id: "televisi", label: "Televisi" },
    ],
  },
  {
    id: "sosial-media",
    label: "Sosial Media",
    icon: Smartphone,
    channels: [
      { id: "instagram", label: "Instagram" },
      { id: "facebook", label: "Facebook" },
      { id: "youtube", label: "YouTube" },
    ],
  },
  {
    id: "cetak",
    label: "Media Cetak",
    icon: Newspaper,
    channels: [
      { id: "bando", label: "Bando" },
      { id: "banner", label: "Banner" },
    ],
  },
  {
    id: "digital-online",
    label: "Digital Online",
    icon: Globe,
    channels: [{ id: "website", label: "Website" }],
  },
]

// Media Massa Channels
const mediaMassaChannels = [
  { id: "media-cetak", label: "Media Cetak", icon: Newspaper },
  { id: "media-online", label: "Media Online", icon: Globe },
  { id: "televisi", label: "Televisi", icon: Tv },
  { id: "radio", label: "Radio", icon: Radio },
]

export default function StepThree({ formData, updateContentItem }: StepThreeProps) {
  const [openMediaCategories, setOpenMediaCategories] = useState<Record<string, boolean>>({})

  const toggleMediaCategory = (itemId: string, categoryId: string) => {
    const key = `${itemId}-${categoryId}`
    setOpenMediaCategories((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleMediaPemerintahChange = (index: number, categoryId: string, channelId: string, checked: boolean) => {
    const currentMedia = formData.contentItems[index].mediaPemerintah || []
    const updatedMedia = checked ? [...currentMedia, channelId] : currentMedia.filter((id) => id !== channelId)
    updateContentItem(index, { mediaPemerintah: updatedMedia })
  }

  const handleMediaMassaChange = (index: number, channelId: string, checked: boolean) => {
    const currentMedia = formData.contentItems[index].mediaMassa || []
    const updatedMedia = checked ? [...currentMedia, channelId] : currentMedia.filter((id) => id !== channelId)
    updateContentItem(index, { mediaMassa: updatedMedia })
  }

  return (
    <motion.div
      className="relative min-h-screen"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <CardContent className="p-8">
            <div className="flex items-center space-x-4 mb-6">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Layers className="h-8 w-8 text-white" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Sparkles className="h-3 w-3 text-white" />
                </motion.div>
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Detail Konten
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Lengkapi informasi detail untuk setiap konten yang akan diproduksi
                </p>
              </div>
            </div>
            {/* Progress Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                  <span className="text-indigo-700 font-medium">Langkah 3 dari 4</span>
                </div>
                <span className="text-gray-600">Detail Konten</span>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="space-y-8">
        {formData.contentItems.map((item, index) => {
          const contentColor = getContentTypeColor(item.jenisKonten)
          const isComplete = item.nama && item.tanggalOrderMasuk && item.tanggalJadi && item.tanggalTayang

          return (
            <motion.div
              key={item.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              <Collapsible defaultOpen={true}>
                {/* Card Header - Always Visible */}
                <CollapsibleTrigger asChild>
                  <motion.div
                    className="w-full p-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Content Type Icon */}
                        <div
                          className={cn(
                            "w-16 h-16 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r",
                            contentColor,
                          )}
                        >
                          <span className="text-3xl text-white">
                            {item.jenisKonten === "infografis" && "🎨"}
                            {item.jenisKonten === "naskah-berita" && "📰"}
                            {item.jenisKonten === "audio" && "🎵"}
                            {item.jenisKonten === "video" && "🎬"}
                            {item.jenisKonten === "fotografis" && "📸"}
                            {item.jenisKonten === "bumper" && "🎭"}
                          </span>
                        </div>
                        {/* Content Info */}
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 text-xl">
                            {item.nama || `${getContentTypeDisplayName(item.jenisKonten)} ${index + 1}`}
                          </h3>
                          <p className="text-gray-500">{getContentTypeDisplayName(item.jenisKonten)}</p>
                          {/* Progress Indicator */}
                          <div className="flex items-center space-x-2 mt-2">
                            <div
                              className={cn("w-3 h-3 rounded-full", isComplete ? "bg-green-500" : "bg-yellow-500")}
                            />
                            <span
                              className={cn("text-sm font-medium", isComplete ? "text-green-600" : "text-yellow-600")}
                            >
                              {isComplete ? "Lengkap" : "Perlu dilengkapi"}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Expand Icon */}
                      <div className="flex items-center space-x-2">
                        {isComplete && (
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          </div>
                        )}
                        <ChevronDown className="h-6 w-6 text-gray-400 transition-transform group-data-[state=open]:rotate-180" />
                      </div>
                    </div>
                  </motion.div>
                </CollapsibleTrigger>

                {/* Detailed Content - Expandable */}
                <CollapsibleContent className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 overflow-hidden"
                  >
                    {/* Header with gradient */}
                    <div className={cn("p-6 bg-gradient-to-r text-white", contentColor)}>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <span className="text-2xl">
                            {item.jenisKonten === "infografis" && "🎨"}
                            {item.jenisKonten === "naskah-berita" && "📰"}
                            {item.jenisKonten === "audio" && "🎵"}
                            {item.jenisKonten === "video" && "🎬"}
                            {item.jenisKonten === "fotografis" && "📸"}
                            {item.jenisKonten === "bumper" && "🎭"}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-xl">{getContentTypeDisplayName(item.jenisKonten)}</h3>
                          <p className="text-white/80">Detail Konten #{index + 1}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 space-y-8">
                      {/* Basic Information Section */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <h4 className="font-semibold text-gray-800 text-lg">Informasi Dasar</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Nama Konten */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">
                              Nama Konten <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              value={item.nama}
                              onChange={(e) => updateContentItem(index, { nama: e.target.value })}
                              placeholder="Masukkan nama konten yang menarik"
                              className="h-12 bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl"
                            />
                          </div>
                          {/* Nomor Surat - Made optional */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">Nomor Surat</Label>
                            <Input
                              value={item.nomorSurat}
                              onChange={(e) => updateContentItem(index, { nomorSurat: e.target.value })}
                              placeholder="Nomor surat (opsional)"
                              className="h-12 bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Media Selection Section */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Radio className="h-5 w-5 text-purple-600" />
                          </div>
                          <h4 className="font-semibold text-gray-800 text-lg">Pemilihan Media</h4>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Media Pemerintah */}
                          <div className="space-y-4">
                            <Label className="text-sm font-semibold text-gray-700 flex items-center">
                              <Globe className="h-4 w-4 mr-2 text-blue-600" />
                              Media Pemerintah
                            </Label>
                            <div className="space-y-3">
                              {mediaPemerintahCategories.map((category) => (
                                <Collapsible
                                  key={category.id}
                                  open={openMediaCategories[`${item.id}-pemerintah-${category.id}`]}
                                  onOpenChange={() => toggleMediaCategory(item.id, `pemerintah-${category.id}`)}
                                >
                                  <CollapsibleTrigger asChild>
                                    <div className="w-full justify-between h-12 bg-white/70 backdrop-blur-sm border-2 border-gray-200 hover:bg-blue-50 hover:border-blue-300 rounded-xl transition-all duration-300 text-sm cursor-pointer p-3 flex items-center">
                                      <div className="flex items-center space-x-2">
                                        <category.icon className="h-4 w-4 text-blue-600" />
                                        <span>{category.label}</span>
                                      </div>
                                      <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                                    </div>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="mt-3">
                                    <div className="space-y-2 pl-4">
                                      {category.channels?.map((channel) => (
                                        <label
                                          key={channel.id}
                                          className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                                        >
                                          <Checkbox
                                            checked={
                                              Array.isArray(item.mediaPemerintah) &&
                                              item.mediaPemerintah.includes(channel.id)
                                            }
                                            onCheckedChange={(checked) =>
                                              handleMediaPemerintahChange(
                                                index,
                                                category.id,
                                                channel.id,
                                                checked as boolean,
                                              )
                                            }
                                          />
                                          <span className="text-sm text-gray-700 font-medium">{channel.label}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              ))}
                            </div>
                          </div>

                          {/* Media Massa */}
                          <div className="space-y-4">
                            <Label className="text-sm font-semibold text-gray-700 flex items-center">
                              <Newspaper className="h-4 w-4 mr-2 text-green-600" />
                              Media Massa
                            </Label>
                            <div className="space-y-2">
                              {mediaMassaChannels.map((channel) => (
                                <label
                                  key={channel.id}
                                  className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-green-50 transition-all duration-200 cursor-pointer"
                                >
                                  <Checkbox
                                    checked={Array.isArray(item.mediaMassa) && item.mediaMassa.includes(channel.id)}
                                    onCheckedChange={(checked) =>
                                      handleMediaMassaChange(index, channel.id, checked as boolean)
                                    }
                                  />
                                  <div className="flex items-center space-x-2">
                                    <channel.icon className="h-4 w-4 text-green-600" />
                                    <span className="text-sm text-gray-700 font-medium">{channel.label}</span>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Section */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Clock className="h-5 w-5 text-orange-600" />
                          </div>
                          <h4 className="font-semibold text-gray-800 text-lg">Timeline Produksi</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">
                              Tanggal Order Masuk <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              type="date"
                              value={item.tanggalOrderMasuk ? format(item.tanggalOrderMasuk, "yyyy-MM-dd") : ""}
                              onChange={(e) =>
                                updateContentItem(index, { tanggalOrderMasuk: new Date(e.target.value) })
                              }
                              className="h-12 bg-white border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">
                              Tanggal Jadi <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              type="date"
                              value={item.tanggalJadi ? format(item.tanggalJadi, "yyyy-MM-dd") : ""}
                              onChange={(e) => updateContentItem(index, { tanggalJadi: new Date(e.target.value) })}
                              className="h-12 bg-white border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 rounded-xl"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">
                              Tanggal Tayang <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              type="date"
                              value={item.tanggalTayang ? format(item.tanggalTayang, "yyyy-MM-dd") : ""}
                              onChange={(e) => updateContentItem(index, { tanggalTayang: new Date(e.target.value) })}
                              className="h-12 bg-white border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 rounded-xl"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Source/Bahan Section */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Upload className="h-5 w-5 text-orange-600" />
                          </div>
                          <h4 className="font-semibold text-gray-800 text-lg">Source/Bahan</h4>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Narasi Section */}
                          <div className="space-y-4">
                            <h5 className="font-semibold text-gray-800 text-base flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-blue-600" />
                              Narasi
                            </h5>
                            {/* Narasi Source Type Selection */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Sumber Narasi:</Label>
                              <div className="flex flex-wrap gap-2">
                                {["text", "file", "surat"].map((type) => (
                                  <label
                                    key={type}
                                    className="flex items-center space-x-2 p-2 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-blue-50 transition-all duration-200 cursor-pointer text-sm"
                                  >
                                    <Checkbox
                                      checked={
                                        Array.isArray(item.narasiSourceType) &&
                                        item.narasiSourceType.includes(type as any)
                                      }
                                      onCheckedChange={(checked) => {
                                        const currentTypes = Array.isArray(item.narasiSourceType)
                                          ? item.narasiSourceType
                                          : []
                                        const newSourceType = checked
                                          ? [...currentTypes, type as any]
                                          : currentTypes.filter((t) => t !== type)
                                        updateContentItem(index, { narasiSourceType: newSourceType })
                                      }}
                                    />
                                    <span className="font-medium">
                                      {type === "text" ? "Teks" : type === "file" ? "File" : "Surat"}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                            {/* Conditional Narasi Inputs */}
                            {Array.isArray(item.narasiSourceType) && item.narasiSourceType.includes("text") && (
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Teks Narasi:</Label>
                                <Textarea
                                  value={item.narasiText || ""}
                                  onChange={(e) => updateContentItem(index, { narasiText: e.target.value })}
                                  placeholder="Masukkan teks narasi di sini..."
                                  className="min-h-[100px] bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl text-sm"
                                />
                              </div>
                            )}
                            {Array.isArray(item.narasiSourceType) && item.narasiSourceType.includes("file") && (
                              <FileOrLinkInput
                                value={item.narasiFile}
                                onChange={(newValue) => updateContentItem(index, { narasiFile: newValue })}
                                accept=".pdf,.doc,.docx,.txt"
                                placeholder="Upload file narasi atau masukkan link"
                                label="File Narasi:"
                              />
                            )}
                            {Array.isArray(item.narasiSourceType) && item.narasiSourceType.includes("surat") && (
                              <FileOrLinkInput
                                value={item.suratFile}
                                onChange={(newValue) => updateContentItem(index, { suratFile: newValue })}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                placeholder="Upload file surat atau masukkan link"
                                label="File Surat:"
                              />
                            )}
                          </div>

                          {/* Audio Section */}
                          <div className="space-y-4">
                            <h5 className="font-semibold text-gray-800 text-base flex items-center">
                              <AudioWaveform className="h-4 w-4 mr-2 text-purple-600" />
                              Audio
                            </h5>
                            {/* Audio Dubbing */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Audio Dubbing:</Label>
                              <div className="flex flex-wrap gap-2">
                                {["file-audio", "lain-lain"].map((type) => (
                                  <label
                                    key={type}
                                    className="flex items-center space-x-2 p-2 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-purple-50 transition-all duration-200 cursor-pointer text-sm"
                                  >
                                    <Checkbox
                                      checked={
                                        Array.isArray(item.audioDubbingSourceType) &&
                                        item.audioDubbingSourceType.includes(type as any)
                                      }
                                      onCheckedChange={(checked) => {
                                        const currentTypes = Array.isArray(item.audioDubbingSourceType)
                                          ? item.audioDubbingSourceType
                                          : []
                                        const newSourceType = checked
                                          ? [...currentTypes, type as any]
                                          : currentTypes.filter((t) => t !== type)
                                        updateContentItem(index, { audioDubbingSourceType: newSourceType })
                                      }}
                                    />
                                    <span className="font-medium">
                                      {type === "file-audio" ? "File Audio" : "Lain-lain"}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                            {Array.isArray(item.audioDubbingSourceType) &&
                              item.audioDubbingSourceType.includes("file-audio") && (
                                <FileOrLinkInput
                                  value={item.audioDubbingFile}
                                  onChange={(newValue) => updateContentItem(index, { audioDubbingFile: newValue })}
                                  accept=".mp3,.wav,.m4a,.aac"
                                  placeholder="Upload file audio dubbing atau masukkan link"
                                  label="File Audio Dubbing:"
                                />
                              )}
                            {Array.isArray(item.audioDubbingSourceType) &&
                              item.audioDubbingSourceType.includes("lain-lain") && (
                                <FileOrLinkInput
                                  value={item.audioDubbingLainLainFile}
                                  onChange={(newValue) =>
                                    updateContentItem(index, { audioDubbingLainLainFile: newValue })
                                  }
                                  accept="*"
                                  placeholder="Upload file audio dubbing lain-lain atau masukkan link"
                                  label="File Audio Dubbing Lain-lain:"
                                />
                              )}

                            {/* Audio Backsound */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Audio Backsound:</Label>
                              <div className="flex flex-wrap gap-2">
                                {["file-audio", "lain-lain"].map((type) => (
                                  <label
                                    key={type}
                                    className="flex items-center space-x-2 p-2 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-purple-50 transition-all duration-200 cursor-pointer text-sm"
                                  >
                                    <Checkbox
                                      checked={
                                        Array.isArray(item.audioBacksoundSourceType) &&
                                        item.audioBacksoundSourceType.includes(type as any)
                                      }
                                      onCheckedChange={(checked) => {
                                        const currentTypes = Array.isArray(item.audioBacksoundSourceType)
                                          ? item.audioBacksoundSourceType
                                          : []
                                        const newSourceType = checked
                                          ? [...currentTypes, type as any]
                                          : currentTypes.filter((t) => t !== type)
                                        updateContentItem(index, { audioBacksoundSourceType: newSourceType })
                                      }}
                                    />
                                    <span className="font-medium">
                                      {type === "file-audio" ? "File Audio" : "Lain-lain"}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                            {Array.isArray(item.audioBacksoundSourceType) &&
                              item.audioBacksoundSourceType.includes("file-audio") && (
                                <FileOrLinkInput
                                  value={item.audioBacksoundFile}
                                  onChange={(newValue) => updateContentItem(index, { audioBacksoundFile: newValue })}
                                  accept=".mp3,.wav,.m4a,.aac"
                                  placeholder="Upload file audio backsound atau masukkan link"
                                  label="File Audio Backsound:"
                                />
                              )}
                            {Array.isArray(item.audioBacksoundSourceType) &&
                              item.audioBacksoundSourceType.includes("lain-lain") && (
                                <FileOrLinkInput
                                  value={item.audioBacksoundLainLainFile}
                                  onChange={(newValue) =>
                                    updateContentItem(index, { audioBacksoundLainLainFile: newValue })
                                  }
                                  accept="*"
                                  placeholder="Upload file audio backsound lain-lain atau masukkan link"
                                  label="File Audio Backsound Lain-lain:"
                                />
                              )}
                          </div>
                        </div>

                        {/* Pendukung Lainnya Section */}
                        <div className="mt-6 space-y-4">
                          <h5 className="font-semibold text-gray-800 text-base flex items-center">
                            <Layers className="h-4 w-4 mr-2 text-green-600" />
                            Pendukung Lainnya
                          </h5>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Jenis Pendukung:</Label>
                            <div className="flex flex-wrap gap-2">
                              {["video", "foto", "lain-lain"].map((type) => (
                                <label
                                  key={type}
                                  className="flex items-center space-x-2 p-2 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-green-50 transition-all duration-200 cursor-pointer text-sm"
                                >
                                  <Checkbox
                                    checked={
                                      Array.isArray(item.pendukungLainnyaSourceType) &&
                                      item.pendukungLainnyaSourceType.includes(type as any)
                                    }
                                    onCheckedChange={(checked) => {
                                      const currentTypes = Array.isArray(item.pendukungLainnyaSourceType)
                                        ? item.pendukungLainnyaSourceType
                                        : []
                                      const newSourceType = checked
                                        ? [...currentTypes, type as any]
                                        : currentTypes.filter((t) => t !== type)
                                      updateContentItem(index, { pendukungLainnyaSourceType: newSourceType })
                                    }}
                                  />
                                  <span className="font-medium">
                                    {type === "video" ? "Video" : type === "foto" ? "Foto" : "Lain-lain"}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {Array.isArray(item.pendukungLainnyaSourceType) &&
                              item.pendukungLainnyaSourceType.includes("video") && (
                                <FileOrLinkInput
                                  value={item.pendukungVideoFile}
                                  onChange={(newValue) => updateContentItem(index, { pendukungVideoFile: newValue })}
                                  accept=".mp4,.avi,.mov,.wmv"
                                  placeholder="Upload file video pendukung atau masukkan link"
                                  label="File Video Pendukung:"
                                />
                              )}
                            {Array.isArray(item.pendukungLainnyaSourceType) &&
                              item.pendukungLainnyaSourceType.includes("foto") && (
                                <FileOrLinkInput
                                  value={item.pendukungFotoFile}
                                  onChange={(newValue) => updateContentItem(index, { pendukungFotoFile: newValue })}
                                  accept=".jpg,.jpeg,.png,.gif"
                                  placeholder="Upload file foto pendukung atau masukkan link"
                                  label="File Foto Pendukung:"
                                />
                              )}
                            {Array.isArray(item.pendukungLainnyaSourceType) &&
                              item.pendukungLainnyaSourceType.includes("lain-lain") && (
                                <FileOrLinkInput
                                  value={item.pendukungLainLainFile}
                                  onChange={(newValue) => updateContentItem(index, { pendukungLainLainFile: newValue })}
                                  accept="*"
                                  placeholder="Upload file pendukung lain-lain atau masukkan link"
                                  label="File Pendukung Lain-lain:"
                                />
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Additional Notes Section */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-gray-600" />
                          </div>
                          <h4 className="font-semibold text-gray-800 text-lg">Keterangan Tambahan</h4>
                        </div>
                        <Textarea
                          value={item.keterangan}
                          onChange={(e) => updateContentItem(index, { keterangan: e.target.value })}
                          placeholder="Masukkan keterangan atau catatan tambahan untuk konten ini..."
                          className="min-h-[120px] bg-white border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 rounded-xl resize-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          )
        })}
      </div>

      {/* Summary Notice */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6"
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <CheckCircle2 className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-blue-900 mb-2">Informasi Penting</h3>
            <p className="text-blue-800 leading-relaxed">
              Pastikan semua informasi yang Anda masukkan sudah benar dan lengkap. Data yang telah diisi akan
              ditampilkan pada langkah berikutnya untuk review final sebelum pengiriman.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
