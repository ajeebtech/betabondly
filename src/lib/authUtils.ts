// src/lib/authUtils.ts
import { auth } from './firebase';

/**
 * Ensures the current user has a valid Firebase token
 * Returns true if token is valid, false if refresh failed
 */
export async function ensureValidToken(): Promise<boolean> {
  const user = auth.currentUser;
  
  if (!user) {
    console.log('❌ No user found');
    return false;
  }

  try {
    // Force refresh the token
    await user.getIdToken(true);
    console.log('✅ Token refreshed successfully');
    return true;
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    return false;
  }
}

/**
 * Checks if the user is authenticated and has a valid token
 * Automatically refreshes the token if needed
 */
export async function checkAuthWithTokenRefresh(): Promise<boolean> {
  const user = auth.currentUser;
  
  if (!user) {
    return false;
  }

  try {
    // Try to get a fresh token
    await user.getIdToken(true);
    return true;
  } catch (error) {
    console.error('❌ Authentication check failed:', error);
    return false;
  }
}
