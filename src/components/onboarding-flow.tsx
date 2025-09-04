"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Phone, User, UserCircle, ArrowRight, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { PhoneInput } from "@/components/ui/phone-input"

type Step = "name" | "phone" | "verify" | "profile"

interface OnboardingData {
  name: string
  phone: string
  verificationCode: string
  email: string
  bio: string
}

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<Step>("name")
  const [data, setData] = useState<OnboardingData>({
    name: "",
    phone: "",
    verificationCode: "",
    email: "",
    bio: "",
  })
  const [errors, setErrors] = useState<Partial<OnboardingData>>({})
  const [isCodeSent, setIsCodeSent] = useState(false)

  const steps: { key: Step; title: string; description: string; icon: any }[] = [
    { key: "name", title: "Your Name", description: "Tell us what to call you", icon: User },
    { key: "phone", title: "Phone Number", description: "We'll send you a verification code", icon: Phone },
    { key: "verify", title: "Verify Phone", description: "Enter the code we sent you", icon: CheckCircle },
    { key: "profile", title: "Complete Profile", description: "Add some final details", icon: UserCircle },
  ]

  const currentStepIndex = steps.findIndex((step) => step.key === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const validateStep = (step: Step): boolean => {
    const newErrors: Partial<OnboardingData> = {}

    switch (step) {
      case "name":
        if (!data.name.trim()) newErrors.name = "Name is required"
        break
      case "phone":
        if (!data.phone.trim()) newErrors.phone = "Phone number is required"
        else if (data.phone.length < 10) newErrors.phone = "Please enter a valid phone number"
        break
      case "verify":
        if (!data.verificationCode.trim()) newErrors.verificationCode = "Verification code is required"
        else if (data.verificationCode.length !== 6) newErrors.verificationCode = "Code must be 6 digits"
        break
      case "profile":
        if (!data.email.trim()) newErrors.email = "Email is required"
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) newErrors.email = "Invalid email address"
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateStep(currentStep)) return

    if (currentStep === "phone" && !isCodeSent) {
      setIsCodeSent(true)
      return
    }

    const nextStepIndex = currentStepIndex + 1
    if (nextStepIndex < steps.length) {
      setCurrentStep(steps[nextStepIndex].key)
    }
  }

  const handleBack = () => {
    if (currentStep === "verify" && isCodeSent) {
      setIsCodeSent(false)
      return
    }

    const prevStepIndex = currentStepIndex - 1
    if (prevStepIndex >= 0) {
      setCurrentStep(steps[prevStepIndex].key)
    }
  }

  const handleComplete = () => {
    if (validateStep("profile")) {
      alert("Onboarding completed! Welcome aboard! 🎉")
    }
  }

  const updateData = (field: keyof OnboardingData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const currentStepData = steps[currentStepIndex]
  const Icon = currentStepData.icon

  return (
    <div className="w-full max-w-md mx-auto space-y-8 p-6">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-light text-gray-800">Welcome</h1>
          <p className="text-sm text-gray-500">Let's get you set up in just a few steps</p>
        </div>

        <div className="space-y-3">
          <Progress value={progress} className="h-1 bg-gray-100" />
          <div className="text-xs text-gray-400 text-center">
            {currentStepIndex + 1} of {steps.length}
          </div>
        </div>

        <div className="flex justify-center space-x-8">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex
            const isCurrent = index === currentStepIndex

            return (
              <div key={step.key} className={cn("flex flex-col items-center space-y-2")}>
                <div
                  className={cn(
                    "w-6 h-6 rounded-full transition-all duration-300",
                    isCompleted && "bg-rose-400",
                    isCurrent && "bg-rose-500 ring-4 ring-rose-100",
                    !isCompleted && !isCurrent && "bg-gray-200",
                  )}
                />
                <div
                  className={cn(
                    "w-1 h-1 rounded-full transition-colors",
                    (isCompleted || isCurrent) && "bg-rose-300",
                    !isCompleted && !isCurrent && "bg-gray-200",
                  )}
                />
              </div>
            )
          })}
        </div>
      </div>

      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl flex items-center justify-center">
            <Icon className="w-7 h-7 text-rose-500" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl font-light text-gray-800">{currentStepData.title}</CardTitle>
            <CardDescription className="text-gray-500 text-sm">{currentStepData.description}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-8">
          {currentStep === "name" && (
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={data.name}
                onChange={(e) => updateData("name", e.target.value)}
                className={cn(
                  "border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-200 transition-all rounded-xl h-12",
                  errors.name && "ring-2 ring-red-200 bg-red-50",
                )}
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
            </div>
          )}

          {currentStep === "phone" && (
            <div className="space-y-3">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone Number
              </Label>
              <PhoneInput
                id="phone"
                placeholder="Enter phone number"
                value={data.phone}
                onChange={(value) => updateData("phone", value || "")}
                className={cn(
                  "border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-200 transition-all rounded-xl h-12",
                  errors.phone && "ring-2 ring-red-200 bg-red-50",
                )}
                defaultCountry="US"
              />
              {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
              {!isCodeSent && <p className="text-xs text-gray-400">We'll send you a 6-digit verification code</p>}
            </div>
          )}

          {currentStep === "verify" && (
            <div className="space-y-3">
              <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                Verification Code
              </Label>
              <Input
                id="code"
                placeholder="123456"
                value={data.verificationCode}
                onChange={(e) => updateData("verificationCode", e.target.value)}
                className={cn(
                  "border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-200 transition-all rounded-xl h-12 text-center text-lg tracking-widest",
                  errors.verificationCode && "ring-2 ring-red-200 bg-red-50",
                )}
                maxLength={6}
              />
              {errors.verificationCode && <p className="text-xs text-red-400">{errors.verificationCode}</p>}
              <p className="text-xs text-gray-400 text-center">Code sent to {data.phone}</p>
            </div>
          )}

          {currentStep === "profile" && (
            <div className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={data.email}
                  onChange={(e) => updateData("email", e.target.value)}
                  className={cn(
                    "border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-200 transition-all rounded-xl h-12",
                    errors.email && "ring-2 ring-red-200 bg-red-50",
                  )}
                />
                {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
              </div>

              <div className="space-y-3">
                <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                  Bio <span className="text-gray-400 font-normal">(Optional)</span>
                </Label>
                <Input
                  id="bio"
                  placeholder="Tell us a bit about yourself"
                  value={data.bio}
                  onChange={(e) => updateData("bio", e.target.value)}
                  className="border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-200 transition-all rounded-xl h-12"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-6">
            {(currentStepIndex > 0 || (currentStep === "verify" && isCodeSent)) && (
              <Button
                variant="ghost"
                onClick={handleBack}
                className="flex-1 h-12 rounded-xl text-gray-600 hover:bg-gray-50 border-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}

            {currentStep === "profile" ? (
              <Button
                onClick={handleComplete}
                className="flex-1 h-12 bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 border-0 rounded-xl shadow-lg shadow-rose-200/50 text-white font-medium"
              >
                Complete Setup
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="flex-1 h-12 bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 border-0 rounded-xl shadow-lg shadow-rose-200/50 text-white font-medium"
              >
                {currentStep === "phone" && !isCodeSent ? "Send Code" : "Continue"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
