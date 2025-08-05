"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Briefcase, Target } from "lucide-react"
import type { FormData } from "@/hooks/useFormHandler"

interface MobileStepOneProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}

export const MobileStepOne = ({ formData, updateFormData }: MobileStepOneProps) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
        <CardContent className="p-6 space-y-6">
          <motion.h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-500" />
            <span>Informasi Dasar</span>
          </motion.h2>

          <div className="space-y-4">
            {/* Tema Selection */}
            <div className="space-y-2">
              <Label htmlFor="tema" className="text-sm font-semibold text-gray-800 flex items-center">
                <Target className="h-4 w-4 mr-2 text-red-500" />
                Tema
              </Label>
              <Select value={formData?.tema || ""} onValueChange={(value) => updateFormData({ tema: value })}>
                <SelectTrigger className="bg-white/70 backdrop-blur-sm border-gray-200 focus:border-indigo-500 text-sm">
                  <SelectValue placeholder="Pilih tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sosial">
                    <div className="flex items-center space-x-3 py-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">🏥</span>
                      </div>
                      <div>
                        <p className="font-semibold">Sosial & Kesehatan</p>
                        <p className="text-xs text-gray-500">Kesehatan, pendidikan, sosial</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="ekonomi">
                    <div className="flex items-center space-x-3 py-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">💰</span>
                      </div>
                      <div>
                        <p className="font-semibold">Ekonomi & Bisnis</p>
                        <p className="text-xs text-gray-500">UMKM, perdagangan, investasi</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="lingkungan">
                    <div className="flex items-center space-x-3 py-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">🌱</span>
                      </div>
                      <div>
                        <p className="font-semibold">Lingkungan & Alam</p>
                        <p className="text-xs text-gray-500">Konservasi, kebersihan, hijau</p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Judul */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                ✨ Judul <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData?.judul || ""}
                onChange={(e) => updateFormData({ judul: e.target.value })}
                placeholder="Masukkan judul proyek yang menarik"
                className="bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl"
              />
            </div>

            {/* Petugas Pelaksana */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <User className="h-4 w-4 text-green-500" />
                <span>
                  Petugas Pelaksana <span className="text-red-500">*</span>
                </span>
              </Label>
              <Input
                value={formData?.petugasPelaksana || ""}
                onChange={(e) => updateFormData({ petugasPelaksana: e.target.value })}
                placeholder="Nama petugas yang bertanggung jawab"
                className="bg-white border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 rounded-xl"
              />
            </div>

            {/* Supervisor */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-purple-500" />
                <span>
                  Supervisor <span className="text-red-500">*</span>
                </span>
              </Label>
              <Input
                value={formData?.supervisor || ""}
                onChange={(e) => updateFormData({ supervisor: e.target.value })}
                placeholder="Nama supervisor proyek"
                className="bg-white border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 rounded-xl"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
