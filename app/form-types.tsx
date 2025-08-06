// Enhanced file data interface for form storage
export interface FileDataForForm {
  name: string
  size: number
  type: string
  lastModified: number
  base64?: string
  url?: string
  preview?: string
  thumbnailBase64?: string
}

// Union type for file values in forms
export type FileValue = File | FileDataForForm | string | null

export interface FormData {
  tema: string
  judul: string
  petugasPelaksana: string
  supervisor: string
  contentItems: FormContentItem[]
  buktiMengetahui: FileValue
  dokumenPendukung: FileValue[]
  noComtab: string
  pinSandi: string
}

export interface FormContentItem {
  id: string
  jenisKonten: string
  nama: string
  nomorSurat: string
  tanggalOrderMasuk: Date | null
  tanggalJadi: Date | null
  tanggalTayang: Date | null
  mediaPemerintah: string[]
  mediaMassa: string[]
  narasiSourceType: string[]
  narasiText: string
  narasiFile: FileValue
  suratFile: FileValue
  audioDubbingSourceType: string[]
  audioDubbingFile: FileValue
  audioDubbingLainLainFile: FileValue
  audioBacksoundSourceType: string[]
  audioBacksoundFile: FileValue
  audioBacksoundLainLainFile: FileValue
  pendukungLainnyaSourceType: string[]
  pendukungVideoFile: FileValue
  pendukungFotoFile: FileValue
  pendukungLainLainFile: FileValue
  keterangan: string
}
