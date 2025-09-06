import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return new NextResponse(
    JSON.stringify({ 
      status: 'WebSocket endpoint',
      message: 'This is a WebSocket endpoint. For WebSocket functionality, please use a WebSocket client to connect to this endpoint.'
    }),
    { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}
