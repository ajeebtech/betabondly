'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import AITextLoading from '@/components/kokonutui/ai-text-loading';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

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

// Game master messages for different states
const waitingMessages = [
  'The game master is preparing your adventure...',
  'Gathering magical energies...',
  'The story is being written as we speak...',
  'Setting the stage for your journey...',
  'The game master is watching closely...',
  'Your adventure is being crafted...',
  'The story is taking shape...'
];

export default function TextGame() {
  // State hooks
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentTurn, setCurrentTurn] = useState<'player1' | 'player2' | null>(null);
  const [playerRole, setPlayerRole] = useState<'player1' | 'player2' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAITyping, setIsAITyping] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const lastGameMasterMessageId = useRef<string | null>(null);
  
  // Refs and other hooks
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<NodeJS.Timeout>();
  const coupleId = 'default-couple';
  
  // Check if we should generate a response from the game master
  const shouldGenerateResponse = useCallback((msgs: Message[]) => {
    // Only start after both players have sent at least one message
    const player1Messages = msgs.filter(msg => msg.sender === 'player1').length;
    const player2Messages = msgs.filter(msg => msg.sender === 'player2').length;
    
    // Only generate response if both players have sent at least one message
    // and the last message was from a player (not the game master)
    return player1Messages > 0 && 
           player2Messages > 0 && 
           msgs.length > 0 && 
           msgs[msgs.length - 1].sender !== 'gameMaster';
  }, []);

  // Generate a response from the game master AI
  const generateGameMasterResponse = useCallback(async (conversation: Message[]) => {
    console.log('Generating game master response...');
    if (!conversation.length || !shouldGenerateResponse(conversation)) {
      console.log('Not generating response - no conversation or should not generate');
      return null;
    }
    
    try {
      console.log('Setting AI typing to true');
      setIsAITyping(true);
      
      // Format conversation for the model
      const chatHistory = conversation.map(msg => ({
        role: msg.sender === 'gameMaster' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));
      
      // System prompt
      const systemPrompt = `You are the Game Master for a text adventure game. 
        Provide brief, engaging responses that move the story forward. 
        Be creative and adapt to the players' choices.`;
      
      // Start a chat session with the full conversation history
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
      
      // Get the summary of the conversation so far
      const conversationSummary = conversation
        .map(msg => `${msg.sender}: ${msg.text}`)
        .join('\n');
      
      const prompt = `Here's the conversation so far. Please respond as the game master, 
        considering both players' inputs and moving the story forward:\n\n${conversationSummary}`;
      
      console.log('Sending prompt to AI:', prompt);
      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const responseText = response.text();
      console.log('AI response:', responseText);
      return responseText;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return 'The game master is thinking...';
    } finally {
      console.log('Setting AI typing to false');
      setIsAITyping(false);
    }
  }, [model, shouldGenerateResponse]);

  // Start game function - just mark game as started, no initial messages
  const startGame = useCallback(() => {
    setGameStarted(true);
    setCurrentTurn('player1');
  }, []);

  // Render the game master's message with AITextLoading
  const renderGameMasterMessage = () => {
    console.log('Rendering game master message. isAITyping:', isAITyping);
    console.log('All messages:', messages);
    
    // Get all game master messages in chronological order
    const gameMasterMessages = messages.filter(msg => msg.sender === 'gameMaster');
    const lastGameMasterMessage = gameMasterMessages[gameMasterMessages.length - 1];
    
    console.log('Last game master message:', lastGameMasterMessage);
    
    // If we have a game master message, always show it
    if (lastGameMasterMessage) {
      console.log('Showing game master message:', lastGameMasterMessage.text);
      return (
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-purple-700">Game Master</div>
          </div>
          <div className="text-gray-800 text-base leading-relaxed">
            {lastGameMasterMessage.text}
          </div>
        </div>
      );
    }
    
    // If AI is typing but we don't have a message yet, show loading
    if (isAITyping) {
      console.log('AI is typing, showing loading state');
      return (
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-sm font-semibold text-purple-700">Game Master is thinking...</div>
          </div>
          <AITextLoading 
            texts={waitingMessages}
            className="text-gray-800 text-base leading-relaxed"
          />
        </div>
      );
    }
    
    // Otherwise, show loading animation with waiting messages
    return (
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-2xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-sm font-semibold text-purple-700">Game Master is thinking...</div>
        </div>
        <AITextLoading 
          texts={waitingMessages}
          className="text-gray-800 text-base leading-relaxed"
        />
      </div>
    );
  };

  // Fetch messages from the API
  const fetchMessages = useCallback(async (forceUpdate = false) => {
    try {
      // Add cache-busting parameter to prevent stale data
      const response = await fetch(`/api/couple-messages?coupleId=${coupleId}&_t=${Date.now()}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const newMessages = await response.json();
      
      // Only update if messages have actually changed or if forced
      setMessages(prevMessages => {
        // If no messages yet, always update
        if (prevMessages.length === 0) return newMessages;
        
        // Check if messages are different
        const prevIds = new Set(prevMessages.map(m => m.id));
        const hasNewMessages = newMessages.some((msg: Message) => !prevIds.has(msg.id));
        const hasDifferentLength = newMessages.length !== prevMessages.length;
        
        if (forceUpdate || hasNewMessages || hasDifferentLength) {
          console.log('Updating messages with new data');
          return newMessages;
        }
        
        console.log('Skipping message update - no changes detected');
        return prevMessages;
      });
      
      // Handle initial turn setup if needed
      if (currentTurn === null) {
        setCurrentTurn('player1');
        return;
      }
      
      // Check if we should generate a game master response
      const shouldRespond = shouldGenerateResponse(newMessages);
      if (shouldRespond && !isAITyping) {
        console.log('Generating game master response...');
        setIsAITyping(true);
        
        try {
          const aiResponse = await generateGameMasterResponse(newMessages);
          if (aiResponse) {
            const gameMasterMessage: Message = {
              id: `gm-${Date.now()}`,
              text: aiResponse,
              sender: 'gameMaster',
              timestamp: Date.now()
            };
            
            // Save to database
            const saveResponse = await fetch(`/api/couple-messages?coupleId=${coupleId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(gameMasterMessage)
            });
            
            if (saveResponse.ok) {
              // Update local state with the saved message
              const savedMessage = await saveResponse.json();
              setMessages(prev => [...prev, savedMessage]);
              setCurrentTurn('player1');
            }
          }
        } catch (error) {
          console.error('Error generating game master response:', error);
        } finally {
          setIsAITyping(false);
        }
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
    if (!inputText.trim() || !playerRole || isLoading) return;
    
    try {
      setIsLoading(true);
      
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        text: inputText,
        sender: playerRole,
        timestamp: Date.now()
      };
      
      // Update local state optimistically
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      
      // Only switch turns if we're not waiting for the game master
      const updatedMessages = [...messages, newMessage];
      if (!shouldGenerateResponse(updatedMessages)) {
        setCurrentTurn(prev => prev === 'player1' ? 'player2' : 'player1');
      } else {
        // If both players have responded, set turn to game master
        setCurrentTurn(null);
      }
      
      // Send to API
      const response = await fetch(`/api/couple-messages?coupleId=${coupleId}&player=${playerRole}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMessage,
          coupleId,
          sender: playerRole
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      // Get the saved message from the server
      const savedMessage = await response.json();
      
      // Update the local state with the server's version of the message
      setMessages(prev => {
        const index = prev.findIndex(m => m.id === newMessage.id);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = savedMessage;
          return updated;
        }
        return [...prev, savedMessage];
      });
      
      // Refresh messages to ensure consistency
      await fetchMessages(true);
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error instanceof Error ? error.message : 'Failed to send message');
      // Revert optimistic update on error
      setMessages(messages);
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
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Image
                src="/pinkbonddd.png"
                alt="Bondly Logo"
                width={100}
                height={100}
                className="object-contain"
                priority
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                Text Adventure
              </h1>
              <p className="text-gray-600 text-lg">
                Choose your role to begin the story
              </p>
            </div>
          </div>

          {/* Player Selection Card */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <button
                  onClick={() => {
                    const role = 'player1';
                    setPlayerRole(role);
                    localStorage.setItem('playerRole', role);
                  }}
                  className="w-full h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-3"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold">1</span>
                  </div>
                  <span className="text-lg">Join as Player 1</span>
                </button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">or</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const role = 'player2';
                    setPlayerRole(role);
                    localStorage.setItem('playerRole', role);
                  }}
                  className="w-full h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-3"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold">2</span>
                  </div>
                  <span className="text-lg">Join as Player 2</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Image
                src="/pinkbonddd.png"
                alt="Bondly Logo"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                Text Adventure
              </h1>
              <p className="text-gray-600 text-lg">
                Ready to begin your story?
              </p>
            </div>
          </div>

          {/* Game Info Card */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 space-y-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>You are: <span className="font-semibold text-rose-600">{playerRole?.toUpperCase()}</span></span>
                </div>
                
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-100">
                  <p className="text-gray-700 leading-relaxed">
                    Embark on a collaborative storytelling adventure with your partner. 
                    Take turns responding to the game master's prompts and see where your story takes you!
                  </p>
                </div>
              </div>

              <button
                onClick={startGame}
                className="w-full h-14 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2-10a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-lg">Start Adventure</span>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Get the current URL for the game master console
  const getGameMasterUrl = () => {
    if (typeof window === 'undefined') return '#';
    const url = new URL(window.location.href);
    url.pathname = url.pathname.replace(/\/[^/]*$/, '/game-master');
    return url.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex justify-center">
                <Image
                  src="/pinkbonddd.png"
                  alt="Bondly Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                Text Adventure
              </h1>
            </div>
            <a 
              href={getGameMasterUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Game Master Console</span>
            </a>
          </div>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${playerRole === 'player1' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <span className="text-gray-600">You are: <span className="font-semibold text-rose-600">{playerRole?.toUpperCase()}</span></span>
            </div>
            {currentTurn && (
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${currentTurn === 'player1' ? 'bg-blue-500' : currentTurn === 'player2' ? 'bg-green-500' : 'bg-purple-500'}`}></div>
                <span className="text-gray-600">Current Turn: <span className="font-semibold">{currentTurn.toUpperCase()}</span></span>
              </div>
            )}
          </div>
        </header>
      
        {/* Game Master AI Text */}
        {renderGameMasterMessage()}

        {/* Combined Chat Area */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="flex">
            <div className="w-1/2 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center font-medium flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-white/30 rounded-full"></div>
              <span>Player 1</span>
            </div>
            <div className="w-1/2 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-center font-medium flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-white/30 rounded-full"></div>
              <span>Player 2</span>
            </div>
          </div>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Combined Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-96">
            {messages
              .filter(msg => msg.sender === 'player1' || msg.sender === 'player2')
              .sort((a, b) => a.timestamp - b.timestamp)
              .map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${
                    message.sender === 'player1' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div 
                    className={`max-w-[80%] p-4 rounded-2xl shadow-md ${
                      message.sender === 'player1'
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900 border border-blue-200'
                        : 'bg-gradient-to-r from-green-50 to-green-100 text-green-900 border border-green-200'
                    }`}
                  >
                    <div className="text-sm leading-relaxed">{message.text}</div>
                    <div className="text-xs opacity-60 mt-2 flex items-center space-x-1">
                      <span>{message.sender.toUpperCase()}</span>
                      <span>•</span>
                      <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

        {/* Input Area */}
        <form onSubmit={sendMessage} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
          <div className="flex space-x-3">
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
              className="flex-1 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 disabled:opacity-50 disabled:bg-gray-50 text-gray-700 placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || !playerRole || playerRole !== currentTurn || isLoading}
              className={`px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
                isLoading ? 'opacity-70' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
