"use client"

import type React from "react"
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
  Target,
  Globe,
  Film,
  Mic,
  Folder,
  FileAudio,
  FileVideo,
  FileImage,
  PenTool,
  Monitor,
  Tv,
  Instagram,
  Facebook,
  Youtube,
  Flag,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { FormData, FormContentItem } from "@/hooks/useFormHandler"

interface MobileStepThreeProps {
  formData: FormData
  updateContentItem: (index: number, updatedValues: Partial<FormContentItem>) => void
  getContentTypeDisplayName: (jenisKonten: string) => string
  getContentTypeColor: (jenisKonten: string) => string
  getContentTypeIcon: (jenisKonten: string) => string
  handleSourceToggle: (
    contentIndex: number,
    sourceType:
      | "narasiSourceType"
      | "audioDubbingSourceType"
      | "audioBacksoundSourceType"
      | "pendukungLainnyaSourceType",
    value: string,
    checked: boolean,
  ) => void
  MobileFileInput: React.ComponentType<{
    id: string
    label: string
    value: any
    onChange: (newValue: any) => void
    accept?: string
    fileId?: string
    onFileIdChange?: (id: string) => void
  }>
}

// Media Pemerintah options - Updated structure
const mediaPemerintahOptions = [
  {
    category: "Media Elektronik",
    items: [
      { id: "videotron", label: "Videotron", icon: Monitor },
      { id: "televisi", label: "Televisi", icon: Tv },
    ],
  },
  {
    category: "Sosial Media",
    items: [
      { id: "instagram", label: "Instagram", icon: Instagram },
      { id: "facebook", label: "Facebook", icon: Facebook },
      { id: "youtube", label: "YouTube", icon: Youtube },
    ],
  },
  {
    category: "Media Cetak",
    items: [
      { id: "bando", label: "Bando", icon: Flag },
      { id: "banner", label: "Banner", icon: Flag },
    ],
  },
  {
    category: "Digital Online",
    items: [{ id: "website", label: "Website", icon: Globe }],
  },
]

// Media Massa options
const mediaMassaOptions = [
  { id: "media-cetak", label: "Media Cetak", icon: FileText },
  { id: "media-online", label: "Media Online", icon: Globe },
  { id: "televisi-massa", label: "Televisi", icon: Film },
  { id: "radio", label: "Radio", icon: Mic },
]

