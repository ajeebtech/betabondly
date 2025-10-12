// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  GoogleAuthProvider
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Extend the Window interface to include Firebase reCAPTCHA verifier
declare global {
  interface Window {
    recaptchaVerifier: any; // Using any to match Firebase's expected type
    confirmationResult: any;
  }
}

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('Missing required Firebase configuration. Please check your environment variables.');
}

// Initialize Firebase with explicit configuration
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Create a fresh Google provider instance
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.addScope('https://www.googleapis.com/auth/calendar');
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');

// Debug: Log the configuration being used
if (typeof window !== 'undefined') {
  console.log('🔥 Firebase Config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    apiKey: firebaseConfig.apiKey ? 'Present' : 'Missing',
    appId: firebaseConfig.appId,
    environment: process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === 'production',
    currentUrl: window.location.href
  });
  
  // Check if any required config is missing
  const missingConfig = [];
  if (!firebaseConfig.apiKey) missingConfig.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!firebaseConfig.authDomain) missingConfig.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!firebaseConfig.projectId) missingConfig.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  
  if (missingConfig.length > 0) {
    console.error('❌ Missing Firebase environment variables:', missingConfig);
  } else {
    console.log('✅ All Firebase environment variables are present');
  }
  
  // Test Firestore connection
  console.log('🔥 Firestore instance created:', !!db);
}

// Initialize reCAPTCHA
const initRecaptcha = (containerId: string = 'recaptcha-container'): RecaptchaVerifier => {
  if (typeof window === 'undefined') {
    throw new Error('Cannot initialize reCAPTCHA on server side');
  }

  // Check if reCAPTCHA site key is available
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!recaptchaSiteKey) {
    throw new Error('reCAPTCHA site key not configured. Please add NEXT_PUBLIC_RECAPTCHA_SITE_KEY to your environment variables.');
  }

  // Clear existing reCAPTCHA if any
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    } catch (error) {
      console.warn('Error clearing existing reCAPTCHA:', error);
    }
  }

  try {
    console.log('Initializing reCAPTCHA with container:', containerId);
    console.log('Using reCAPTCHA site key:', recaptchaSiteKey);
    
    // Create new reCAPTCHA verifier
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      containerId,
      {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA verified successfully');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
          }
        },
        'error-callback': (error: Error) => {
          console.error('reCAPTCHA error:', error);
        }
      }
    );

    console.log('reCAPTCHA verifier created successfully');
    return window.recaptchaVerifier;
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to initialize reCAPTCHA:', {
      error: errorMessage,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      recaptchaSiteKey: recaptchaSiteKey
    });
    throw new Error(`Failed to initialize security check: ${errorMessage}`);
  }
};

export { 
  auth, 
  db,
  storage,
  googleProvider,
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  PhoneAuthProvider, 
  signInWithCredential,
  initRecaptcha,
  app
};

export default app;