"use client";

import { useState } from 'react';
import { InputOtp } from "@heroui/react";
import PhoneInput from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Phone, User, UserCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = 'name' | 'phone' | 'verify' | 'profile';

interface FormData {
  name: string;
  phone: string;
  verificationCode: string;
  email: string;
  bio: string;
}

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('name');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    verificationCode: '',
    email: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      // Clear error when user starts typing
      if (updates.name !== undefined && error) {
        setError('');
      }
      return newData;
    });
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    setStep('phone');
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone) {
      setError('Please enter your phone number');
      return;
    }
    setStep('verify');
    setError('');
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    setStep('profile');
  };

  const handleOTPChange = (value: string) => {
    updateFormData({ verificationCode: value });
    if (value.length === 6) {
      // Auto-submit when 6 digits are entered
      handleVerify({ preventDefault: () => {} } as React.FormEvent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Handle backspace to move to previous input
    if (e.key === 'Backspace' && !formData.verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const otp = pastedData.replace(/\D/g, '').slice(0, 6); // Get only digits and limit to 6
    if (otp.length === 6) {
      updateFormData({ verificationCode: otp });
      // Auto-submit if pasted a complete OTP
      setTimeout(() => {
        handleVerify({ preventDefault: () => {} } as React.FormEvent);
      }, 0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    handleSubmit(e);
  };

  const renderStep = () => {
    switch (step) {
      case 'name':
        return (
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <h3 className="text-lg font-medium">What's your name?</h3>
            <div className="space-y-2">
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                placeholder="Your full name"
                className="w-full"
                autoFocus
              />
              {error && step === 'name' && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={!formData.name.trim()}
              className="w-full py-2.5 rounded-lg bg-pink-500 text-white disabled:bg-pink-100 disabled:text-pink-300 transition-colors"
            >
              Continue
            </button>
          </form>
        );

      case 'phone':
        return (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <h3 className="text-lg font-medium">What's your phone number?</h3>
            <p className="text-sm text-gray-500">We'll send you a verification code</p>
            <div className="space-y-2">
              <PhoneInput
                value={formData.phone as any} // Type assertion to handle E164Number type
                onChange={(value) => updateFormData({ phone: value || '' })}
                placeholder="Enter phone number"
                className="w-full"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full">
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        );

      case 'verify':
        return (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pink-100">
                <Phone className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-medium">Verify your phone</h3>
              <p className="text-sm text-gray-500">
                We've sent a verification code to {formData.phone}
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="flex justify-center mb-4">
                <div className="flex gap-3">
                  {[...Array(6)].map((_, i) => (
                    <input
                      key={i}
                      id={`otp-input-${i}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={formData.verificationCode[i] || ''}
                      onChange={(e) => {
                        const newCode = formData.verificationCode.split('');
                        const value = e.target.value.replace(/\D/g, '').slice(-1); // Only allow one digit
                        newCode[i] = value;
                        const code = newCode.join('');
                        handleOTPChange(code);
                        
                        // Auto-focus next input
                        if (value && i < 5) {
                          const nextInput = document.getElementById(`otp-input-${i + 1}`) as HTMLInputElement;
                          if (nextInput) nextInput.focus();
                        }
                      }}
                      onKeyDown={(e) => handleKeyDown(e, i)}
                      onPaste={handlePaste}
                      className={[
                        'h-12 w-10 text-lg font-medium text-center',
                        'bg-gray-100 border-2 border-gray-300 rounded-lg',
                        'focus:border-pink-500 focus:ring-1 focus:ring-pink-200',
                        'transition-colors duration-200',
                        'text-gray-900',
                        'py-2',
                        'appearance-none' // Remove number input spinners
                      ].join(' ')}
                    />
                  ))}
                </div>
              </div>
              
              <div className="text-sm text-default-500">
                Verification code: <span className="font-medium">{formData.verificationCode}</span>
              </div>
            </div>

            {error && (
              <p className="text-center text-sm text-red-500">
                {error}
              </p>
            )}

            <div className="text-center text-sm text-gray-500">
              Didn't receive a code?{' '}
              <button type="button" className="font-medium text-pink-600 hover:text-pink-500">
                Resend
              </button>
            </div>

            <div className="flex gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                className="w-1/2"
                onClick={() => setStep('phone')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="submit" className="w-1/2">
                Verify
                <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        );

      case 'profile':
        return (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Complete your profile</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData({ email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="w-full"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-pink-500 text-white"
            >
              Complete Setup
            </button>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 'name' ? 'Welcome!' : 
             step === 'phone' ? 'Your Phone Number' :
             step === 'verify' ? 'Verify Your Number' :
             'Almost There!'}
          </h1>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}
        {renderStep()}
      </div>
    </div>
  );
}
