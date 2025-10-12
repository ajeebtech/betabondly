// Google Sign-In - using redirect with popup fallback for production reliability
import { auth, googleProvider } from './firebase';
import { signInWithRedirect, getRedirectResult, signInWithPopup } from 'firebase/auth';

export const simpleGoogleAuth = {
  async signInWithGoogle() {
    try {
      // Check if we're returning from a redirect
      const result = await getRedirectResult(auth);
      if (result) {
        console.log('Google sign-in successful (redirect):', result.user);
        return result.user;
      }
      
      // Try popup first, fallback to redirect if it fails
      try {
        const popupResult = await signInWithPopup(auth, googleProvider);
        return popupResult.user;
      } catch (popupError) {
        
        // If popup fails, use redirect
        await signInWithRedirect(auth, googleProvider);
        
        // This will redirect the page, so we won't reach here
        return null;
      }
      
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }
};
