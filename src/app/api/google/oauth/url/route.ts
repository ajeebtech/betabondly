import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google/oauth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const url = await getAuthUrl(session.user.id);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
