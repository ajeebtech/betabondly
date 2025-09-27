import { NextResponse } from 'next/server';
import { getWebSocketServer } from '@/lib/websocket/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const wss = getWebSocketServer();
  
  if (!wss) {
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
  
  return new NextResponse(
    JSON.stringify({ 
      status: 'success',
      message: 'WebSocket server is running in development mode.'
    }),
    { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}
