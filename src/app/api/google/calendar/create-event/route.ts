import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTokens } from '@/lib/google/oauth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventData } = await request.json();
    
    if (!eventData) {
      return NextResponse.json({ error: 'Event data is required' }, { status: 400 });
    }

    // Get user's stored tokens
    const tokens = await getTokens(session.user.id);
    if (!tokens) {
      return NextResponse.json({ error: 'No Google Calendar access. Please reconnect.' }, { status: 401 });
    }

    // Create OAuth2 client with user's tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_APP_URL + '/api/google/oauth/callback'
    );

    oauth2Client.setCredentials(tokens);

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
          error: 'Google Calendar access expired. Please reconnect your account.' 
        }, { status: 401 });
      }
      
      if (error.message.includes('insufficient authentication scopes')) {
        return NextResponse.json({ 
          error: 'Insufficient permissions. Please reconnect with calendar access.' 
        }, { status: 403 });
      }
    }

    return NextResponse.json({ 
      error: 'Failed to create calendar event. Please try again.' 
    }, { status: 500 });
  }
}