export const MobileStepThree = ({
  formData,
  updateContentItem,
  getContentTypeDisplayName,
  getContentTypeColor,
  getContentTypeIcon,
  handleSourceToggle,
  MobileFileInput,
}: MobileStepThreeProps) => {
  const handleMediaChange = (
    contentIndex: number,
    mediaType: "mediaPemerintah" | "mediaMassa",
    value: string,
    checked: boolean,
  ) => {
    const currentMedia = (formData.contentItems?.[contentIndex]?.[mediaType] || []) as string[]
    const updatedMedia = checked ? [...currentMedia, value] : currentMedia.filter((item) => item !== value)
    updateContentItem(contentIndex, { [mediaType]: updatedMedia })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
        <CardContent className="p-6 space-y-6">
          <motion.h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>Detail Konten</span>
          </motion.h2>

          <div className="space-y-4">
            {formData.contentItems?.map((item, index) => {
              const contentColor = getContentTypeColor(item.jenisKonten || "")
              const isComplete = item.nama && item.tanggalOrderMasuk && item.tanggalJadi && item.tanggalTayang

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Collapsible>
                    {/* Card Header - Always Visible */}
                    <CollapsibleTrigger asChild>
                      <motion.div
                        className="w-full p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {/* Content Type Icon */}
                            <div
                              className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-r",
                                contentColor,
                              )}
                            >
                              <span className="text-2xl text-white">
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
                              <h3 className="font-bold text-gray-800 text-base">
                                {item.nama || `${getContentTypeDisplayName(item.jenisKonten || "")} ${index + 1}`}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {getContentTypeDisplayName(item.jenisKonten || "")}
                              </p>
                              {/* Progress Indicator */}
                              <div className="flex items-center space-x-2 mt-2">
                                <div
                                  className={cn("w-2 h-2 rounded-full", isComplete ? "bg-green-500" : "bg-yellow-500")}
                                />
                                <span
                                  className={cn(
                                    "text-xs font-medium",
                                    isComplete ? "text-green-600" : "text-yellow-600",
                                  )}
                                >
                                  {isComplete ? "Lengkap" : "Perlu dilengkapi"}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Expand Icon */}
                          <div className="flex items-center space-x-2">
                            {isComplete && (
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              </div>
                            )}
                            <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-data-[state=open]:rotate-180" />
                          </div>
                        </div>
                      </motion.div>
                    </CollapsibleTrigger>

                    {/* Detailed Content - Expandable */}
                    <CollapsibleContent className="mt-4">
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 overflow-hidden"
                      >
                        {/* Header with gradient */}
                        <div className={cn("p-4 bg-gradient-to-r text-white", contentColor)}>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                              <span className="text-lg">
                                {item.jenisKonten === "infografis" && "🎨"}
                                {item.jenisKonten === "naskah-berita" && "📰"}
                                {item.jenisKonten === "audio" && "🎵"}
                                {item.jenisKonten === "video" && "🎬"}
                                {item.jenisKonten === "fotografis" && "📸"}
                                {item.jenisKonten === "bumper" && "🎭"}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg">{getContentTypeDisplayName(item.jenisKonten || "")}</h3>
                              <p className="text-white/80 text-sm">Detail Konten #{index + 1}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 space-y-6">
                          {/* Basic Information Section */}
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FileText className="h-4 w-4 text-blue-600" />
                              </div>
                              <h4 className="font-semibold text-gray-800">Informasi Dasar</h4>
                            </div>
                            {/* Nama Konten */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                Nama Konten <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                value={item.nama || ""}
                                onChange={(e) => updateContentItem(index, { nama: e.target.value })}
                                placeholder="Masukkan nama konten yang menarik"
                                className="bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl"
                              />
                            </div>
                            {/* Nomor Surat - Made optional */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Nomor Surat</Label>
                              <Input
                                value={item.nomorSurat || ""}
                                onChange={(e) => updateContentItem(index, { nomorSurat: e.target.value })}
                                placeholder="Nomor surat (opsional)"
                                className="bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl"
                              />
                            </div>
                          </div>

                          {/* Target Media Section - Updated */}
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Target className="h-4 w-4 text-purple-600" />
                              </div>
                              <h4 className="font-semibold text-gray-800">Target Media</h4>
                            </div>

                            {/* Media Pemerintah - Updated Structure */}
                            <div className="space-y-3">
                              <Label className="text-sm font-medium text-gray-700">Media Pemerintah</Label>
                              <div className="bg-white/50 rounded-lg border border-purple-200 p-4">
                                {mediaPemerintahOptions.map((category) => (
                                  <div key={category.category} className="mb-4 last:mb-0">
                                    <h5 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                                      {category.category}
                                    </h5>
                                    <div className="grid grid-cols-2 gap-3">
                                      {category.items.map((media) => {
                                        const MediaIcon = media.icon
                                        return (
                                          <div key={media.id} className="flex items-center space-x-2">
                                            <Checkbox
                                              id={`media-pemerintah-${index}-${media.id}`}
                                              checked={item.mediaPemerintah?.includes(media.label) || false}
                                              onCheckedChange={(checked) =>
                                                handleMediaChange(
                                                  index,
                                                  "mediaPemerintah",
                                                  media.label,
                                                  checked as boolean,
                                                )
                                              }
                                              className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                            />
                                            <MediaIcon className="h-4 w-4 text-purple-600" />
                                            <Label
                                              htmlFor={`media-pemerintah-${index}-${media.id}`}
                                              className="text-xs text-gray-700 cursor-pointer"
                                            >
                                              {media.label}
                                            </Label>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Media Massa */}
                            <div className="space-y-3">
                              <Label className="text-sm font-medium text-gray-700">Media Massa</Label>
                              <div className="bg-white/50 rounded-lg border border-purple-200 p-4">
                                <div className="grid grid-cols-2 gap-3">
                                  {mediaMassaOptions.map((media) => {
                                    const MediaIcon = media.icon
                                    return (
                                      <div key={media.id} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`media-massa-${index}-${media.id}`}
                                          checked={item.mediaMassa?.includes(media.label) || false}
                                          onCheckedChange={(checked) =>
                                            handleMediaChange(index, "mediaMassa", media.label, checked as boolean)
                                          }
                                          className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                        />
                                        <MediaIcon className="h-4 w-4 text-purple-600" />
                                        <Label
                                          htmlFor={`media-massa-${index}-${media.id}`}
                                          className="text-xs text-gray-700 cursor-pointer"
                                        >
                                          {media.label}
                                        </Label>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Timeline Section */}
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Clock className="h-4 w-4 text-orange-600" />
                              </div>
                              <h4 className="font-semibold text-gray-800">Timeline Produksi</h4>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Tanggal Order Masuk <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  type="date"
                                  value={item.tanggalOrderMasuk ? format(item.tanggalOrderMasuk, "yyyy-MM-dd") : ""}
                                  onChange={(e) =>
                                    updateContentItem(index, { tanggalOrderMasuk: new Date(e.target.value) })
                                  }
                                  className="bg-white border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Tanggal Jadi <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  type="date"
                                  value={item.tanggalJadi ? format(item.tanggalJadi, "yyyy-MM-dd") : ""}
                                  onChange={(e) => updateContentItem(index, { tanggalJadi: new Date(e.target.value) })}
                                  className="bg-white border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 rounded-xl"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Tanggal Tayang <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  type="date"
                                  value={item.tanggalTayang ? format(item.tanggalTayang, "yyyy-MM-dd") : ""}
                                  onChange={(e) =>
                                    updateContentItem(index, { tanggalTayang: new Date(e.target.value) })
                                  }
                                  className="bg-white border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 rounded-xl"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Source/Bahan Section */}
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Folder className="h-4 w-4 text-purple-600" />
                              </div>
                              <h4 className="font-semibold text-gray-800">Source/Bahan</h4>
                            </div>

                            {/* Narasi Source */}
                            <div className="space-y-3 p-4 bg-white/50 rounded-lg border border-purple-200">
                              <Label className="text-sm font-medium text-gray-700 mb-2 block">Source Narasi</Label>
                              <div className="space-y-2">
                                {[
                                  { value: "text", label: "Text Manual", icon: PenTool },
                                  { value: "file", label: "File Upload", icon: FileText },
                                  { value: "surat", label: "Dari Surat", icon: FileText },
                                ].map((option) => {
                                  const OptionIcon = option.icon
                                  return (
                                    <div
                                      key={option.value}
                                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                                    >
                                      <Checkbox
                                        id={`narasi-${index}-${option.value}`}
                                        checked={item.narasiSourceType?.includes(option.value as any) || false}
                                        onCheckedChange={(checked) =>
                                          handleSourceToggle(
                                            index,
                                            "narasiSourceType",
                                            option.value,
                                            checked as boolean,
                                          )
                                        }
                                        className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                      />
                                      <OptionIcon className="h-4 w-4 text-purple-600" />
                                      <Label
                                        htmlFor={`narasi-${index}-${option.value}`}
                                        className="text-sm text-gray-700 cursor-pointer flex-1"
                                      >
                                        {option.label}
                                      </Label>
                                    </div>
                                  )
                                })}
                              </div>
                              {/* Text input for narasi */}
                              {item.narasiSourceType?.includes("text") && (
                                <div className="mt-3">
                                  <Label className="text-sm font-medium text-gray-700">Narasi Text</Label>
                                  <Textarea
                                    value={item.narasiText || ""}
                                    onChange={(e) => updateContentItem(index, { narasiText: e.target.value })}
                                    placeholder="Masukkan narasi text"
                                    className="mt-1 bg-white border-purple-200 focus:border-purple-500 focus:ring-purple-500 min-h-[80px] rounded-xl"
                                  />
                                </div>
                              )}
                              {/* File upload for narasi */}
                              {item.narasiSourceType?.includes("file") && (
                                <div className="mt-3">
                                  <MobileFileInput
                                    id={`narasiFile-${index}`}
                                    label="File Narasi"
                                    value={item.narasiFile || ""}
                                    onChange={(file) => updateContentItem(index, { narasiFile: file })}
                                    accept=".txt,.doc,.docx,.pdf"
                                    fileId={item.narasiFileId}
                                    onFileIdChange={(id) => updateContentItem(index, { narasiFileId: id })}
                                  />
                                </div>
                              )}
                              {/* Surat file upload */}
                              {item.narasiSourceType?.includes("surat") && (
                                <div className="mt-3">
                                  <MobileFileInput
                                    id={`suratFile-${index}`}
                                    label="File Surat"
                                    value={item.suratFile || ""}
                                    onChange={(file) => updateContentItem(index, { suratFile: file })}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    fileId={item.suratFileId}
                                    onFileIdChange={(id) => updateContentItem(index, { suratFileId: id })}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Audio Dubbing Source */}
                            <div className="space-y-3 p-4 bg-white/50 rounded-lg border border-purple-200">
                              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                Source Audio Dubbing
                              </Label>
                              <div className="space-y-2">
                                {[
                                  { value: "file-audio", label: "File Audio", icon: FileAudio },
                                  { value: "lain-lain", label: "Lain-lain", icon: Folder },
                                ].map((option) => {
                                  const OptionIcon = option.icon
                                  return (
                                    <div
                                      key={option.value}
                                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                                    >
                                      <Checkbox
                                        id={`dubbing-${index}-${option.value}`}
                                        checked={item.audioDubbingSourceType?.includes(option.value as any) || false}
                                        onCheckedChange={(checked) =>
                                          handleSourceToggle(
                                            index,
                                            "audioDubbingSourceType",
                                            option.value,
                                            checked as boolean,
                                          )
                                        }
                                        className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                      />
                                      <OptionIcon className="h-4 w-4 text-purple-600" />
                                      <Label
                                        htmlFor={`dubbing-${index}-${option.value}`}
                                        className="text-sm text-gray-700 cursor-pointer flex-1"
                                      >
                                        {option.label}
                                      </Label>
                                    </div>
                                  )
                                })}
                              </div>
                              {/* Audio file upload */}
                              {item.audioDubbingSourceType?.includes("file-audio") && (
                                <div className="mt-3">
                                  <MobileFileInput
                                    id={`audioDubbingFile-${index}`}
                                    label="File Audio Dubbing"
                                    value={item.audioDubbingFile || ""}
                                    onChange={(file) => updateContentItem(index, { audioDubbingFile: file })}
                                    accept=".mp3,.wav,.ogg,.m4a"
                                    fileId={item.audioDubbingFileId}
                                    onFileIdChange={(id) => updateContentItem(index, { audioDubbingFileId: id })}
                                  />
                                </div>
                              )}
                              {/* Lain-lain file upload */}
                              {item.audioDubbingSourceType?.includes("lain-lain") && (
                                <div className="mt-3">
                                  <MobileFileInput
                                    id={`audioDubbingLainLainFile-${index}`}
                                    label="File Lain-lain (Audio Dubbing)"
                                    value={item.audioDubbingLainLainFile || ""}
                                    onChange={(file) => updateContentItem(index, { audioDubbingLainLainFile: file })}
                                    fileId={item.audioDubbingLainLainFileId}
                                    onFileIdChange={(id) =>
                                      updateContentItem(index, { audioDubbingLainLainFileId: id })
                                    }
                                  />
                                </div>
                              )}
                            </div>

                            {/* Audio Backsound Source */}
                            <div className="space-y-3 p-4 bg-white/50 rounded-lg border border-purple-200">
                              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                Source Audio Backsound
                              </Label>
                              <div className="space-y-2">
                                {[
                                  { value: "file-audio", label: "File Audio", icon: FileAudio },
                                  { value: "lain-lain", label: "Lain-lain", icon: Folder },
                                ].map((option) => {
                                  const OptionIcon = option.icon
                                  return (
                                    <div
                                      key={option.value}
                                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                                    >
                                      <Checkbox
                                        id={`backsound-${index}-${option.value}`}
                                        checked={item.audioBacksoundSourceType?.includes(option.value as any) || false}
                                        onCheckedChange={(checked) =>
                                          handleSourceToggle(
                                            index,
                                            "audioBacksoundSourceType",
                                            option.value,
                                            checked as boolean,
                                          )
                                        }
                                        className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                      />
                                      <OptionIcon className="h-4 w-4 text-purple-600" />
                                      <Label
                                        htmlFor={`backsound-${index}-${option.value}`}
                                        className="text-sm text-gray-700 cursor-pointer flex-1"
                                      >
                                        {option.label}
                                      </Label>
                                    </div>
                                  )
                                })}
                              </div>
                              {/* Audio file upload */}
                              {item.audioBacksoundSourceType?.includes("file-audio") && (
                                <div className="mt-3">
                                  <MobileFileInput
                                    id={`audioBacksoundFile-${index}`}
                                    label="File Audio Backsound"
                                    value={item.audioBacksoundFile || ""}
                                    onChange={(file) => updateContentItem(index, { audioBacksoundFile: file })}
                                    accept=".mp3,.wav,.ogg,.m4a"
                                    fileId={item.audioBacksoundFileId}
                                    onFileIdChange={(id) => updateContentItem(index, { audioBacksoundFileId: id })}
                                  />
                                </div>
                              )}
                              {/* Lain-lain file upload */}
                              {item.audioBacksoundSourceType?.includes("lain-lain") && (
                                <div className="mt-3">
                                  <MobileFileInput
                                    id={`audioBacksoundLainLainFile-${index}`}
                                    label="File Lain-lain (Audio Backsound)"
                                    value={item.audioBacksoundLainLainFile || ""}
                                    onChange={(file) => updateContentItem(index, { audioBacksoundLainLainFile: file })}
                                    fileId={item.audioBacksoundLainLainFileId}
                                    onFileIdChange={(id) =>
                                      updateContentItem(index, { audioBacksoundLainLainFileId: id })
                                    }
                                  />
                                </div>
                              )}
                            </div>

                            {/* Pendukung Lainnya Source */}
                            <div className="space-y-3 p-4 bg-white/50 rounded-lg border border-purple-200">
                              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                Source Pendukung Lainnya
                              </Label>
                              <div className="space-y-2">
                                {[
                                  { value: "video", label: "Video", icon: FileVideo },
                                  { value: "foto", label: "Foto", icon: FileImage },
                                  { value: "lain-lain", label: "Lain-lain", icon: Folder },
                                ].map((option) => {
                                  const OptionIcon = option.icon
                                  return (
                                    <div
                                      key={option.value}
                                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                                    >
                                      <Checkbox
                                        id={`pendukung-${index}-${option.value}`}
                                        checked={
                                          item.pendukungLainnyaSourceType?.includes(option.value as any) || false
                                        }
                                        onCheckedChange={(checked) =>
                                          handleSourceToggle(
                                            index,
                                            "pendukungLainnyaSourceType",
                                            option.value,
                                            checked as boolean,
                                          )
                                        }
                                        className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                      />
                                      <OptionIcon className="h-4 w-4 text-purple-600" />
                                      <Label
                                        htmlFor={`pendukung-${index}-${option.value}`}
                                        className="text-sm text-gray-700 cursor-pointer flex-1"
                                      >
                                        {option.label}
                                      </Label>
                                    </div>
                                  )
                                })}
                              </div>
                              {/* Video file upload */}
                              {item.pendukungLainnyaSourceType?.includes("video") && (
                                <div className="mt-3">
                                  <MobileFileInput
                                    id={`pendukungVideoFile-${index}`}
                                    label="File Video Pendukung"
                                    value={item.pendukungVideoFile || ""}
                                    onChange={(file) => updateContentItem(index, { pendukungVideoFile: file })}
                                    accept=".mp4,.avi,.mov,.wmv,.flv"
                                    fileId={item.pendukungVideoFileId}
                                    onFileIdChange={(id) => updateContentItem(index, { pendukungVideoFileId: id })}
                                  />
                                </div>
                              )}
                              {/* Foto file upload */}
                              {item.pendukungLainnyaSourceType?.includes("foto") && (
                                <div className="mt-3">
                                  <MobileFileInput
                                    id={`pendukungFotoFile-${index}`}
                                    label="File Foto Pendukung"
                                    value={item.pendukungFotoFile || ""}
                                    onChange={(file) => updateContentItem(index, { pendukungFotoFile: file })}
                                    accept=".jpg,.jpeg,.png,.gif,.webp"
                                    fileId={item.pendukungFotoFileId}
                                    onFileIdChange={(id) => updateContentItem(index, { pendukungFotoFileId: id })}
                                  />
                                </div>
                              )}
                              {/* Lain-lain file upload */}
                              {item.pendukungLainnyaSourceType?.includes("lain-lain") && (
                                <div className="mt-3">
                                  <MobileFileInput
                                    id={`pendukungLainLainFile-${index}`}
                                    label="File Lain-lain (Pendukung)"
                                    value={item.pendukungLainLainFile || ""}
                                    onChange={(file) => updateContentItem(index, { pendukungLainLainFile: file })}
                                    fileId={item.pendukungLainLainFileId}
                                    onFileIdChange={(id) => updateContentItem(index, { pendukungLainLainFileId: id })}
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Additional Notes Section */}
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                                <FileText className="h-4 w-4 text-gray-600" />
                              </div>
                              <h4 className="font-semibold text-gray-800">Keterangan Tambahan</h4>
                            </div>
                            <Textarea
                              value={item.keterangan || ""}
                              onChange={(e) => updateContentItem(index, { keterangan: e.target.value })}
                              placeholder="Tambahkan keterangan atau catatan khusus untuk konten ini..."
                              className="min-h-[80px] bg-white border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 rounded-xl resize-none"
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
        </CardContent>
      </Card>
    </motion.div>
  )
}
