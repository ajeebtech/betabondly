// Production Environment Check Script
// Add this to your production app to debug environment variables

export function checkProductionEnvironment() {
  console.log('🔍 Production Environment Check');
  console.log('================================');
  
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];
  
  const missing = [];
  const present = [];
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      missing.push(varName);
    } else {
      present.push(varName);
    }
  });
  
  console.log('✅ Present variables:', present);
  if (missing.length > 0) {
    console.error('❌ Missing variables:', missing);
  }
  
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  
  return {
    allPresent: missing.length === 0,
    missing,
    present
  };
}

// Add this to your sign-in page for debugging
export function debugUserCreation(userInfo: any) {
  console.log('🐛 User Creation Debug Info');
  console.log('============================');
  console.log('User Info:', userInfo);
  console.log('Auth State:', auth.currentUser);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
}
