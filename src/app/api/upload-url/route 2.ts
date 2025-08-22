// app/api/public-key/route.ts (GET)
import { NextResponse } from 'next/server';

export async function GET() {
  const pub = process.env.SERVER_PUBLIC_KEY_PEM;
  if (!pub) return NextResponse.json({ error: 'No pubkey' }, { status: 500 });
  return NextResponse.json({ publicKey: pub });
}
