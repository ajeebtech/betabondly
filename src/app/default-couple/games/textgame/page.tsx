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
        <div className="w-full mb-4 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Game Master</div>
          <div className="text-gray-800 dark:text-gray-200 text-base">
            {lastGameMasterMessage.text}
          </div>
        </div>
      );
    }
    
    // If AI is typing but we don't have a message yet, show loading
    if (isAITyping) {
      console.log('AI is typing, showing loading state');
      return (
        <div className="w-full mb-4 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Game Master is thinking...</div>
          <AITextLoading 
            texts={waitingMessages}
            className="text-gray-800 dark:text-gray-200 text-base"
          />
        </div>
      );
    }
    
    // Otherwise, show loading animation with waiting messages
    return (
      <div className="w-full mb-4 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Game Master is thinking...</div>
        <AITextLoading 
          texts={waitingMessages}
          className="text-gray-800 dark:text-gray-200 text-base"
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

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-3xl font-bold mb-8">Text Adventure Game</h1>
        <p className="text-lg mb-8 text-center max-w-md">
          Embark on a collaborative storytelling adventure with a friend. 
          Take turns responding to the game master's prompts and see where your story takes you!
        </p>
        <button
          onClick={startGame}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Start Adventure
        </button>
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
    <div className="flex flex-col h-full">
      <header className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">Text Adventure Game</h1>
          <a 
            href={getGameMasterUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
          >
            Open Game Master Console
          </a>
        </div>
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
