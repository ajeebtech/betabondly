"use client"

import { Button } from "@/components/ui/button"
import { Trash2, AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
}

export function DeleteConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = "Delete Post",
  message = "Are you sure you want to delete this post? This action cannot be undone."
}: DeleteConfirmDialogProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Small delay to ensure DOM is ready
      setTimeout(() => setIsAnimating(true), 10)
    } else {
      setIsAnimating(false)
      // Wait for animation to complete before hiding
      setTimeout(() => setIsVisible(false), 200)
    }
  }, [isOpen])

  const handleConfirm = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onConfirm()
      onClose()
    }, 150)
  }

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onClose()
    }, 200)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Dialog */}
      <div className={`relative bg-white rounded-2xl shadow-2xl border border-red-100 max-w-md w-full p-6 transition-all duration-300 ease-out transform ${
        isAnimating 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 translate-y-4'
      }`}>
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center transition-all duration-500 ease-out transform ${
            isAnimating ? 'scale-100 rotate-0' : 'scale-75 rotate-12'
          }`}>
            <AlertTriangle className={`h-8 w-8 text-red-500 transition-all duration-500 ease-out ${
              isAnimating ? 'scale-100' : 'scale-75'
            }`} />
          </div>
        </div>

        {/* Content */}
        <div className={`text-center mb-6 transition-all duration-500 ease-out delay-100 ${
          isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className={`flex space-x-3 transition-all duration-500 ease-out delay-200 ${
          isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}>
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200 ease-out hover:scale-105 hover:shadow-md"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-200 ease-out hover:scale-105 hover:shadow-lg"
          >
            <Trash2 className="h-4 w-4 mr-2 transition-transform duration-200 ease-out group-hover:rotate-12" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
