"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { auth } from '@/lib/firebase'
import { sendEmailVerification, onAuthStateChanged, signOut } from 'firebase/auth'
import { toast } from 'sonner'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [email, setEmail] = useState('')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkVerification = async () => {
      try {
        setChecking(true);
        const user = auth.currentUser;
        
        if (!user) {
          // If no user is signed in, redirect to sign-in
          router.push('/sign-in');
          return;
        }
        
        // Force refresh the user's token to get the latest emailVerified status
        await user.reload();
        
        if (user.emailVerified) {
          setIsVerified(true);
          setEmail(user.email || '');
          
          // Create or update user document in Firestore
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            displayName: user.displayName || '',
            email: user.email,
            emailVerified: user.emailVerified,
            photoURL: user.photoURL || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }, { merge: true });
          
          // Sign out the user to force them to sign in again
          await signOut(auth);
        } else {
          setEmail(user.email || '');
        }
      } catch (error) {
        console.error('Error checking verification:', error);
        toast.error('Error checking verification status');
      } finally {
        setChecking(false);
      }
    };
    
    // Check immediately
    checkVerification();
    
    // And then every 3 seconds
    const interval = setInterval(checkVerification, 3000);
    
    return () => clearInterval(interval);
  }, [router]);

  const handleResend = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('Please sign in again to resend verification');
      router.push('/sign-in');
      return;
    }
    
    setLoading(true);
    try {
      await sendEmailVerification(user, {
        url: `${window.location.origin}/verify-email?email=${encodeURIComponent(user.email || '')}`
      });
      toast.success('Verification email resent. Please check your inbox.');
    } catch (e: any) {
      console.error('Error resending verification:', e);
      toast.error(e?.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignIn = () => {
    router.push('/sign-in');
  };

  if (checking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md border border-muted/40 bg-background/80 backdrop-blur">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-semibold">Verifying your email...</CardTitle>
            <CardDescription>
              Please wait while we verify your email address.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md border border-muted/40 bg-background/80 backdrop-blur">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-semibold">Email Verified! ✅</CardTitle>
            <CardDescription className="text-green-500">
              Your email {email} has been successfully verified!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full" 
              onClick={handleSignIn}
              size="lg"
            >
              Continue to Sign In
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              You'll be able to sign in and access your account.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md border border-muted/40 bg-background/80 backdrop-blur">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-semibold">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to <span className="font-medium">{email || 'your email'}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              Please check your inbox and click the verification link to activate your account.
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Didn't receive the email? Check your spam folder or request a new verification email.
            </p>
          </div>
          
          <div className="space-y-2">
            <Button 
              className="w-full" 
              onClick={handleResend} 
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Sending...' : 'Resend Verification Email'}
            </Button>
            
            <Button 
              className="w-full" 
              variant="ghost"
              onClick={handleSignIn}
            >
              Already verified? Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


