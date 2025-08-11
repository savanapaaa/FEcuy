"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

interface MobileConfirmationDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
  variant?: "default" | "destructive"
}

export function MobileConfirmationDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  onConfirm,
  onCancel,
  variant = "default"
}: MobileConfirmationDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false)

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      await onConfirm()
    } finally {
      setIsConfirming(false)
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-sm w-[95vw] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[99999]"
        style={{ zIndex: 99999 }}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="p-6 text-center space-y-4"
            >
              {/* Icon */}
              <div className={`mx-auto mb-4 p-3 rounded-full w-16 h-16 flex items-center justify-center ${
                variant === "destructive" 
                  ? "bg-red-100" 
                  : "bg-blue-100"
              }`}>
                <AlertTriangle className={`h-8 w-8 ${
                  variant === "destructive" 
                    ? "text-red-600" 
                    : "text-blue-600"
                }`} />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-6">
                {description}
              </p>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isConfirming}
                  className="flex-1 min-h-[44px] text-base font-medium"
                >
                  {cancelText}
                </Button>

                <Button
                  onClick={handleConfirm}
                  disabled={isConfirming}
                  className={`flex-1 min-h-[44px] text-base font-medium ${
                    variant === "destructive"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white`}
                >
                  {isConfirming ? "Memproses..." : confirmText}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
