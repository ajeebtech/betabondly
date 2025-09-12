'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

type Message = {
  id: string;
  text: string;
  sender: 'player1' | 'player2' | 'gameMaster';
  timestamp: number;
};

export default function GameMaster() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const coupleId = searchParams.get('coupleId') || 'default-couple';
  const pollInterval = useRef<NodeJS.Timeout>();

  // Fetch messages from the API
  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/couple-messages?coupleId=${coupleId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Set up polling for new messages
  useEffect(() => {
    if (!isConnected) return;

    // Initial fetch
    fetchMessages();

    // Set up polling
    pollInterval.current = setInterval(fetchMessages, 2000);

    // Clean up
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [isConnected, coupleId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle connect/disconnect
  const toggleConnection = () => {
    if (isConnected) {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    } else {
      fetchMessages();
    }
    setIsConnected(!isConnected);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Game Master Console</h1>
          <button
            onClick={toggleConnection}
            className={`px-4 py-2 rounded-md text-white ${
              isConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 space-y-2 p-2 bg-gray-50 rounded">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg max-w-[80%] ${
                message.sender === 'gameMaster'
                  ? 'ml-auto bg-blue-100 text-blue-900'
                  : message.sender === 'player1'
                  ? 'mr-auto bg-green-100 text-green-900'
                  : 'mr-auto bg-purple-100 text-purple-900'
              }`}
            >
              <div className="font-medium">
                {message.sender === 'gameMaster'
                  ? 'You (Game Master)'
                  : message.sender === 'player1'
                  ? 'Player 1'
                  : 'Player 2'}
              </div>
              <div>{message.text}</div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="mt-4">
          <div className="text-sm text-gray-600 mb-2">
            Connected to couple: <span className="font-mono">{coupleId}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
