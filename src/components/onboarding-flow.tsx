"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Phone, User, UserCircle, ArrowRight, ArrowLeft, Loader2, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import PhoneInput from "@/components/ui/phone-input";
import { useOnboarding } from "@/hooks/useOnboarding";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { auth } from "@/lib/firebase";

declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationResult: any;
  }
}

type Step = "name" | "phone" | "verify" | "profile" | "complete";

const steps = [
  { key: "name" as const, title: "Your Name", description: "Tell us what to call you", icon: User },
  { key: "phone" as const, title: "Phone Number", description: "We'll send you a verification code", icon: Phone },
  { key: "verify" as const, title: "Verify Phone", description: "Enter the code we sent you", icon: CheckCircle },
  { key: "profile" as const, title: "Complete Profile", description: "Add some final details", icon: UserCircle },
];

export function OnboardingFlow() {
  const {
    currentStep,
    setCurrentStep,
    formData,
    loading,
    error,
    updateFormData,
    handleNext,
    handleBack,
    handleComplete,
  } = useOnboarding();

  const currentStepIndex = steps.findIndex((step) => step.key === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  const CurrentIcon = steps[currentStepIndex]?.icon || User;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateFormData({ profilePicture: file });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Set up reCAPTCHA
  useEffect(() => {
    // Clean up reCAPTCHA on unmount
    return () => {
      if (typeof window !== 'undefined') {
        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
          } catch (error) {
            console.error('Error cleaning up reCAPTCHA:', error);
          }
        }
        // Clear any existing reCAPTCHA container
        const container = document.getElementById('recaptcha-container');
        if (container) {
          container.innerHTML = '';
        }
      }
    };
  }, []);

  // Create reCAPTCHA container if it doesn't exist
  useEffect(() => {
    if (typeof window !== 'undefined' && !document.getElementById('recaptcha-container')) {
      const recaptchaDiv = document.createElement('div');
      recaptchaDiv.id = 'recaptcha-container';
      recaptchaDiv.className = 'invisible absolute';
      document.body.appendChild(recaptchaDiv);
    }
  }, []);

  return (
    <div className="w-full max-w-md mx-auto space-y-8 p-6">
      {/* Visible reCAPTCHA container for debugging */}
      <div id="recaptcha-container" className="mt-4 flex justify-center"></div>
      
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
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={step.key} className="flex flex-col items-center space-y-2">
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
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4 pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl flex items-center justify-center">
                <CurrentIcon className="w-7 h-7 text-rose-500" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl font-light text-gray-800">
                  {steps[currentStepIndex]?.title}
                </CardTitle>
                <CardDescription className="text-gray-500 text-sm">
                  {steps[currentStepIndex]?.description}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 px-8 pb-8">
              {currentStep === "name" && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-800">What's your name?</h3>
                    <p className="text-sm text-muted-foreground">
                      This is how you'll appear on Bondly
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => updateFormData({ name: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && formData.name.trim().length > 0) {
                          handleNext();
                        }
                      }}
                      className={cn(
                        "border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-200 transition-all rounded-xl h-12",
                        error && "ring-2 ring-red-200 bg-red-50",
                      )}
                      autoFocus
                    />
                    {error && (
                      <p className="text-sm text-red-500 text-center">{error}</p>
                    )}
                  </div>
                </div>
              )}

              {currentStep === "phone" && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-800">What's your phone number?</h3>
                    <p className="text-sm text-muted-foreground">
                      We'll send you a verification code
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <PhoneInput
                      id="phone"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(value) => updateFormData({ phone: value || "" })}
                      className={cn(
                        "border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-200 transition-all rounded-xl h-12",
                        error && "ring-2 ring-red-200 bg-red-50",
                      )}
                      defaultCountry="US"
                      autoFocus
                    />
                    {error && (
                      <p className="text-sm text-red-500 text-center">{error}</p>
                    )}
                    <p className="text-xs text-gray-400">We'll send you a 6-digit verification code</p>
                  </div>
                </div>
              )}

              {currentStep === "verify" && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-800">Verify your phone</h3>
                    <p className="text-sm text-muted-foreground">
                      We've sent a verification code to {formData.phone}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <Input
                      id="verificationCode"
                      placeholder="Enter 6-digit code"
                      value={formData.verificationCode}
                      onChange={(e) => {
                        // Only allow numbers
                        const value = e.target.value.replace(/\D/g, '');
                        updateFormData({ verificationCode: value });
                        
                        // Auto-submit when 6 digits are entered
                        if (value.length === 6) {
                          handleNext();
                        }
                      }}
                      onKeyDown={(e) => {
                        // Allow backspace, tab, delete, left/right arrows
                        if (!/^[0-9\b\t\n\r\x0B\f\x0B\u0007\u001B\u0008\u0009\u000A\u000B\u000C\u000D\u001B\u001C\u001D\u001E\u001F\u007F\u2028\u2029\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF\u0000-\u001F\u007F-\u009F\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]$/.test(e.key) && 
                            e.key !== 'Backspace' && 
                            e.key !== 'Tab' && 
                            e.key !== 'Delete' && 
                            e.key !== 'ArrowLeft' && 
                            e.key !== 'ArrowRight') {
                          e.preventDefault();
                        }
                      }}
                      className={cn(
                        "border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-200 transition-all rounded-xl h-12 text-center text-lg font-mono tracking-widest",
                        error && "ring-2 ring-red-200 bg-red-50",
                      )}
                      maxLength={6}
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      pattern="\d*"
                      disabled={loading}
                      autoFocus
                    />
                    <Button
                      variant="link"
                      type="button"
                      className="text-xs text-muted-foreground w-full"
                      onClick={() => {
                        updateFormData({ verificationCode: '' });
                        setCurrentStep('phone');
                      }}
                      disabled={loading}
                    >
                      Change phone number
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === "profile" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-800">Complete your profile</h3>
                    <p className="text-sm text-muted-foreground">
                      Add some final details to get started
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => updateFormData({ email: e.target.value })}
                      className={cn(
                        "border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-200 transition-all rounded-xl h-12",
                        error?.includes('email') && "ring-2 ring-red-200 bg-red-50",
                      )}
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="preferredName" className="text-sm font-medium">
                      Preferred Name <span className="text-gray-400 font-normal">(Optional)</span>
                    </Label>
                    <Input
                      id="preferredName"
                      placeholder="What should we call you?"
                      value={formData.preferredName}
                      onChange={(e) => updateFormData({ preferredName: e.target.value })}
                      className="border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-200 transition-all rounded-xl h-12"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && formData.email.trim().length > 0) {
                          handleComplete();
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="bio" className="text-sm font-medium">
                      Bio <span className="text-gray-400 font-normal">(Optional)</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="bio"
                        placeholder="Tell us a bit about yourself"
                        value={formData.bio}
                        onChange={(e) => updateFormData({ bio: e.target.value })}
                        className="border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-200 transition-all rounded-xl h-12"
                      />
                      <span className="absolute right-3 top-3 text-xs text-gray-400">
                        {formData.bio.length}/150
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label className="text-sm font-medium">
                      Profile Picture <span className="text-gray-400 font-normal">(Optional)</span>
                    </Label>
                    <div className="flex flex-col items-center space-y-3">
                      <label
                        htmlFor="profilePicture"
                        className={cn(
                          "w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors overflow-hidden",
                          error?.includes('profile') && "ring-2 ring-red-200"
                        )}
                      >
                        {formData.profilePicture ? (
                          <Image
                            src={URL.createObjectURL(formData.profilePicture)}
                            alt="Profile preview"
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center">
                            <Camera className="w-6 h-6 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500">Add photo</span>
                          </div>
                        )}
                      </label>
                      <input
                        id="profilePicture"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      {formData.profilePicture && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs text-rose-500 hover:text-rose-600"
                          onClick={() => updateFormData({ profilePicture: null })}
                        >
                          Remove photo
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {error && !error.includes('email') && !error.includes('profile') && (
                    <p className="text-sm text-red-500 text-center">{error}</p>
                  )}
                </div>
              )}

              <div className="space-y-6">
                {currentStep === "complete" ? (
                  <div className="text-center space-y-6 py-8">
                    {loading ? (
                      <div className="space-y-4">
                        <div className="w-20 h-20 mx-auto flex items-center justify-center">
                          <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
                        </div>
                        <p className="text-gray-500">Setting up your account...</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-medium text-gray-800">All set!</h3>
                          <p className="text-gray-500">Your profile has been created successfully.</p>
                        </div>
                        <div className="pt-4">
                          <Button
                            onClick={handleComplete}
                            className="w-full h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white"
                          >
                            Go to Dashboard
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="mt-6">
                    {error && (
                      <p className="text-sm text-red-500 text-center mb-4">{error}</p>
                    )}
                    <Button
                      type="button"
                      onClick={currentStep === "profile" ? handleComplete : handleNext}
                      disabled={loading || 
                        (currentStep === "name" && !formData.name.trim()) || 
                        (currentStep === "phone" && !formData.phone) || 
                        (currentStep === "verify" && formData.verificationCode.length !== 6) || 
                        (currentStep === "profile" && !formData.email.trim())
                      }
                      className={cn(
                        "w-full h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition-all",
                        loading && "opacity-70 cursor-not-allowed"
                      )}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : currentStep === "profile" ? (
                        "Complete"
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
      
      {/* Visible reCAPTCHA container for debugging */}
      <div id="recaptcha-container" className="mt-4 flex justify-center"></div>
    </div>
  );
}
