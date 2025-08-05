"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Crown, FileText, Eye, BarChart3 } from "lucide-react"

interface DiskomInfoSplashScreenProps {
  onComplete?: () => void
}

const DiskomInfoSplashScreenComponent = ({ onComplete }: DiskomInfoSplashScreenProps) => {
  const [currentIcon, setCurrentIcon] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const icons = [
    { icon: Shield, color: "from-blue-500 to-purple-500", label: "Sistem" },
    { icon: Crown, color: "from-purple-500 to-pink-500", label: "Superadmin" },
    { icon: FileText, color: "from-blue-500 to-cyan-500", label: "Form" },
    { icon: Eye, color: "from-green-500 to-emerald-500", label: "Review" },
    { icon: Shield, color: "from-orange-500 to-red-500", label: "Validasi" },
    { icon: BarChart3, color: "from-indigo-500 to-purple-500", label: "Rekap" },
  ]

  useEffect(() => {
    const iconInterval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length)
    }, 300)

    const completeTimer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        if (onComplete) onComplete()
      }, 500)
    }, 2000)

    return () => {
      clearInterval(iconInterval)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center"
        >
          {/* Background Animation */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-300/20 to-purple-300/20 rounded-full blur-3xl"
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-indigo-300/20 to-pink-300/20 rounded-full blur-3xl"
              animate={{
                x: [0, -100, 0],
                y: [0, 50, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </div>

          <div className="relative z-10 text-center">
            {/* Logo Container */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
              className="relative mb-8"
            >
              <div className="w-24 h-24 mx-auto relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIcon}
                    initial={{ scale: 0, rotate: -90, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`w-full h-full bg-gradient-to-r ${icons[currentIcon].color} rounded-2xl flex items-center justify-center shadow-2xl`}
                  >
                    {(() => {
                      const IconComponent = icons[currentIcon].icon
                      return <IconComponent className="h-12 w-12 text-white" />
                    })()}
                  </motion.div>
                </AnimatePresence>

                {/* Pulse Effect */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className={`absolute inset-0 bg-gradient-to-r ${icons[currentIcon].color} rounded-2xl`}
                />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Platform Layanan Publik
              </h1>
              <p className="text-lg text-gray-600 mb-4">Diskominfo Multi-Role System</p>

              {/* Current Role Indicator */}
              <motion.div
                key={currentIcon}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 shadow-lg"
              >
                <div className={`w-3 h-3 bg-gradient-to-r ${icons[currentIcon].color} rounded-full`} />
                <span className="text-sm font-medium text-gray-700">{icons[currentIcon].label}</span>
              </motion.div>
            </motion.div>

            {/* Loading Animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="mt-8"
            >
              <div className="flex justify-center space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.2,
                    }}
                    className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">Memuat sistem...</p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Default export
export default DiskomInfoSplashScreenComponent
