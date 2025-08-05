"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FilePreviewCard } from "@/components/form/file-preview-card"
import { FileDisplayCard } from "@/components/form/file-display-card"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/lib/utils"
import { Check, FileText, Calendar, User, Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react"

export interface ContentViewDialogProps {
  isOpen: boolean
  onClose: () => void
  submission: any
}

export function ContentViewDialog({ isOpen, onClose, submission }: ContentViewDialogProps) {
  const [activeTab, setActiveTab] = useState("info")

  if (!submission) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Menunggu Review</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Disetujui</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Ditolak</Badge>
      case "validated":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Tervalidasi</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "validated":
        return <Check className="h-5 w-5 text-blue-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5" />
            Detail Pengajuan
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="info">Informasi</TabsTrigger>
            <TabsTrigger value="content">Konten</TabsTrigger>
            <TabsTrigger value="history">Riwayat</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 max-h-[60vh] pr-4">
            <TabsContent value="info" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(submission.status)}
                    <span className="font-medium">Status:</span>
                  </div>
                  {getStatusBadge(submission.status)}
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-lg">{submission.judul}</h3>
                  <p className="text-sm text-gray-600">Tema: {submission.tema}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">NO COMTAB</p>
                    <p className="text-sm">{submission.noComtab || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">PIN</p>
                    <p className="text-sm">{"•".repeat(submission.pin?.length || 4)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Petugas Pelaksana</p>
                      <p className="text-sm">{submission.petugasPelaksana}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Supervisor</p>
                      <p className="text-sm">{submission.supervisor}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Tanggal Pengajuan</p>
                    <p className="text-sm">{formatDate(submission.createdAt)}</p>
                  </div>
                </div>

                {submission.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Catatan</p>
                    <p className="text-sm bg-gray-50 p-2 rounded">{submission.notes}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="content" className="mt-0">
              <div className="space-y-6">
                {submission.contentItems?.map((item: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{item.nama || `Konten ${index + 1}`}</h4>
                        <p className="text-sm text-gray-600">{item.contentType}</p>
                      </div>
                      {getStatusBadge(item.status || submission.status)}
                    </div>

                    <Separator />

                    {item.deskripsi && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Deskripsi</p>
                        <p className="text-sm">{item.deskripsi}</p>
                      </div>
                    )}

                    {item.narasi && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Narasi</p>
                        <p className="text-sm">{item.narasi}</p>
                      </div>
                    )}

                    {item.narasiFile && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">File Narasi</p>
                        <FileDisplayCard fileUrl={item.narasiFile} fileName="Narasi" />
                      </div>
                    )}

                    {item.audioDubbing && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Audio Dubbing</p>
                        <FileDisplayCard fileUrl={item.audioDubbing} fileName="Audio Dubbing" />
                      </div>
                    )}

                    {item.audioBacksound && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Audio Backsound</p>
                        <FileDisplayCard fileUrl={item.audioBacksound} fileName="Audio Backsound" />
                      </div>
                    )}

                    {item.pendukungLainnya && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">File Pendukung</p>
                        <FileDisplayCard fileUrl={item.pendukungLainnya} fileName="File Pendukung" />
                      </div>
                    )}

                    {item.hasilProduksi && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Hasil Produksi</p>
                        <FilePreviewCard fileUrl={item.hasilProduksi} fileName="Hasil Produksi" />
                      </div>
                    )}

                    {item.feedback && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm font-medium text-gray-700">Feedback</p>
                        <p className="text-sm">{item.feedback}</p>
                      </div>
                    )}
                  </div>
                ))}

                {(!submission.contentItems || submission.contentItems.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Tidak ada item konten</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <div className="space-y-4">
                {submission.history?.map((event: any, index: number) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4 pb-4 relative">
                    <div className="absolute w-3 h-3 bg-gray-200 rounded-full -left-[7px]"></div>
                    <p className="text-sm font-medium">{event.action}</p>
                    <p className="text-xs text-gray-600">{formatDate(event.timestamp)}</p>
                    {event.notes && <p className="text-sm mt-1">{event.notes}</p>}
                  </div>
                ))}

                {(!submission.history || submission.history.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Tidak ada riwayat perubahan</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
