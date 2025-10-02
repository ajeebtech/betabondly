import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { generateInviteCode, getInviteLink } from '@/lib/inviteUtils';

export async function POST() {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const code = await generateInviteCode(currentUser.uid);
    const inviteLink = getInviteLink(code);
    
    return NextResponse.json({ code, inviteLink });
  } catch (error) {
    console.error('Error generating invite code:', error);
    return NextResponse.json(
      { error: 'Failed to generate invite code' },
      { status: 500 }
    );
  }
}
