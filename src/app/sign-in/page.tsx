"use client"

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function SignInPage() {
  const router = useRouter()

  const handleGoogleOnboarding = async (userInfo: any) => {
    console.log('Starting Google onboarding for user:', userInfo);
    console.log('Current environment:', process.env.NODE_ENV);
    console.log('Current URL:', window.location.href);
    
    // Check Firebase auth state
    console.log('Current Firebase auth user:', auth.currentUser);
    console.log('Auth user email:', auth.currentUser?.email);
    console.log('Auth user UID:', auth.currentUser?.uid);
    
    const userDocRef = doc(db, 'users', userInfo.uid);
    
    try {
      // Ensure user doc exists
      console.log('Checking if user document exists...');
      const userDocSnap = await getDoc(userDocRef);
      console.log('User document exists:', userDocSnap.exists());
      
      if (!userDocSnap.exists()) {
        const userData = {
          uid: userInfo.uid,
          email: userInfo.email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          displayName: userInfo.name || '',
          emailVerified: true,
          photoURL: userInfo.photoURL || null,
        };
        
        console.log('Creating new user document with data:', userData);
        console.log('Firestore instance:', db);
        console.log('Document reference:', userDocRef);
        
        await setDoc(userDocRef, userData);
        console.log('✅ User document created successfully');
        
        // Verify the document was created
        const verifyDoc = await getDoc(userDocRef);
        console.log('✅ Document verification:', verifyDoc.exists());
        if (verifyDoc.exists()) {
          console.log('✅ Document data:', verifyDoc.data());
        }
      } else {
        console.log('User document already exists');
      }
    } catch (error) {
      console.error('❌ Error creating user document:', error);
      console.error('❌ Error details:', {
        code: (error as any)?.code,
        message: (error as any)?.message,
        stack: (error as any)?.stack,
        name: (error as any)?.name
      });
      
      // Check if it's a Firestore rules error
      if ((error as any)?.code === 'permission-denied') {
        console.error('❌ FIRESTORE RULES ERROR: Permission denied');
        alert('Permission denied by Firestore rules. Check console for details.');
      } else if ((error as any)?.code === 'unavailable') {
        console.error('❌ FIRESTORE CONNECTION ERROR: Service unavailable');
        alert('Firestore service unavailable. Check your internet connection.');
      }
      
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