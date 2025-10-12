"use client"

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'
import { db, auth, app } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { useEffect } from 'react';

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
      console.log('Current URL:', window.location.href);
      console.log('Expected Auth Domain:', `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`);
      
      // Check if auth domain matches
      const expectedAuthDomain = `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`;
      if (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN !== expectedAuthDomain) {
        console.warn('⚠️ Auth domain mismatch:', {
          expected: expectedAuthDomain,
          actual: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
        });
      }
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
    
    // Wait for auth state to be ready if needed
    if (!auth.currentUser && userInfo.uid) {
      console.log('⏳ Waiting for auth state to be ready...');
      await new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            console.log('✅ Auth state ready:', user.uid);
            unsubscribe();
            resolve(user);
          }
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          console.log('⏰ Auth state timeout, proceeding with userInfo');
          unsubscribe();
          resolve(null);
        }, 5000);
      });
    }
    
    const userDocRef = doc(db, 'users', userInfo.uid);
    let userData = null;
    
    try {
      // Test Firebase connection and authentication
      console.log('Testing Firebase connection...');
      
      // Test 1: Check if Firebase is properly initialized
      console.log('Firebase app initialized:', !!app);
      console.log('Auth instance:', !!auth);
      console.log('Firestore instance:', !!db);
      
      // Test 2: Check authentication state
      console.log('Auth current user:', auth.currentUser);
      console.log('Auth state ready:', auth.currentUser !== undefined);
      
      // Test 3: Test Firestore connection
      console.log('Testing Firestore connection...');
      try {
        const testDoc = doc(db, 'test', 'connection');
        await getDoc(testDoc);
        console.log('✅ Firestore connection test successful');
      } catch (testError) {
        console.error('❌ Firestore connection test failed:', testError);
        console.error('Test error details:', {
          code: (testError as any)?.code,
          message: (testError as any)?.message
        });
      }
      
      // First, try client-side creation
      console.log('Attempting client-side user creation...');
      console.log('Checking if user document exists...');
      console.log('UserDocRef path:', userDocRef.path);
      console.log('UserDocRef id:', userDocRef.id);
      
      const userDocSnap = await getDoc(userDocRef);
      console.log('User document exists:', userDocSnap.exists());
      console.log('User document data:', userDocSnap.data());
      
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
        console.log('Data keys:', Object.keys(userDataToCreate));
        console.log('Required fields check:');
        console.log('  Has uid:', 'uid' in userDataToCreate);
        console.log('  Has email:', 'email' in userDataToCreate);
        console.log('  Has createdAt:', 'createdAt' in userDataToCreate);
        console.log('Firestore instance:', db);
        console.log('Document reference:', userDocRef);
        console.log('Auth state:', auth.currentUser?.uid);
        console.log('UserInfo UID:', userInfo.uid);
        console.log('Auth state matches userInfo:', auth.currentUser?.uid === userInfo.uid);
        
        // Test write permissions first
        console.log('Testing write permissions...');
        try {
          const testWriteDoc = doc(db, 'test', 'write-permission');
          await setDoc(testWriteDoc, { test: true, timestamp: serverTimestamp() });
          console.log('✅ Write permission test successful');
          
          // Clean up test document
          await deleteDoc(testWriteDoc);
          console.log('✅ Test document cleaned up');
        } catch (writeError) {
          console.error('❌ Write permission test failed:', writeError);
          console.error('Write error details:', {
            code: (writeError as any)?.code,
            message: (writeError as any)?.message
          });
        }
        
        console.log('Attempting to create user document...');
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
          console.error('🔒 PERMISSION DENIED - Possible causes:');
          console.error('  1. Firestore rules not deployed');
          console.error('  2. Wrong Firebase project');
          console.error('  3. Domain not authorized');
          console.error('  4. User not authenticated');
        } else if ((error as any)?.code === 'unavailable') {
          console.error('🌐 SERVICE UNAVAILABLE - Possible causes:');
          console.error('  1. Wrong Firebase project ID');
          console.error('  2. Network connectivity issues');
          console.error('  3. Firebase service down');
        } else if ((error as any)?.code === 'unauthenticated') {
          console.error('🔐 UNAUTHENTICATED - Possible causes:');
          console.error('  1. Authentication state not ready');
          console.error('  2. Google OAuth configuration');
          console.error('  3. Domain not authorized in Firebase Console');
        } else if ((error as any)?.code === 'invalid-argument') {
          console.error('📝 INVALID ARGUMENT - Possible causes:');
          console.error('  1. Missing required fields in user data');
          console.error('  2. Invalid timestamp format');
          console.error('  3. Wrong document structure');
        }
        
        // Additional debugging info
        console.error('🔍 Additional Debug Info:');
        console.error('  Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
        console.error('  Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
        console.error('  Current URL:', window.location.href);
        console.error('  User UID:', userInfo.uid);
        console.error('  Auth State:', auth.currentUser?.uid);
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

  // Handle redirect result when page loads
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('🔄 Redirect result found:', result.user);
          const userInfo = {
            uid: result.user.uid,
            email: result.user.email,
            name: result.user.displayName,
            photoURL: result.user.photoURL,
            phone: result.user.phoneNumber,
          };
          await handleGoogleOnboarding(userInfo);
        }
      } catch (error) {
        console.error('Error handling redirect result:', error);
      }
    };

    handleRedirectResult();
  }, [handleGoogleOnboarding]);

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