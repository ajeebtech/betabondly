// src/app/onboarding/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  RecaptchaVerifier,
  updateProfile,
  updateEmail,
  User as FirebaseUser,
  signInWithPhoneNumber
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RecaptchaLoader } from "@/components/RecaptchaLoader";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { GoogleCalendarSetup } from "@/components/GoogleCalendarSetup";

type Step = 'name' | 'phone' | 'verify' | 'google' | 'email';

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
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);
  const router = useRouter();

  // Initialize reCAPTCHA on mount and clean up on unmount
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
    // Initialize reCAPTCHA
    const initialize = async () => {
      try {
        console.log('Initializing reCAPTCHA...');
        await initRecaptcha();
        console.log('reCAPTCHA initialized successfully');
      } catch (error) {
        console.error('Failed to initialize reCAPTCHA:', error);
        setError('Failed to initialize security verification. Please refresh the page.');
      }
    };
    
    initialize();
    
    // Cleanup function
    return () => {
      if (recaptchaVerifier.current) {
        try {
          console.log('Cleaning up reCAPTCHA...');
          recaptchaVerifier.current.clear();
          recaptchaVerifier.current = null;
        } catch (e) {
          console.warn('Error cleaning reCAPTCHA:', e);
        }
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const initRecaptcha = async () => {
    console.log('=== Starting reCAPTCHA Initialization ===');
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      const error = new Error('reCAPTCHA cannot be initialized on the server side');
      console.error(error);
      throw error;
    }
    
    // No need to wait for a global reCAPTCHA object; Firebase RecaptchaVerifier will inject it as needed.
    
    // Clear existing reCAPTCHA if it exists
    if (recaptchaVerifier.current) {
      try { 
        console.log('Clearing existing reCAPTCHA instance...');
        recaptchaVerifier.current.clear();
        console.log('✅ Existing reCAPTCHA cleared');
      } catch (e) {
        console.warn('⚠️ Error clearing existing reCAPTCHA:', e);
      }
    }
    
    try {
      console.log('Creating new reCAPTCHA verifier...');
      
      // Verify container exists
      const container = document.getElementById('recaptcha-container');
      console.log('reCAPTCHA container:', container);
      
      if (!container) {
        throw new Error('reCAPTCHA container not found in the DOM');
      }
      
      // Verify auth is properly initialized
      if (!auth) {
        throw new Error('Firebase Auth is not properly initialized');
      }
      
      // Make sure container is visible during initialization
      container.style.display = 'block';
      
      // Create new reCAPTCHA verifier with site key
      const verifier = new RecaptchaVerifier(
        auth, 
        'recaptcha-container', 
        {
          size: 'invisible',
          // siteKey is optional for Firebase Phone Auth; if using Enterprise, ensure NEXT_PUBLIC_RECAPTCHA_SITE_KEY is set
          siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
          callback: (response: any) => {
            console.log('✅ reCAPTCHA verified successfully:', response);
          },
          'expired-callback': () => {
            console.warn('⚠️ reCAPTCHA expired');
            setError('Verification expired. Please try again.');
          },
          'error-callback': (error: any) => {
            console.error('❌ reCAPTCHA error:', {
              name: error?.name,
              message: error?.message,
              code: error?.code,
              stack: error?.stack
            });
            setError('Failed to verify you\'re human. Please refresh and try again.');
          }
        }
      );
      
      recaptchaVerifier.current = verifier;
      
      // Add to window for debugging
      (window as any).recaptchaVerifier = verifier;
      
      console.log('✅ reCAPTCHA initialized successfully');
      
      // Hide container after initialization
      if (container) {
        container.style.display = 'none';
      }
      console.log('reCAPTCHA verifier state:', {
        type: typeof verifier,
        // Removed private property access
        isRecaptchaVerifier: verifier instanceof RecaptchaVerifier
      });
      
      return verifier;
      
    } catch (error: any) {
      console.error('❌ Failed to initialize reCAPTCHA:', {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
        timestamp: new Date().toISOString(),
        environment: {
          isClient: typeof window !== 'undefined',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          location: window.location.href,
          firebaseConfig: {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '***' : 'MISSING',
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'MISSING',
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'MISSING',
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '***' : 'MISSING'
          }
        }
      });
      
      throw error;
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (formData.phone.length !== 10) {
        setError('Enter a valid 10-digit Indian number');
        return;
      }

      const formattedPhone = `+91${formData.phone}`;
      
      // Ensure a single reCAPTCHA verifier exists and reuse it
      console.log('Ensuring reCAPTCHA verifier exists...');
      if (!recaptchaVerifier.current) {
        await initRecaptcha();
      }
      const verifier = recaptchaVerifier.current as RecaptchaVerifier;
      
      console.log('Sending OTP to:', formattedPhone, {
        timestamp: new Date().toISOString(),
        auth: !!auth,
        authCurrentUser: auth.currentUser
      });

      try {
        const confirmation = await signInWithPhoneNumber(
          auth,
          formattedPhone,
          verifier
        );
        
        console.log('OTP sent successfully:', {
          verificationId: confirmation.verificationId,
          timestamp: new Date().toISOString()
        });
        
        setConfirmationResult(confirmation);
        setStep('verify');
      } catch (firebaseError: any) {
        console.error('OTP send error:', {
          code: firebaseError?.code,
          message: firebaseError?.message,
          details: firebaseError
        });
        
        // Clean up the verifier on error
        try {
          if ((verifier as any)?.clear) {
            verifier.clear();
          }
        } catch (cleanupError) {
          console.warn('Error cleaning up reCAPTCHA:', cleanupError);
        }
        
        console.error('Firebase OTP error:', {
          name: firebaseError?.name,
          code: firebaseError?.code,
          message: firebaseError?.message,
          stack: firebaseError?.stack,
          timestamp: new Date().toISOString(),
          errorString: String(firebaseError)
        });
        
        // Create a new error with all properties preserved
        const enhancedError = new Error(firebaseError?.message || 'Unknown Firebase OTP error');
        Object.assign(enhancedError, firebaseError);
        throw enhancedError;
      }
    } catch (err: any) {
      // Extract all error properties
      const errorDetails = {} as any;
      if (err) {
        Object.getOwnPropertyNames(err).forEach(key => {
          try {
            errorDetails[key] = err[key];
          } catch (e) {
            errorDetails[key] = `[Error reading property: ${e}]`;
          }
        });
      }

      console.error('OTP send failed:', {
        error: {
          name: err?.name,
          message: err?.message,
          code: err?.code,
          stack: err?.stack,
          stringValue: String(err),
          allProperties: errorDetails
        },
        timestamp: new Date().toISOString(),
        authState: {
          currentUser: auth.currentUser ? {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            emailVerified: auth.currentUser.emailVerified,
            phoneNumber: auth.currentUser.phoneNumber,
            isAnonymous: auth.currentUser.isAnonymous
          } : null,
          isAuthenticated: !!auth.currentUser
        },
        environment: {
          isClient: typeof window !== 'undefined',
          nodeEnv: process.env.NODE_ENV,
          firebaseConfig: {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '***' : 'MISSING',
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'MISSING',
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'MISSING',
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '***' : 'MISSING'
          },
          location: typeof window !== 'undefined' ? window.location.href : 'server',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
        },
        recaptchaState: {
          container: document.getElementById('recaptcha-container'),
          verifier: !!recaptchaVerifier.current,
          windowVerifier: (window as any).recaptchaVerifier
        }
      });

      if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait before retrying.');
      } else if (err.code === 'auth/invalid-phone-number') {
        setError('The phone number format is invalid.');
      } else if (err.code === 'auth/missing-phone-number') {
        setError('Please provide a phone number.');
      } else if (err.code === 'auth/quota-exceeded') {
        setError('Quota exceeded. Please try again later.');
      } else {
        setError(err.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) {
      setError('Session expired. Request OTP again.');
      setStep('phone');
      return;
    }
    if (formData.verificationCode.length !== 6) {
      setError('Enter a 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(formData.verificationCode);
      if (result?.user) {
        // Move to Google Calendar setup after OTP verification
        setStep('google');
      }
    } catch (err) {
      setError('Invalid code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: formData.name });
      await updateEmail(auth.currentUser, formData.email);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['name', 'phone', 'verify', 'google', 'email'] as const;
  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'name' && formData.name.trim()) setStep('phone');
    else if (step === 'phone') handleSendCode(e);
    else if (step === 'verify') handleVerifyCode(e);
    else if (step === 'email') handleSubmitEmail(e);
  };

  const prevStep = () => {
    if (step === 'phone') setStep('name');
    else if (step === 'verify') setStep('phone');
    else if (step === 'google') setStep('verify');
    else if (step === 'email') setStep('google');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Hidden reCAPTCHA container - must be in the DOM but can be invisible */}
      <div id="recaptcha-container" className="invisible absolute"></div>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Complete Your Profile</CardTitle>
          <CardDescription className="text-center">
            Step {currentStepIndex + 1} of {steps.length}
          </CardDescription>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>}
          <form onSubmit={nextStep} className="space-y-4">
            {step === 'name' && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>
            )}
            {step === 'phone' && (
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex mt-1">
                  <span className="px-3 flex items-center bg-gray-100 border border-r-0 rounded-l">+91</span>
                  <Input id="phone" name="phone" value={formData.phone}
                    onChange={e => setFormData(prev => ({...prev, phone: e.target.value.replace(/\D/g,'')}))}
                    maxLength={10} className="rounded-l-none" required />
                </div>
              </div>
            )}
            {step === 'verify' && (
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Verify your phone</CardTitle>
                  <CardDescription>Enter the 6-digit code sent to +91 {formData.phone}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="verificationCode">Verification Code</Label>
                      <Input
                        id="verificationCode"
                        name="verificationCode"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={formData.verificationCode}
                        onChange={handleChange}
                        placeholder="000000"
                        className="text-center text-xl tracking-widest"
                        disabled={loading}
                        autoFocus
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Verifying...' : 'Verify'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setStep('phone')}
                      disabled={loading}
                    >
                      Change Number
                    </Button>
                  </form>
                  {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </CardContent>
              </Card>
            )}
            {step === 'google' && (
              <div className="w-full max-w-md">
                <GoogleCalendarSetup 
                  onSuccess={() => setStep('email')}
                  onSkip={() => setStep('email')}
                />
              </div>
            )}
            {step === 'email' && (
              <div>
                <Label>Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
            )}
            <div className="flex justify-between pt-4">
              <Button type="button" onClick={prevStep} disabled={step==='name'||loading} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Loading...' : step==='email' ? 'Complete' : 'Continue'}
                {!loading && step!=='email' && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}