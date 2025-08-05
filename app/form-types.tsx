export interface FormData {
  tema: string
  judul: string
  petugasPelaksana: string
  supervisor: string
  contentItems: FormContentItem[]
  buktiMengetahui: File | string | null
  dokumenPendukung: File[]
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
  narasiFile: File | null
  suratFile: File | null
  audioDubbingSourceType: string[]
  audioDubbingFile: File | null
  audioDubbingLainLainFile: File | null
  audioBacksoundSourceType: string[]
  audioBacksoundFile: File | null
  audioBacksoundLainLainFile: File | null
  pendukungLainnyaSourceType: string[]
  pendukungVideoFile: File | null
  pendukungFotoFile: File | null
  pendukungLainLainFile: File | null
  keterangan: string
}
