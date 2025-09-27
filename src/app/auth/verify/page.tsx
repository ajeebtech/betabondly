'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireNoAuth } from '@/hooks/useRequireAuth';
import { LoadingSpinner } from '@/components/auth/LoadingSpinner';

export default function VerifyStep() {
  const router = useRouter();
  const { name, phone } = useAuth();
  const { loading: authLoading } = useRequireNoAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (authLoading) {
    return <LoadingSpinner />;
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (code.length !== 6) {
        setError('Please enter a valid 6-digit code');
        return;
      }

      // Get the stored confirmation result
      const storedConfirmation = window.sessionStorage.getItem('confirmationResult');
      if (!storedConfirmation) {
        throw new Error('Session expired. Please try again.');
      }

      const { verificationId } = JSON.parse(storedConfirmation);
      const credential = PhoneAuthProvider.credential(verificationId, code);
      
      // Sign in with the credential
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // Create or update user in Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          uid: user.uid,
          name,
          phone: `+91${phone}`,
          email: user.email,
          emailVerified: user.emailVerified,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Clear the stored confirmation
      window.sessionStorage.removeItem('confirmationResult');
      
      // Redirect to dashboard or home
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Verification error:', error);
      setError(error.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    // This would typically trigger the phone number screen again
    router.push('/auth/phone');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Verify your phone</CardTitle>
          <CardDescription className="text-center">
            We've sent a verification code to +91{phone}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="text-center text-xl tracking-widest"
                required
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResendCode}
                className="font-medium text-primary hover:underline"
                disabled={loading}
              >
                Resend code
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
