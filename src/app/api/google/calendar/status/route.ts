import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTokens } from '@/lib/google/oauth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ connected: false, error: 'Not authenticated' });
    }

    // Check if user has valid Google Calendar tokens
    const tokens = await getTokens(session.user.id);
    const connected = !!tokens && !!tokens.access_token;

    return NextResponse.json({ 
      connected,
      hasRefreshToken: !!tokens?.refresh_token 
    });

  } catch (error) {
    console.error('Error checking calendar status:', error);
    return NextResponse.json({ 
      connected: false, 
      error: 'Failed to check calendar status' 
    });
  }
}
