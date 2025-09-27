import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let app: App | null = null;

try {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';
  
  // Only initialize Firebase Admin in server-side environments
  if (!isBrowser && !getApps().length) {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!privateKey) {
      console.warn('FIREBASE_ADMIN_PRIVATE_KEY is not set. Firebase Admin will not be initialized.');
    } else {
      const serviceAccount = {
        type: process.env.FIREBASE_ADMIN_TYPE,
        project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
        private_key: privateKey,
        client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_CERT_URL,
        universe_domain: 'googleapis.com',
      };

      app = initializeApp({
        credential: cert(serviceAccount as any),
        databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
      });
    }
  } else if (getApps().length) {
    app = getApps()[0];
  }
} catch (error) {
  console.error('Firebase admin initialization error', error);
}

// Export initialized services or null if initialization failed
const adminAuth = app ? getAuth(app) : null;
const adminDb = app ? getFirestore(app) : null;

export { adminAuth, adminDb };

// Helper function to check if admin is initialized
export function isAdminInitialized() {
  return !!app;
}
