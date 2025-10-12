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
        console.log('Attempting popup sign-in...');
        const popupResult = await signInWithPopup(auth, googleProvider);
        console.log('Google sign-in successful (popup):', popupResult.user);
        console.log('User details:', {
          uid: popupResult.user.uid,
          email: popupResult.user.email,
          displayName: popupResult.user.displayName,
          photoURL: popupResult.user.photoURL,
          emailVerified: popupResult.user.emailVerified
        });
        return popupResult.user;
      } catch (popupError) {
        console.log('Popup failed, falling back to redirect:', popupError);
        
        // If popup fails, use redirect
        console.log('Starting Google sign-in redirect...');
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
