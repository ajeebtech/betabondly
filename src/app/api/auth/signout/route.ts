import { NextResponse } from 'next/server';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

export async function POST() {
  try {
    await signOut(auth);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error signing out:', error);
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}
