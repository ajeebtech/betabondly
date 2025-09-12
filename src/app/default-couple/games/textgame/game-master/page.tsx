'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

type Message = {
  id: string;
  text: string;
  sender: 'player1' | 'player2' | 'gameMaster';
  timestamp: number;
};

export default function GameMasterConsole() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [coupleId, setCoupleId] = useState('default-couple');
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const pollInterval = useRef<NodeJS.Timeout>();
  const connectionCheckInterval = useRef<NodeJS.Timeout>();

  // Initialize with URL parameter if available
  useEffect(() => {
    const urlCoupleId = searchParams.get('coupleId');
    if (urlCoupleId) {
      setCoupleId(urlCoupleId);
    }
  }, [searchParams]);

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

  // Connect to the game master service
  const connect = async () => {
    try {
      const response = await fetch('/api/game-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupleId })
      });
      
      if (!response.ok) throw new Error('Failed to connect to game master service');
      
      setIsConnected(true);
      fetchMessages();
      
      // Set up polling for new messages
      pollInterval.current = setInterval(fetchMessages, 2000);
      
      // Check connection status periodically
      connectionCheckInterval.current = setInterval(checkConnection, 5000);
      
    } catch (error) {
      console.error('Error connecting to game master service:', error);
      alert('Failed to connect to game master service');
    }
  };

  // Disconnect from the game master service
  const disconnect = () => {
    fetch(`/api/game-master?coupleId=${coupleId}`, {
      method: 'DELETE'
    }).catch(console.error);
    
    setIsConnected(false);
    if (pollInterval.current) clearInterval(pollInterval.current);
    if (connectionCheckInterval.current) clearInterval(connectionCheckInterval.current);
  };

  // Check connection status
  const checkConnection = async () => {
    try {
      const response = await fetch('/api/game-master');
      const data = await response.json();
      const isStillConnected = data.activeCouples.includes(coupleId);
      
      if (!isStillConnected && isConnected) {
        console.log('Connection lost, reconnecting...');
        disconnect();
        connect();
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  // Toggle connection
  const toggleConnection = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  // Send a message as the game master
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !isConnected) return;
    
    const message: Message = {
      id: `gm-${Date.now()}`,
      text: inputText,
      sender: 'gameMaster',
      timestamp: Date.now()
    };
    
    try {
      // Optimistically update UI
      setMessages(prev => [...prev, message]);
      setInputText('');
      
      // Send to server
      const response = await fetch(`/api/couple-messages?coupleId=${coupleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...message,
          coupleId,
          sender: 'gameMaster' as const
        })
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      
      // Refresh messages to ensure consistency
      fetchMessages();
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
      // Revert optimistic update on error
      setMessages(prev => prev.filter(m => m.id !== message.id));
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
      if (connectionCheckInterval.current) clearInterval(connectionCheckInterval.current);
      
      // Disconnect when component unmounts
      if (isConnected) {
        disconnect();
      }
    };
  }, [coupleId]);

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Game Master Console</h1>
            <div className="flex items-center mt-1">
              <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm bg-gray-100 px-3 py-1 rounded-full">
              Couple ID: <span className="font-mono font-medium">{coupleId}</span>
            </div>
            <button
              onClick={toggleConnection}
              className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
                isConnected
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col bg-gray-50 rounded-lg border border-gray-200">
          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                {isConnected ? 'No messages yet. Start the conversation!' : 'Connect to view messages'}
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'gameMaster' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'gameMaster'
                        ? 'bg-blue-100 text-blue-900 rounded-br-none'
                        : message.sender === 'player1'
                        ? 'bg-green-100 text-green-900 rounded-bl-none'
                        : 'bg-purple-100 text-purple-900 rounded-bl-none'
                    }`}
                  >
                    <div className="font-medium text-xs text-gray-600 mb-1">
                      {message.sender === 'gameMaster'
                        ? 'You (Game Master)'
                        : message.sender === 'player1'
                        ? 'Player 1'
                        : 'Player 2'}
                    </div>
                    <div className="text-sm">{message.text}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={sendMessage} className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message as Game Master..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isConnected}
              />
              <button
                type="submit"
                disabled={!isConnected || !inputText.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Status bar */}
        <div className="mt-4 text-sm text-gray-600 flex justify-between items-center">
          <div>
            {isConnected ? (
              <span className="text-green-600">Connected to game session</span>
            ) : (
              <span className="text-red-600">Disconnected</span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            Messages: {messages.length} | Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}
