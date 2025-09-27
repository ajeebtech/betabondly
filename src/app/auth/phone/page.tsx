'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
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
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);

  if (authLoading) {
    return <LoadingSpinner />;
  }

  useEffect(() => {
    // Initialize reCAPTCHA verifier
    if (typeof window !== 'undefined') {
      recaptchaVerifier.current = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
        }
      );
    }

    return () => {
      if (recaptchaVerifier.current) {
        recaptchaVerifier.current.clear();
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
      
      if (!recaptchaVerifier.current) {
        throw new Error('reCAPTCHA not initialized');
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifier.current
      );

      // Store confirmation result in session storage
      window.sessionStorage.setItem(
        'confirmationResult',
        JSON.stringify({
          verificationId: confirmationResult.verificationId,
        })
      );

      router.push('/auth/verify');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      setError(error.message || 'Failed to send OTP. Please try again.');
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
