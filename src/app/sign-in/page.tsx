"use client"

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function SignInPage() {
  const router = useRouter()

  const handleGoogleOnboarding = async (userInfo: any) => {
    console.log('Starting Google onboarding for user:', userInfo);
    console.log('Current environment:', process.env.NODE_ENV);
    console.log('Current URL:', window.location.href);
    
    // Production debugging
    if (process.env.NODE_ENV === 'production') {
      console.log('🚀 PRODUCTION DEBUG INFO');
      console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
      console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
      console.log('API Key Present:', !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
      console.log('App ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID);
    }
    
    // Check Firebase auth state
    console.log('Current Firebase auth user:', auth.currentUser);
    console.log('Auth user email:', auth.currentUser?.email);
    console.log('Auth user UID:', auth.currentUser?.uid);
    
    // Use the userInfo from the callback instead of auth.currentUser
    // since auth.currentUser might not be updated immediately
    const currentUser = auth.currentUser || userInfo;
    
    // Ensure user is authenticated before proceeding
    if (!currentUser) {
      console.error('❌ User not authenticated');
      return;
    }
    
    const userDocRef = doc(db, 'users', userInfo.uid);
    let userData = null;
    
    try {
      // Test Firestore connection first
      console.log('Testing Firestore connection...');
      try {
        const testDoc = doc(db, 'test', 'connection');
        await getDoc(testDoc);
        console.log('✅ Firestore connection test successful');
      } catch (testError) {
        console.error('❌ Firestore connection test failed:', testError);
      }
      
      // First, try client-side creation
      console.log('Attempting client-side user creation...');
      console.log('Checking if user document exists...');
      const userDocSnap = await getDoc(userDocRef);
      console.log('User document exists:', userDocSnap.exists());
      
      if (!userDocSnap.exists()) {
        const userDataToCreate = {
          uid: userInfo.uid,
          email: userInfo.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          displayName: userInfo.name || '',
          emailVerified: true,
          photoURL: userInfo.photoURL || null,
        };
        
        console.log('Creating new user document with data:', userDataToCreate);
        console.log('Firestore instance:', db);
        console.log('Document reference:', userDocRef);
        console.log('Auth state:', auth.currentUser?.uid);
        console.log('UserInfo UID:', userInfo.uid);
        
        await setDoc(userDocRef, userDataToCreate);
        console.log('✅ User document created successfully (client-side)');
        
        // Verify the document was created
        const verifyDoc = await getDoc(userDocRef);
        console.log('✅ Document verification:', verifyDoc.exists());
        if (verifyDoc.exists()) {
          console.log('✅ Document data:', verifyDoc.data());
        }
      } else {
        console.log('User document already exists');
      }
      
      // Fetch user data for onboarding
      console.log('Fetching user data for onboarding...');
      const data = (await getDoc(userDocRef)).data();
      console.log('User data:', data);
      userData = data;
      
    } catch (error) {
      console.error('❌ Client-side user creation failed:', error);
      console.error('❌ Error details:', {
        code: (error as any)?.code,
        message: (error as any)?.message,
        stack: (error as any)?.stack,
        name: (error as any)?.name
      });
      
      // Production-specific error handling
      if (process.env.NODE_ENV === 'production') {
        console.error('🚀 PRODUCTION ERROR ANALYSIS:');
        console.error('Error Code:', (error as any)?.code);
        console.error('Error Message:', (error as any)?.message);
        
        // Check for common production issues
        if ((error as any)?.code === 'permission-denied') {
          console.error('🔒 PERMISSION DENIED - Check Firestore rules deployment');
        } else if ((error as any)?.code === 'unavailable') {
          console.error('🌐 SERVICE UNAVAILABLE - Check Firebase project configuration');
        } else if ((error as any)?.code === 'unauthenticated') {
          console.error('🔐 UNAUTHENTICATED - Check authentication state');
        }
      }
      
      // Try server-side fallback
      console.log('🔄 Attempting server-side user sync as fallback...');
      try {
        const response = await fetch('/api/sync-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: userInfo.uid,
            email: userInfo.email,
            displayName: userInfo.name,
            photoURL: userInfo.photoURL,
          }),
        });

        const result = await response.json();
        
        if (response.ok) {
          console.log('✅ Server-side user sync successful:', result);
          userData = result.userData;
        } else {
          console.error('❌ Server-side user sync failed:', result);
          throw new Error(result.error || 'Server-side sync failed');
        }
      } catch (serverError) {
        console.error('❌ Server-side fallback also failed:', serverError);
        
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
    }
    
    // Check onboarding progress - prioritize missing required fields
    if (!userData?.datingStartDate) {
      router.push('/auth/date');
    } else if (!userData?.inviteCode) {
      router.push('/auth/invite');
    } else if (userData?.coupleId) {
      router.push(`/${userData.coupleId}`);
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