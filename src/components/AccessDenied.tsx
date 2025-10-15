"use client"

import { Button } from "@/components/ui/button"
import { Shield, Home, ArrowLeft, Heart } from "lucide-react"
import { useRouter } from "next/navigation"

interface AccessDeniedProps {
  title?: string
  message?: string
  showBackButton?: boolean
  showHomeButton?: boolean
  customAction?: {
    label: string
    onClick: () => void
  }
}

export function AccessDenied({ 
  title = "Access Denied",
  message = "You do not have permission to view this couple's dashboard.",
  showBackButton = true,
  showHomeButton = true,
  customAction
}: AccessDeniedProps) {
  const router = useRouter()

  return (
    <div className="fixed inset-0 z-50 min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-rose-100 p-8 text-center">
          {/* Icon */}
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="h-10 w-10 text-red-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {title}
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {message}
          </p>

          {/* Decorative Hearts */}
          <div className="flex justify-center space-x-2 mb-8">
            <Heart className="h-4 w-4 text-pink-300" />
            <Heart className="h-5 w-5 text-pink-400" />
            <Heart className="h-4 w-4 text-pink-300" />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {customAction ? (
              <Button 
                onClick={customAction.onClick}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                {customAction.label}
              </Button>
            ) : (
              <>
                {showHomeButton && (
                  <Button 
                    onClick={() => router.push('/')}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Return Home
                  </Button>
                )}
                
                {showBackButton && (
                  <Button 
                    onClick={() => router.back()}
                    variant="outline"
                    className="w-full border-2 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl py-3 font-semibold transition-all duration-200 hover:scale-105"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100 p-6 w-full">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Need Help?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            If you believe you should have access to this couple's dashboard, please check:
          </p>
          <ul className="text-sm text-gray-600 space-y-2 text-left">
            <li className="flex items-start">
              <span className="text-pink-500 mr-2">•</span>
              Make sure you're signed in with the correct account
            </li>
            <li className="flex items-start">
              <span className="text-pink-500 mr-2">•</span>
              Verify you have the correct couple invitation link
            </li>
            <li className="flex items-start">
              <span className="text-pink-500 mr-2">•</span>
              Contact your partner to resend the invitation
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
