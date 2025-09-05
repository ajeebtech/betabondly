'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import AITextLoading from '@/components/kokonutui/ai-text-loading';

type Message = {
  id: string;
  text: string;
  sender: 'player1' | 'player2';
  timestamp: number;
};

export default function TextGame() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentTurn, setCurrentTurn] = useState<'player1' | 'player2' | null>(null);
  const [playerRole, setPlayerRole] = useState<'player1' | 'player2' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<NodeJS.Timeout>();
  const coupleId = 'default-couple'; // You can make this dynamic based on the URL or user context

  // Fetch messages from the API
  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/couple-messages?coupleId=${coupleId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
      
      // Set the next turn based on the last message or default to player1 if no messages
      if (data.length > 0) {
        const lastMessage = data[data.length - 1];
        setCurrentTurn(lastMessage.sender === 'player1' ? 'player2' : 'player1');
      } else if (currentTurn === null) {
        // Only set initial turn if it hasn't been set yet
        setCurrentTurn('player1');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Initialize player role and fetch messages
  useEffect(() => {
    // Always get the role from the URL first
    const roleFromUrl = searchParams.get('player') as 'player1' | 'player2' | null;
    
    if (roleFromUrl) {
      setPlayerRole(roleFromUrl);
      localStorage.setItem('playerRole', roleFromUrl);
    } else {
      // Fallback to localStorage if no role in URL
      const savedRole = localStorage.getItem('playerRole') as 'player1' | 'player2' | null;
      if (savedRole) {
        setPlayerRole(savedRole);
      }
    }

    // Initial fetch
    fetchMessages();

    // Set up polling to check for new messages
    pollInterval.current = setInterval(fetchMessages, 3000);

    // Clean up interval on unmount
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [searchParams]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim() || !playerRole) return;
    
    // Double-check it's the player's turn
    if (playerRole !== currentTurn) {
      alert(`It's ${currentTurn === 'player1' ? 'Player 1' : 'Player 2'}'s turn!`);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/couple-messages?player=${playerRole}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          coupleId: 'default-couple',
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      // Update the turn immediately for better UX
      setCurrentTurn(prev => prev === 'player1' ? 'player2' : 'player1');
      
      // Refresh messages to get the latest
      await fetchMessages();
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessages = (player: 'player1' | 'player2') => (
    <div className="flex-1 p-4 overflow-y-auto">
      {messages
        .filter(msg => msg.sender === player)
        .map((message) => (
          <div 
            key={message.id}
            className={`mb-2 p-3 rounded-lg max-w-[80%] ${
              message.sender === 'player1' 
                ? 'ml-auto bg-blue-100 text-blue-900' 
                : 'mr-auto bg-gray-100 text-gray-900'
            }`}
          >
            {message.text}
            <div className="text-xs opacity-50 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      <div ref={messagesEndRef} />
    </div>
  );

  if (!playerRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Join as Player</h1>
          <div className="space-y-3">
            <button
              onClick={() => {
                const role = 'player1';
                setPlayerRole(role);
                localStorage.setItem('playerRole', role);
              }}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Join as Player 1
            </button>
            <button
              onClick={() => {
                const role = 'player2';
                setPlayerRole(role);
                localStorage.setItem('playerRole', role);
              }}
              className="w-full px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Join as Player 2
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game master messages that will cycle through
  const gameMasterMessages = [
    'Welcome to the text adventure game!',
    'Take turns sending messages to each other.',
    'The story begins now...',
    'What will you say next?',
    'Be creative with your messages!',
    'The game is afoot!',
    'Let the adventure begin!',
    'Your choices shape the story.'
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-center">Text Adventure Game</h1>
        <div className="text-center text-sm text-gray-500">
          You are: <span className="font-medium">{playerRole?.toUpperCase() || 'Not Selected'}</span>
          {currentTurn && (
            <span> | Current Turn: <span className="font-medium">{currentTurn.toUpperCase()}</span></span>
          )}
        </div>
      </header>
      
      {/* Game Master AI Text */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="text-sm text-gray-500 mb-1">Game Master:</div>
        <AITextLoading 
          texts={gameMasterMessages}
          interval={3000}
          className="text-gray-800 font-medium"
        />
      </div>

      {/* Combined Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex">
          <div className="w-1/2 p-3 bg-blue-500 text-white text-center font-medium">
            Player 1
          </div>
          <div className="w-1/2 p-3 bg-green-500 text-white text-center font-medium">
            Player 2
          </div>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Combined Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {[...messages]
              .sort((a, b) => a.timestamp - b.timestamp)
              .map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${
                    message.sender === 'player1' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'player1'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-green-100 text-green-900'
                    }`}
                  >
                    <div className="text-sm">{message.text}</div>
                    <div className="text-xs opacity-50 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="mt-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              !playerRole 
                ? 'Select your player role above' 
                : playerRole === currentTurn
                  ? 'Your turn! Type a message...'
                  : `Waiting for ${currentTurn === 'player1' ? 'Player 1' : 'Player 2'}...`
            }
            disabled={!playerRole || playerRole !== currentTurn || isLoading}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || !playerRole || playerRole !== currentTurn || isLoading}
            className={`px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              isLoading ? 'opacity-70' : ''
            }`}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
