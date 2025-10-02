'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPhoneNumber } from 'firebase/auth';
import { auth, initRecaptcha } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireNoAuth } from '@/hooks/useRequireAuth';
import { LoadingSpinner } from '@/components/auth/LoadingSpinner';

export default function PhoneStep() {
  const router = useRouter();
  const { phone, setPhone, name } = useAuth();
  const { loading: authLoading } = useRequireNoAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaReady, setRecaptchaReady] = useState(false);

  useEffect(() => {
    // Initialize reCAPTCHA when component mounts
    const initializeRecaptcha = async () => {
      try {
        // Clear any existing reCAPTCHA
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }

        // Create the container if it doesn't exist
        let container = document.getElementById('recaptcha-container');
        if (!container) {
          container = document.createElement('div');
          container.id = 'recaptcha-container';
          container.style.display = 'none';
          document.body.appendChild(container);
        }

        // Initialize reCAPTCHA using the centralized function
        window.recaptchaVerifier = initRecaptcha('recaptcha-container');
        
        // Render the reCAPTCHA widget
        await window.recaptchaVerifier.render();
        setRecaptchaReady(true);
      } catch (error) {
        console.error('Failed to initialize reCAPTCHA:', error);
        setError('Failed to initialize security check. Please refresh the page and try again.');
      }
    };

    initializeRecaptcha();
  }, []);

  if (authLoading || !recaptchaReady) {
    return <LoadingSpinner />;
  }

  // Clean up reCAPTCHA when component unmounts
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (error) {
          console.warn('Error cleaning up reCAPTCHA:', error);
        }
      }
    };
  }, []);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (phone.length !== 10) {
        setError('Please enter a valid 10-digit phone number');
        return;
      }

      const formattedPhone = `+91${phone}`;
      
      if (!window.recaptchaVerifier) {
        throw new Error('Security check failed. Please refresh the page and try again.');
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        window.recaptchaVerifier
      );

      // Store confirmation result in session storage
      window.sessionStorage.setItem(
        'confirmationResult',
        JSON.stringify({
          verificationId: confirmationResult.verificationId,
          phoneNumber: formattedPhone,
        })
      );

      router.push('/auth/verify');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/invalid-phone-number') {
        setError('The provided phone number is not valid.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many requests. Please try again later.');
      } else if (error.code === 'auth/invalid-app-credential') {
        setError('Authentication configuration error. Please check your Firebase setup.');
      } else if (error.code === 'auth/missing-app-credential') {
        setError('Authentication credentials missing. Please check your Firebase configuration.');
      } else if (error.code === 'auth/app-not-authorized') {
        setError('This app is not authorized for phone authentication. Please contact support.');
      } else {
        setError(error.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div id="recaptcha-container" className="invisible absolute"></div>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Hi {name || 'there'}! 👋</CardTitle>
          <CardDescription className="text-center">
            Please enter your phone number to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex mt-1">
                <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 rounded-l-md">
                  +91
                </span>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter your phone number"
                  className="rounded-l-none"
                  required
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Verification Code'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
