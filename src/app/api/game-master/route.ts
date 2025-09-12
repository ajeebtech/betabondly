import { NextResponse } from 'next/server';

// In-memory store for game master connections
const gameMasterConnections: Record<string, boolean> = {};

export async function POST(request: Request) {
  try {
    const { coupleId } = await request.json();
    
    if (!coupleId) {
      return NextResponse.json(
        { error: 'Missing coupleId' },
        { status: 400 }
      );
    }

    // Register this game master connection
    gameMasterConnections[coupleId] = true;
    
    return NextResponse.json({ 
      success: true,
      message: 'Game master connected',
      coupleId
    });
  } catch (error) {
    console.error('Error in game master connection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coupleId = searchParams.get('coupleId');
    
    if (!coupleId) {
      return NextResponse.json(
        { error: 'Missing coupleId' },
        { status: 400 }
      );
    }

    // Remove this game master connection
    delete gameMasterConnections[coupleId];
    
    return NextResponse.json({ 
      success: true,
      message: 'Game master disconnected',
      coupleId
    });
  } catch (error) {
    console.error('Error in game master disconnection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({
    connectedGames: Object.keys(gameMasterConnections).length,
    activeCouples: Object.keys(gameMasterConnections)
  });
}
