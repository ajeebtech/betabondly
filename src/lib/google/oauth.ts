import { google } from 'googleapis';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NEXT_PUBLIC_APP_URL + '/api/google/oauth/callback'
);

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

export async function getAuthUrl(userId: string) {
  const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state,
    prompt: 'consent',
  });
}

export async function exchangeCodeForTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function saveTokens(userId: string, tokens: any) {
  if (!adminAuth) {
    console.error('Firebase Admin is not initialized');
    throw new Error('Service unavailable');
  }
  
  try {
    const userRef = await adminAuth.getUser(userId);
    
    // Store tokens in the user's custom claims or your database
    await adminAuth.setCustomUserClaims(userId, {
      ...userRef.customClaims,
      googleTokens: tokens
    });
  } catch (error) {
    console.error('Error saving tokens:', error);
    throw error;
  }
}

export async function getTokens(userId: string) {
  if (!adminAuth) {
    console.error('Firebase Admin is not initialized');
    return null;
  }
  
  try {
    const user = await adminAuth.getUser(userId);
    return (user.customClaims as any)?.googleTokens || null;
  } catch (error) {
    console.error('Error getting tokens:', error);
    return null;
  }
}

export async function isUserConnected(userId: string) {
  if (!adminAuth) {
    console.warn('Firebase Admin is not initialized - cannot check user connection');
    return false;
  }
  
  try {
    const user = await adminAuth.getUser(userId);
    return !!(user.customClaims as any)?.googleTokens?.access_token;
  } catch (error) {
    console.error('Error checking user connection:', error);
    return false;
  }
}
