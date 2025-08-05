"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserIcon, Sparkles, TargetIcon, Briefcase, Users } from "lucide-react"
import type { FormData } from "@/hooks/useFormHandler"

interface StepOneProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  isMobile?: boolean
}

export const StepOne = ({ formData, updateFormData, isMobile = false }: StepOneProps) => {
  // Ensure all values are always strings to prevent controlled/uncontrolled issues
  const safeFormData = {
    tema: formData?.tema || "",
    judul: formData?.judul || "",
    petugasPelaksana: formData?.petugasPelaksana || "",
    supervisor: formData?.supervisor || "",
  }

  const safeUpdateFormData = typeof updateFormData === "function" ? updateFormData : () => {}

  return (
    <motion.div
      className="relative"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        className={`${
          isMobile
            ? "bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-2xl"
            : "bg-white/80 backdrop-blur-xl border-white/30 shadow-2xl relative overflow-hidden"
        }`}
      >
        {/* Card Header Decoration */}
        {!isMobile && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        )}

        <CardContent className={`${isMobile ? "p-6 space-y-6" : "p-4 sm:p-8"}`}>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`${isMobile ? "mb-6" : "mb-6 sm:mb-8"}`}
          >
            <div className={`flex items-center space-x-3 ${isMobile ? "mb-4" : "sm:space-x-4 mb-4 sm:mb-6"}`}>
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div
                  className={`${
                    isMobile ? "w-12 h-12" : "w-12 h-12 sm:w-16 sm:h-16"
                  } bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <UserIcon className={`${isMobile ? "h-6 w-6" : "h-6 w-6 sm:h-8 sm:w-8"} text-white`} />
                </div>
                <motion.div
                  className={`absolute -top-1 -right-1 ${
                    isMobile ? "w-4 h-4" : "w-4 h-4 sm:w-6 sm:h-6"
                  } bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center`}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Sparkles className={`${isMobile ? "h-2 w-2" : "h-2 w-2 sm:h-3 sm:w-3"} text-white`} />
                </motion.div>
              </motion.div>
              <div>
                <h2
                  className={`${
                    isMobile ? "text-lg font-bold" : "text-xl sm:text-3xl font-bold"
                  } bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent`}
                >
                  Informasi Dasar
                </h2>
                <p
                  className={`${
                    isMobile ? "text-sm" : "text-xs sm:text-sm"
                  } text-gray-600 ${isMobile ? "mt-1" : "mt-0.5 sm:mt-1"}`}
                >
                  Lengkapi informasi dasar pengajuan Anda dengan detail yang akurat
                </p>
              </div>
            </div>
          </motion.div>

          <div className={`grid grid-cols-1 ${isMobile ? "gap-4" : "md:grid-cols-2 gap-4 sm:gap-8"}`}>
            {/* Tema Dropdown */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`space-y-2 ${isMobile ? "" : "sm:space-y-3"}`}
            >
              <Label
                htmlFor="tema"
                className={`${
                  isMobile ? "text-sm font-semibold" : "text-xs sm:text-sm font-semibold"
                } text-gray-700 flex items-center`}
              >
                <TargetIcon
                  className={`${isMobile ? "h-4 w-4 mr-2" : "h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2"} text-indigo-500`}
                />
                Tema <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select value={safeFormData.tema} onValueChange={(value) => safeUpdateFormData({ tema: value })}>
                <SelectTrigger
                  className={`${
                    isMobile
                      ? "bg-white/70 backdrop-blur-sm border-gray-200 focus:border-indigo-500 text-sm"
                      : "h-10 sm:h-14 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 hover:shadow-lg transition-all duration-300 rounded-xl text-xs sm:text-sm"
                  }`}
                >
                  <SelectValue placeholder="🎯 Pilih tema pengajuan Anda" />
                </SelectTrigger>

                <SelectContent
                  className={`${isMobile ? "" : "bg-white/95 backdrop-blur-xl border-white/30 shadow-2xl rounded-xl"}`}
                >
                  <SelectItem
                    value="sosial"
                    className={`${
                      isMobile ? "" : "hover:bg-indigo-50 focus:bg-indigo-50 rounded-lg m-1 transition-all duration-200"
                    }`}
                  >
                    <div className={`flex items-center space-x-2 ${isMobile ? "py-2" : "sm:space-x-3 py-1 sm:py-2"}`}>
                      <div
                        className={`${
                          isMobile ? "w-8 h-8" : "w-6 h-6 sm:w-8 sm:h-8"
                        } bg-gradient-to-r from-red-400 to-pink-400 rounded-lg flex items-center justify-center`}
                      >
                        <span className={`text-white ${isMobile ? "text-sm" : "text-xs sm:text-sm"}`}>🏥</span>
                      </div>
                      <div>
                        <div className={`font-medium ${isMobile ? "text-sm" : "text-xs sm:text-sm"}`}>Sosial</div>
                        <div className={`text-xs text-gray-500 ${isMobile ? "block" : "hidden sm:block"}`}>
                          Kesehatan masyarakat, layanan sosial
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="ekonomi"
                    className={`${
                      isMobile ? "" : "hover:bg-indigo-50 focus:bg-indigo-50 rounded-lg m-1 transition-all duration-200"
                    }`}
                  >
                    <div className={`flex items-center space-x-2 ${isMobile ? "py-2" : "sm:space-x-3 py-1 sm:py-2"}`}>
                      <div
                        className={`${
                          isMobile ? "w-8 h-8" : "w-6 h-6 sm:w-8 sm:h-8"
                        } bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg flex items-center justify-center`}
                      >
                        <span className={`text-white ${isMobile ? "text-sm" : "text-xs sm:text-sm"}`}>💰</span>
                      </div>
                      <div>
                        <div className={`font-medium ${isMobile ? "text-sm" : "text-xs sm:text-sm"}`}>
                          Ekonomi & Bisnis
                        </div>
                        <div className={`text-xs text-gray-500 ${isMobile ? "block" : "hidden sm:block"}`}>
                          UMKM, perdagangan, investasi
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="lingkungan"
                    className={`${
                      isMobile ? "" : "hover:bg-indigo-50 focus:bg-indigo-50 rounded-lg m-1 transition-all duration-200"
                    }`}
                  >
                    <div className={`flex items-center space-x-2 ${isMobile ? "py-2" : "sm:space-x-3 py-1 sm:py-2"}`}>
                      <div
                        className={`${
                          isMobile ? "w-8 h-8" : "w-6 h-6 sm:w-8 sm:h-8"
                        } bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center`}
                      >
                        <span className={`text-white ${isMobile ? "text-sm" : "text-xs sm:text-sm"}`}>🌱</span>
                      </div>
                      <div>
                        <div className={`font-medium ${isMobile ? "text-sm" : "text-xs sm:text-sm"}`}>
                          Lingkungan & Alam
                        </div>
                        <div className={`text-xs text-gray-500 ${isMobile ? "block" : "hidden sm:block"}`}>
                          Konservasi, kebersihan, go green
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            {/* Judul */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`space-y-2 ${isMobile ? "" : "sm:space-y-3"}`}
            >
              <Label
                htmlFor="judul"
                className={`${
                  isMobile ? "text-sm font-semibold" : "text-xs sm:text-sm font-semibold"
                } text-gray-700 flex items-center`}
              >
                <Sparkles
                  className={`${isMobile ? "h-4 w-4 mr-2" : "h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2"} text-purple-500`}
                />
                Judul <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="judul"
                value={safeFormData.judul}
                onChange={(e) => safeUpdateFormData({ judul: e.target.value })}
                placeholder="✨ Masukkan judul pengajuan yang menarik"
                className={`${
                  isMobile
                    ? "bg-white/70 backdrop-blur-sm border-gray-200 focus:border-indigo-500 text-sm"
                    : "h-10 sm:h-14 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 hover:shadow-lg transition-all duration-300 rounded-xl text-xs sm:text-sm"
                }`}
              />
            </motion.div>

            {/* Petugas Pelaksana */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`space-y-2 ${isMobile ? "" : "sm:space-y-3"}`}
            >
              <Label
                htmlFor="petugasPelaksana"
                className={`${
                  isMobile ? "text-sm font-semibold" : "text-xs sm:text-sm font-semibold"
                } text-gray-700 flex items-center`}
              >
                <Briefcase
                  className={`${isMobile ? "h-4 w-4 mr-2" : "h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2"} text-emerald-500`}
                />
                Petugas Pelaksana <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="petugasPelaksana"
                value={safeFormData.petugasPelaksana}
                onChange={(e) => safeUpdateFormData({ petugasPelaksana: e.target.value })}
                placeholder="👤 Nama petugas yang bertanggung jawab"
                className={`${
                  isMobile
                    ? "bg-white/70 backdrop-blur-sm border-gray-200 focus:border-indigo-500 text-sm"
                    : "h-10 sm:h-14 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 hover:shadow-lg transition-all duration-300 rounded-xl text-xs sm:text-sm"
                }`}
              />
            </motion.div>

            {/* Supervisor */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`space-y-2 ${isMobile ? "" : "sm:space-y-3"}`}
            >
              <Label
                htmlFor="supervisor"
                className={`${
                  isMobile ? "text-sm font-semibold" : "text-xs sm:text-sm font-semibold"
                } text-gray-700 flex items-center`}
              >
                <Users
                  className={`${isMobile ? "h-4 w-4 mr-2" : "h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2"} text-blue-500`}
                />
                Supervisor <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="supervisor"
                value={safeFormData.supervisor}
                onChange={(e) => safeUpdateFormData({ supervisor: e.target.value })}
                placeholder="👨‍💼 Nama supervisor yang mengawasi"
                className={`${
                  isMobile
                    ? "bg-white/70 backdrop-blur-sm border-gray-200 focus:border-indigo-500 text-sm"
                    : "h-10 sm:h-14 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:shadow-lg transition-all duration-300 rounded-xl text-xs sm:text-sm"
                }`}
              />
            </motion.div>
          </div>

          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`${
              isMobile ? "mt-6 p-4" : "mt-6 sm:mt-8 p-3 sm:p-4"
            } bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100`}
          >
            <div className={`flex items-center justify-between ${isMobile ? "text-sm" : "text-xs sm:text-sm"}`}>
              <div className="flex items-center space-x-2">
                <div
                  className={`${
                    isMobile ? "w-2 h-2" : "w-1.5 h-1.5 sm:w-2 sm:h-2"
                  } bg-indigo-500 rounded-full animate-pulse`}
                />
                <span className="text-indigo-700 font-medium">Langkah 1 dari 4</span>
              </div>
              <span className="text-gray-600">Informasi Dasar</span>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default StepOne
