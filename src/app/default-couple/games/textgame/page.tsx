'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import AITextLoading from '@/components/kokonutui/ai-text-loading';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini model
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// Initialize the model
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    maxOutputTokens: 150,
    temperature: 0.8,
  },
});

type Message = {
  id: string;
  text: string;
  sender: 'player1' | 'player2' | 'gameMaster';
  timestamp: number;
};

export default function TextGame() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentTurn, setCurrentTurn] = useState<'player1' | 'player2' | null>(null);
  const [playerRole, setPlayerRole] = useState<'player1' | 'player2' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAITyping, setIsAITyping] = useState(false);
  const searchParams = useSearchParams();
  
  // Generate a response from the game master AI
  const generateGameMasterResponse = useCallback(async (conversation: Message[]) => {
    if (!conversation.length) return null;
    
    try {
      setIsAITyping(true);
      
      // Format conversation for the model
      const chatHistory = conversation.map(msg => ({
        role: msg.sender === 'player1' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      
      // System prompt
      const systemPrompt = `You are the Game Master for a text adventure game. 
        Provide brief, engaging responses that move the story forward. 
        Be creative and adapt to the players' choices.`;
      
      // Start a chat session
      const chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          },
          {
            role: 'model',
            parts: [{ text: 'I am ready to be your Game Master. Let the adventure begin!' }]
          },
          ...chatHistory
        ]
      });
      
      // Get the last message for context
      const lastMessage = conversation[conversation.length - 1].text;
      const result = await chat.sendMessage(lastMessage);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating AI response:', error);
      return 'The game master is thinking...';
    } finally {
      setIsAITyping(false);
    }
  }, []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<NodeJS.Timeout>();
  const coupleId = 'default-couple'; // You can make this dynamic based on the URL or user context

  // Render the game master's message with AITextLoading
  const renderGameMasterMessage = () => {
    const gameMasterMessages = messages.filter(msg => msg.sender === 'gameMaster');
    const lastMessage = gameMasterMessages[gameMasterMessages.length - 1];
    
    return (
      <div className="w-full p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg mb-4 border border-gray-200 dark:border-gray-700">
        <div className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 dark:from-gray-300 dark:via-gray-400 dark:to-gray-300 mb-2">
          Game Master
        </div>
        {isAITyping ? (
          <AITextLoading 
            texts={[
              "Crafting your adventure...",
              "Weaving the story...",
              "Summoning magic...",
              "Consulting the ancient tomes..."
            ]}
            className="text-2xl"
          />
        ) : lastMessage ? (
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-gray-100 dark:via-gray-300 dark:to-gray-100 text-lg">
            {lastMessage.text}
          </div>
        ) : (
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400 dark:from-gray-500 dark:via-gray-400 dark:to-gray-500">
            The game master is waiting to begin your adventure...
          </div>
        )}
      </div>
    );
  };

  // Fetch messages from the API
  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/couple-messages?coupleId=${coupleId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
      
      // Set the next turn based on the last message or default to player1 if no messages
      if (data.length > 0) {
        const lastMessage = data[data.length - 1];
        const nextTurn = lastMessage.sender === 'player1' ? 'player2' : 'player1';
        setCurrentTurn(nextTurn);
        
        // Generate game master response after both players have spoken
        if (data.length >= 2) {
          const aiResponse = await generateGameMasterResponse(data);
          if (aiResponse) {
            // Add game master message to the conversation
            const newMessage: Message = {
              id: Date.now().toString(),
              text: aiResponse,
              sender: 'gameMaster',
              timestamp: Date.now()
            };
            
            // Save to the database
            await fetch(`/api/couple-messages?coupleId=${coupleId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newMessage)
            });
            
            // Update local state
            setMessages(prev => [...prev, newMessage]);
          }
        }
      } else if (currentTurn === null) {
        // Only set initial turn if it hasn't been set yet
        setCurrentTurn('player1');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [coupleId, currentTurn, generateGameMasterResponse]);

  // Initialize player role and fetch messages
  useEffect(() => {
    // Always get the role from the URL first
    const roleFromUrl = searchParams.get('player') as 'player1' | 'player2' | null;
    
    // Then check localStorage
    const savedRole = localStorage.getItem('playerRole') as 'player1' | 'player2' | null;
    
    // Priority: URL > localStorage > null
    const role = roleFromUrl || savedRole;
    
    if (role) {
      setPlayerRole(role);
      localStorage.setItem('playerRole', role);
    }
    
    // Initial fetch
    fetchMessages();
    
    // Set up polling
    pollInterval.current = setInterval(fetchMessages, 3000);
    
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [searchParams, fetchMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send a new message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim() || !playerRole || playerRole !== currentTurn) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: playerRole,
      timestamp: Date.now()
    };
    
    try {
      setIsLoading(true);
      
      // Save to the database
      const response = await fetch(`/api/couple-messages?player=${playerRole}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          coupleId: coupleId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      // Update local state
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      setCurrentTurn(prev => prev === 'player1' ? 'player2' : 'player1');
      
      // Fetch messages to update the conversation and trigger AI response
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error instanceof Error ? error.message : 'Failed to send message');
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

  // Initial game master message
  const gameMasterMessages = [
    'Welcome to the text adventure game! I\'ll be your guide.',
    'The story is about to unfold...',
    'The game master is observing the conversation...'
  ];

  return (
    <div className="flex flex-col h-full">
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
      {renderGameMasterMessage()}

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
