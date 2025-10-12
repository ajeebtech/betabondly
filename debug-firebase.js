// Production Debug Helper
// Add this to your browser console in production to debug the issue

window.debugFirebase = function() {
  console.log('🔍 Firebase Debug Information');
  console.log('============================');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('  NODE_ENV:', process.env.NODE_ENV);
  console.log('  Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  console.log('  Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
  console.log('  API Key Present:', !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  console.log('  App ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID);
  
  // Check current URL
  console.log('Current URL:', window.location.href);
  console.log('Domain:', window.location.hostname);
  
  // Check if Firebase is initialized
  if (window.firebase) {
    console.log('Firebase SDK loaded:', true);
  } else {
    console.log('Firebase SDK loaded:', false);
  }
  
  // Test Firestore connection
  console.log('Testing Firestore connection...');
  
  // You can run this in the browser console to test
  return {
    env: {
      nodeEnv: process.env.NODE_ENV,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    },
    url: {
      href: window.location.href,
      hostname: window.location.hostname,
      origin: window.location.origin
    },
    firebase: {
      sdkLoaded: !!window.firebase
    }
  };
};

// Usage: Run this in browser console in production
// window.debugFirebase()
