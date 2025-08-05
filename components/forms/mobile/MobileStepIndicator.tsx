"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"

interface MobileStepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export const MobileStepIndicator = ({ currentStep, totalSteps }: MobileStepIndicatorProps) => {
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <motion.div
              key={i}
              className={`h-2 rounded-full transition-all duration-500 relative overflow-hidden ${
                i + 1 <= currentStep ? "bg-gradient-to-r from-blue-500 to-purple-500 w-12" : "bg-gray-200 w-8"
              }`}
              initial={{ width: 32 }}
              animate={{ width: i + 1 <= currentStep ? 48 : 32 }}
            >
              {i + 1 <= currentStep && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                />
              )}
            </motion.div>
          ))}
        </div>
        <motion.div
          className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        >
          <Star className="h-3 w-3 text-blue-600" />
          <span className="text-sm font-bold text-blue-800">
            {currentStep}/{totalSteps}
          </span>
        </motion.div>
      </div>
    </motion.div>
  )
}
