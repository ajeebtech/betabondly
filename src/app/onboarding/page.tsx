"use client";

import { useState } from 'react';
import { OTPInput } from "input-otp";
import { PhoneInput } from "@/components/ui/phone-input";

type Step = 'name' | 'phone' | 'verify' | 'profile';

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('name');
  const [formData, setFormData] = useState({
    name: '',
    preferredName: '',
    phone: '',
    country: 'US',
    verificationCode: '',
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

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  const renderStep = () => {
    switch (step) {
      case 'name':
        return (
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <h3 className="text-lg font-medium">What's your name?</h3>
            <div className="space-y-2">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Your full name"
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
            <div className="space-y-2">
              <PhoneInput
                value={formData.phone}
                country={formData.country || 'US'}
                onChange={(phone) => updateFormData({ phone })}
                onCountryChange={(country) => updateFormData({ country })}
                placeholder="Enter your phone number"
                className="w-full"
                autoFocus
              />
              {error && step === 'phone' && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={!formData.phone}
              className="w-full py-2.5 rounded-lg bg-pink-500 text-white disabled:bg-pink-100 disabled:text-pink-300 transition-colors"
            >
              Send Code
            </button>
          </form>
        );

      case 'verify':
        return (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">Enter verification code</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a 6-digit code to {formData.phone}
              </p>
            </div>
            
            <div className="flex justify-center">
              <OTPInput
                maxLength={6}
                value={formData.verificationCode}
                onChange={handleOTPChange}
                containerClassName="flex gap-2"
                render={({ slots }) => (
                  <>
                    {slots.map((slot, index) => (
                      <div
                        key={index}
                        className={`h-14 w-12 flex items-center justify-center border-2 rounded-md text-lg ${
                          slot.isActive ? 'border-pink-500 ring-2 ring-pink-200' : 'border-gray-300'
                        }`}
                      >
                        {slot.char}
                      </div>
                    ))}
                  </>
                )}
              />
            </div>

            {error && (
              <p className="text-center text-sm text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={formData.verificationCode.length !== 6}
              className="w-full py-2.5 rounded-lg bg-pink-500 text-white disabled:bg-pink-100 disabled:text-pink-300 transition-colors"
            >
              Verify & Continue
            </button>
            
            <p className="text-center text-sm text-muted-foreground">
              Didn't receive a code?{' '}
              <button 
                type="button" 
                className="text-pink-500 hover:underline"
                onClick={() => {
                  // Handle resend code logic here
                  updateFormData({ verificationCode: '' });
                }}
              >
                Resend code
              </button>
            </p>
          </form>
        );

      case 'profile':
        return (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <h3 className="text-lg font-medium">What should we call you?</h3>
            <input
              type="text"
              value={formData.preferredName}
              onChange={(e) => updateFormData({ preferredName: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder={formData.name || 'Nickname'}
              autoFocus
            />
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
