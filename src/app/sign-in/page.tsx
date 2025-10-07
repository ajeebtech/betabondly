"use client"

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function SignInPage() {
  const router = useRouter()

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
    
    // Check onboarding progress - prioritize missing required fields
    if (!data?.datingStartDate) {
      router.push('/auth/date');
    } else if (!data?.inviteCode) {
      router.push('/auth/invite');
    } else if (data?.coupleId) {
      router.push(`/${data.coupleId}`);
    } else {
      router.push('/default-couple');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md border border-muted/40 bg-background/80 backdrop-blur">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-semibold tracking-tight">Sign in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <GoogleSignInButton
            className="w-full h-11"
            onSuccess={handleGoogleOnboarding}
          />

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="underline underline-offset-4 hover:text-foreground">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}