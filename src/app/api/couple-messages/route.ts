import { NextResponse } from 'next/server';

type Message = {
  id: string;
  text: string;
  sender: 'player1' | 'player2';
  timestamp: number;
  coupleId: string;
};

// In-memory store for development
const messageStore: Record<string, Message[]> = {};

// Helper to get messages for a couple
function getMessages(coupleId: string): Message[] {
  if (!messageStore[coupleId]) {
    messageStore[coupleId] = [];
  }
  return messageStore[coupleId];
}

// Helper to save a message
function saveMessage(message: Omit<Message, 'id' | 'timestamp'>): Message {
  const newMessage: Message = {
    ...message,
    id: Date.now().toString(),
    timestamp: Date.now(),
  };

  const messages = getMessages(message.coupleId);
  messages.push(newMessage);
  messageStore[message.coupleId] = messages;
  
  return newMessage;
}

export async function POST(request: Request) {
  try {
    const { text, coupleId } = await request.json();
    const url = new URL(request.url);
    const player = url.searchParams.get('player');
    
    if (!text || !coupleId || !player) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (player !== 'player1' && player !== 'player2') {
      return NextResponse.json(
        { error: 'Invalid player' },
        { status: 400 }
      );
    }
    
    const sender = player as 'player1' | 'player2';

    // Get existing messages to determine the next turn
    const messages = getMessages(coupleId);
    
    // If there are previous messages, check if it's the sender's turn
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // If the last message was from the same player, it's not their turn
      if (lastMessage.sender === sender) {
        return NextResponse.json(
          { error: 'Wait for the other player\'s turn' },
          { status: 400 }
        );
      }
    } else if (sender !== 'player1') {
      // If no messages yet, only player1 can start
      return NextResponse.json(
        { error: 'Player 1 must start the game' },
        { status: 400 }
      );
    }

    const message = await saveMessage({
      text,
      sender,
      coupleId,
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error handling message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coupleId = searchParams.get('coupleId');

    if (!coupleId) {
      return NextResponse.json(
        { error: 'coupleId is required' },
        { status: 400 }
      );
    }

    const messages = await getMessages(coupleId);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
