'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { simpleGoogleAuth } from '@/lib/simpleGoogleAuth';
import { toast } from 'sonner';

interface GoogleSignInButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
  children?: React.ReactNode;
  className?: string;
}

export function GoogleSignInButton({ 
  onSuccess, 
  onError, 
  children = "Continue with Google",
  className 
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      const user = await simpleGoogleAuth.signInWithGoogle();
      
      console.log('GoogleSignInButton: Received user:', user);
      console.log('GoogleSignInButton: User type:', typeof user);
      console.log('GoogleSignInButton: User is null?', user === null);
      
      // For redirect flow, user will be null and page will redirect
      if (!user) {
        console.log('Redirecting to Google sign-in...');
        toast.info('Redirecting to Google sign-in...');
        return;
      }
      
      // Extract user info for popup flow
      const userInfo = {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
        phone: user.phoneNumber,
      };
      
      console.log('GoogleSignInButton: Extracted userInfo:', userInfo);
      
      toast.success('Signed in successfully!');
      
      console.log('GoogleSignInButton: onSuccess callback exists?', !!onSuccess);
      if (onSuccess) {
        console.log('GoogleSignInButton: Calling onSuccess callback');
        try {
          await onSuccess(userInfo);
          console.log('GoogleSignInButton: onSuccess callback completed');
        } catch (callbackError) {
          console.error('GoogleSignInButton: onSuccess callback error:', callbackError);
          throw callbackError; // Re-throw to be caught by outer catch
        }
      } else {
        console.log('GoogleSignInButton: No onSuccess callback provided');
      }
      
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      let errorMessage = 'Sign-in failed. Please try again.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up was blocked. Please allow pop-ups and try again.';
      }
      
      toast.error(errorMessage);
      
      if (onError) {
        onError(error);
      }
      
    } finally {
      console.log('GoogleSignInButton: Setting loading to false');
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className={`w-full h-12 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900 transition-all duration-200 shadow-sm hover:shadow-md ${className}`}
      variant="outline"
    >
      {loading ? (
        <div className="flex items-center justify-center space-x-3">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="font-medium">Signing in...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center space-x-3">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="font-medium">{children}</span>
        </div>
      )}
    </Button>
  );
}
