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
    console.log('Starting Google onboarding for user:', userInfo);
    const userDocRef = doc(db, 'users', userInfo.uid);
    
    try {
      // Ensure user doc exists
      console.log('Checking if user document exists...');
      const userDocSnap = await getDoc(userDocRef);
      console.log('User document exists:', userDocSnap.exists());
      
      if (!userDocSnap.exists()) {
        console.log('Creating new user document with data:', {
          uid: userInfo.uid,
          email: userInfo.email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          displayName: userInfo.name || '',
          emailVerified: true,
          photoURL: userInfo.photoURL || null,
        });
        
        await setDoc(userDocRef, {
          uid: userInfo.uid,
          email: userInfo.email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          displayName: userInfo.name || '',
          emailVerified: true,
          photoURL: userInfo.photoURL || null,
        });
        console.log('User document created successfully');
      } else {
        console.log('User document already exists');
      }
    } catch (error) {
      console.error('Error creating user document:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
    
    console.log('Fetching user data for onboarding...');
    const data = (await getDoc(userDocRef)).data();
    console.log('User data:', data);
    
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
            onSuccess={async (userInfo) => {
              try {
                await handleGoogleOnboarding(userInfo);
              } catch (error) {
                console.error('Onboarding failed:', error);
                alert('Failed to create user account. Please try again.');
              }
            }}
            onError={(error) => {
              console.error('Google sign-in error:', error);
            }}
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