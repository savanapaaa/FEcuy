"use client"

import { motion } from "framer-motion"
import { ChevronLeft, Crown, Sparkles } from "lucide-react"

interface MobileFormHeaderProps {
  isEditMode: boolean
  onBackToHome: () => void
}

export const MobileFormHeader = ({ isEditMode, onBackToHome }: MobileFormHeaderProps) => {
  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-lg"
    >
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Back Button */}
            <motion.button
              onClick={onBackToHome}
              className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Kembali ke beranda"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </motion.button>

            <motion.div
              className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Crown className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                {isEditMode ? "Edit Pengajuan" : "Form Pengajuan"}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm text-gray-600 flex items-center"
              >
                <Sparkles className="h-3 w-3 mr-1 text-purple-500" />
                Pelayanan Publik Mobile
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
