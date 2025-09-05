// src/app/onboarding/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPhoneNumber, updateProfile, updateEmail, User as FirebaseUser } from 'firebase/auth';
import { auth, RecaptchaVerifier } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Phone, User as UserIcon, Mail, ArrowRight, ArrowLeft } from "lucide-react";

type Step = 'name' | 'phone' | 'verify' | 'email';

interface FormData {
  name: string;
  phone: string;
  verificationCode: string;
  email: string;
}

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('name');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    verificationCode: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<{confirm: (code: string) => Promise<{user: FirebaseUser} | null>} | null>(null);
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);
  const router = useRouter();

  // Initialize reCAPTCHA
  useEffect(() => {
    if (typeof window !== 'undefined') {
      recaptchaVerifier.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const phoneNumber = formData.phone.trim();
      if (!phoneNumber || phoneNumber.length !== 10) {
        setError('Please enter a valid 10-digit Indian phone number');
        setLoading(false);
        return;
      }

      // Format phone number with Indian country code
      const formattedPhoneNumber = `+91${phoneNumber}`;
      
      // Reset reCAPTCHA if it exists
      if (recaptchaVerifier.current) {
        recaptchaVerifier.current.clear();
      }
      
      // Create new reCAPTCHA verifier
      recaptchaVerifier.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
      
      console.log('Sending code to:', formattedPhoneNumber);
      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhoneNumber,
        recaptchaVerifier.current
      );
      
      console.log('Confirmation result:', confirmation);
      setConfirmationResult(confirmation);
      setStep('verify');
    } catch (err: any) {
      console.error('Error sending code:', err);
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when 6 digits are entered and handle focus
  useEffect(() => {
    if (step === 'verify') {
      if (formData.verificationCode.length === 6) {
        handleVerifyCode({ preventDefault: () => {} } as React.FormEvent);
      } else if (formData.verificationCode.length === 0) {
        const firstInput = document.getElementById('code-0');
        if (firstInput) firstInput.focus();
      }
    }
  }, [formData.verificationCode, step]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) {
      setError('Verification session expired. Please request a new code.');
      setStep('phone');
      return;
    }

    if (formData.verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Verifying code:', formData.verificationCode);
      const result = await confirmationResult.confirm(formData.verificationCode);
      if (result?.user) {
        setStep('email');
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (err: any) {
      setError('Invalid verification code');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      await updateProfile(user, { displayName: formData.name });
      await updateEmail(user, formData.email);
      // Redirect to dashboard or next step
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 'name') {
      if (formData.name.trim()) {
        setStep('phone');
      }
    } else if (step === 'phone' && formData.phone.trim()) {
      handleSendCode(e);
    } else if (step === 'verify' && formData.verificationCode.trim()) {
      handleVerifyCode(e);
    } else if (step === 'email' && formData.email.trim()) {
      handleSubmitEmail(e);
    }
  };

  const handleContinue = (e: React.MouseEvent) => {
    e.preventDefault();
    if (step === 'name' && formData.name.trim()) {
      setStep('phone');
    }
  };

  const prevStep = () => {
    if (step === 'phone') setStep('name');
    else if (step === 'verify') setStep('phone');
    else if (step === 'email') setStep('verify');
  };

  const progress = {
    'name': 25,
    'phone': 50,
    'verify': 75,
    'email': 100,
  }[step];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-center">
            Step {['name', 'phone', 'verify', 'email'].indexOf(step) + 1} of 4
          </CardDescription>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={nextStep} className="space-y-4">
            {step === 'name' && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="mt-1"
                />
              </div>
            )}

            {step === 'phone' && (
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">+91</span>
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      // Allow only numbers
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData(prev => ({ ...prev, phone: value }));
                    }}
                    placeholder="1234567890"
                    className="pl-14"
                    required
                    maxLength={10}
                    minLength={10}
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                  />
                </div>
              </div>
            )}

            {step === 'verify' && (
              <div>
                <Label htmlFor="verificationCode">Verification Code</Label>
                <div className="flex space-x-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <Input
                      key={i}
                      type="text"
                      maxLength={1}
                      value={formData.verificationCode[i] || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value || e.target.value === '') {
                          const newCode = formData.verificationCode.split('');
                          newCode[i] = value;
                          const updatedCode = newCode.join('').substring(0, 6);
                          setFormData(prev => ({
                            ...prev,
                            verificationCode: updatedCode
                          }));
                          
                          // Auto-focus next input or previous on backspace
                          if (value && i < 5) {
                            const nextInput = document.getElementById(`code-${i + 1}`);
                            if (nextInput) nextInput.focus();
                          } else if (e.target.value === '' && i > 0) {
                            const prevInput = document.getElementById(`code-${i - 1}`);
                            if (prevInput) prevInput.focus();
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        // Handle backspace on empty input
                        if (e.key === 'Backspace' && !e.currentTarget.value && i > 0) {
                          const prevInput = document.getElementById(`code-${i - 1}`);
                          if (prevInput) prevInput.focus();
                        }
                      }}
                      id={`code-${i}`}
                      className="text-center w-12 h-12 text-xl"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  ))}
                </div>
                <input
                  type="hidden"
                  name="verificationCode"
                  value={formData.verificationCode}
                  required
                  minLength={6}
                  maxLength={6}
                />
              </div>
            )}

            {step === 'email' && (
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="mt-1"
                  required
                />
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={step === 'name' || loading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <Button
                type={step === 'name' ? 'button' : 'submit'}
                onClick={step === 'name' ? handleContinue : undefined}
                disabled={
                  loading || 
                  (step === 'name' && !formData.name.trim()) ||
                  (step === 'phone' && formData.phone.length !== 10) ||
                  (step === 'verify' && formData.verificationCode.length !== 6) ||
                  (step === 'email' && !formData.email.trim())
                }
                className="w-full"
              >
                {loading ? 'Loading...' : step === 'email' ? 'Complete' : 'Continue'}
                {!loading && step !== 'email' && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </form>

          {/* Hidden reCAPTCHA container */}
          <div id="recaptcha-container" className="invisible"></div>
        </CardContent>
      </Card>
    </div>
  );
}