// Google Sign-In - super simple, no bullshit
import { auth, googleProvider } from './firebase';
import { signInWithPopup } from 'firebase/auth';

export const simpleGoogleAuth = {
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      console.log('Google sign-in successful:', user);
      return user;
      
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }
};
