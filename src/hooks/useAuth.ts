import { useState, useEffect } from 'react';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  signOut as firebaseSignOut,
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export const useAuth = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Initialize reCAPTCHA
  const setupRecaptcha = (containerId: string) => {
    if (typeof window === 'undefined') return;
    
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      containerId,
      {
        size: 'invisible',
      }
    );
  };

  // Send OTP to phone number
  const sendOTP = async (phoneNumber: string, containerId: string = 'recaptcha-container') => {
    try {
      setupRecaptcha(containerId);
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      return true;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  };

  // Verify OTP
  const verifyOTP = async (code: string) => {
    try {
      if (!confirmationResult) throw new Error('No confirmation result');
      await confirmationResult.confirm(code);
      return true;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    sendOTP,
    verifyOTP,
    signOut,
    isAuthenticated: !!user
  };
};

export default useAuth;
