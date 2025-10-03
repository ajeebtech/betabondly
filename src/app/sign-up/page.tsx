"use client"

import { useMemo, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { simpleEmailAuth } from '@/lib/simpleEmailAuth'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'
import { auth } from '@/lib/firebase'
import { 
  sendEmailVerification, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth'
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { InviteSection } from '@/components/invite-section';

function getPasswordScore(pw: string) {
  let score = 0
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [name, setName] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const score = useMemo(() => getPasswordScore(password), [password])
  const scoreLabel = useMemo(() => {
    if (!password) return ''
    if (score <= 2) return 'Weak'
    if (score === 3) return 'Medium'
  }, [score, password])

  const canSubmit = name.trim() && email.trim() && password.length >= 8

  // Check if user is verified after email verification
  useEffect(() => {
    const checkAuthState = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Force refresh the user to get the latest email verification status
        await user.reload();
        const updatedUser = auth.currentUser;
        
        if (updatedUser?.emailVerified) {
          setCurrentUser(updatedUser);
          setIsVerified(true);
          
          // Create or update user document in Firestore
          await setDoc(doc(db, 'users', updatedUser.uid), {
            uid: updatedUser.uid,
            displayName: updatedUser.displayName || name || '',
            email: updatedUser.email,
            emailVerified: updatedUser.emailVerified,
            photoURL: updatedUser.photoURL || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        }
      }
    });

    // Check URL for verification redirect
    const handleVerification = async () => {
      const user = auth.currentUser;
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          setCurrentUser(user);
          setIsVerified(true);
          
          // Create or update user document in Firestore
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            displayName: user.displayName || name || '',
            email: user.email,
            emailVerified: user.emailVerified,
            photoURL: user.photoURL || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        }
      }
    };

    handleVerification();
    return () => checkAuthState();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    
    try {
      // Create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (user) {
        // Update the user's display name
        await updateProfile(user, {
          displayName: name,
        });
        
        // Send verification email with a redirect URL
        await sendEmailVerification(user, {
          url: `${window.location.origin}/verify-email?email=${encodeURIComponent(email)}`
        });
        
        // Create user document in Firestore (but mark as unverified)
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          displayName: name,
          email: email,
          emailVerified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        
        // Sign out the user to prevent access before verification
        await auth.signOut();
        
        // Redirect to verification page
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        
        toast.success('Verification email sent! Please check your inbox to verify your email.');
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      toast.error(err?.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  const handleGoogleOnboarding = async (userInfo: any) => {
    // Ensure user doc exists
    const userDocRef = doc(db, 'users', userInfo.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        uid: userInfo.uid,
        displayName: userInfo.name || '',
        email: userInfo.email,
        emailVerified: true,
        photoURL: userInfo.photoURL || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    const data = (await getDoc(userDocRef)).data();
    if (!data?.datingStartDate) {
      router.push('/auth/date');
    } else if (!data?.photoURL) {
      router.push('/auth/photo');
    } else if (data?.coupleId) {
      router.push(`/${data.coupleId}`);
    } else {
      router.push('/');
    }
  };

  if (isVerified && currentUser) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md mb-6">
          <CardHeader className="space-y-2 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
            <CardDescription>Your account has been successfully verified.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleSignIn}
              className="w-full h-11"
            >
              Continue to Sign In
            </Button>
          </CardContent>
        </Card>
        <InviteSection userId={currentUser.uid} />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md border border-muted/40 bg-background/80 backdrop-blur">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-semibold tracking-tight">Create your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" required className="h-11" />
              {password && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Strength: {scoreLabel}</span>
                  <div className="flex gap-1">
                    {[0,1,2,3,4].map((i) => (
                      <span key={i} className={`h-1.5 w-8 rounded ${i < score ? 'bg-emerald-500' : 'bg-muted'}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Button type="submit" className="w-full h-11" disabled={!canSubmit || loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>
          <GoogleSignInButton
            className="w-full h-11"
            onSuccess={handleGoogleOnboarding}
          />
          
          <div className="text-center text-sm mt-4">
            <span className="text-muted-foreground">Already have an account? </span>
            <button 
              type="button" 
              onClick={handleSignIn}
              className="text-primary hover:underline font-medium"
            >
              Sign In
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
