import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { adminAuth } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    console.log('📅 Calendar API: Received request');
    
    const { eventData, idToken } = await request.json();
    
    console.log('📅 Calendar API: Event data:', eventData);
    console.log('📅 Calendar API: Has ID token:', !!idToken);
    
    if (!eventData || !idToken) {
      console.log('📅 Calendar API: Missing required data');
      return NextResponse.json({ error: 'Event data and ID token are required' }, { status: 400 });
    }

    // Verify the Firebase ID token
    console.log('📅 Calendar API: Verifying Firebase token...');
    
    if (!adminAuth) {
      console.log('📅 Calendar API: Firebase Admin not initialized');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;
    
    console.log('📅 Calendar API: User ID:', userId);

    // Check if user has Google Calendar tokens stored
    const user = await adminAuth.getUser(userId);
    const googleTokens = (user.customClaims as any)?.googleTokens;
    
    console.log('📅 Calendar API: Has stored Google tokens:', !!googleTokens);
    
    if (!googleTokens || !googleTokens.access_token) {
      console.log('📅 Calendar API: No Google Calendar tokens found');
      return NextResponse.json({ 
        error: 'Google Calendar access not found. Please connect your Google Calendar first.',
        needsAuth: true 
      }, { status: 401 });
    }

    // Create OAuth2 client with the stored tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_APP_URL + '/api/google/oauth/callback'
    );

    oauth2Client.setCredentials(googleTokens);

    // Create Calendar API instance
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Create the event
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: eventData,
    });

    return NextResponse.json({ 
      success: true, 
      eventId: response.data.id,
      eventUrl: response.data.htmlLink 
    });

  } catch (error) {
    console.error('Error creating calendar event:', error);
    
    // Handle specific Google API errors
    if (error instanceof Error) {
      if (error.message.includes('invalid_grant')) {
        return NextResponse.json({ 
          error: 'Google Calendar access expired. Please sign in again.' 
        }, { status: 401 });
      }
      
      if (error.message.includes('insufficient authentication scopes')) {
        return NextResponse.json({ 
          error: 'Insufficient permissions. Please sign in with Google again to grant calendar access.' 
        }, { status: 403 });
      }
    }

    return NextResponse.json({ 
      error: 'Failed to create calendar event. Please try again.' 
    }, { status: 500 });
  }
}
