import { NextResponse } from 'next/server';
import { isUserConnected } from '@/lib/google/oauth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const connected = await isUserConnected(session.user.id);
    return NextResponse.json({ connected });
  } catch (error) {
    console.error('Error checking Google Calendar status:', error);
    return NextResponse.json(
      { error: 'Failed to check Google Calendar status' },
      { status: 500 }
    );
  }
}
