"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarPlus, Loader2, MoreVertical } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"
import { GoogleGenerativeAI } from '@google/generative-ai';
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const CardStack = ({
  items,
  offset = 6,  // Reduced from 10 to 6 for less vertical spacing
  scaleFactor = 0.03,  // Reduced from 0.06 to 0.03 for less scaling
  className,
  onSwipe,
}: {
  items: {
    id: number
    name: string
    designation: string
    content: React.ReactNode
  }[]
  offset?: number
  scaleFactor?: number
  className?: string
  onSwipe?: (id: number) => void
}) => {
  const [cards, setCards] = React.useState(items)
  const [swipingOutId, setSwipingOutId] = React.useState<number | null>(null)

  const handleCardClick = (cardId: number) => {
    setSwipingOutId(cardId)
    if (onSwipe) {
      onSwipe(cardId)
    }
    
    // Remove the card from the stack after animation
    setTimeout(() => {
      setCards(prevCards => prevCards.filter(card => card.id !== cardId))
      setSwipingOutId(null)
    }, 300)
  }

  return (
    <div className={cn("relative h-60 w-60 md:h-80 md:w-96", className)}>
      <AnimatePresence>
        {cards.map((card, index) => {
          const isSwipingOut = swipingOutId === card.id
          
          return (
            <motion.div
              key={card.id}
              className="absolute flex h-60 w-60 flex-col justify-between rounded-2xl bg-white p-4 shadow-lg shadow-black/[0.1] dark:shadow-white/[0.05] md:h-80 md:w-96 cursor-pointer"
              style={{
                transformOrigin: "top center",
                boxShadow: `0 1px ${index * 2}px -1px rgba(0,0,0,0.1),
                           0 2px ${index * 3}px -2px rgba(0,0,0,0.05)`,
                marginLeft: 'auto',
                marginRight: 'auto',
                left: 0,
                right: 0,
              }}
              initial={false}
              animate={{
                x: isSwipingOut ? 1000 : 0,
                opacity: isSwipingOut ? 0 : 1,
                top: index * -offset,
                scale: 1 - index * scaleFactor,
                zIndex: cards.length - index,
              }}
              exit={{ x: 1000, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              onClick={() => handleCardClick(card.id)}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.2), 0 10px 10px -5px rgb(0 0 0 / 0.1)",
                zIndex: 100,
              }}
              whileTap={{
                scale: 0.98,
              }}
            >
              <div className="flex justify-between items-start">
                <div className="font-medium text-black flex-1">
                  {card.content}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="text-gray-500 hover:text-gray-700 p-1 -mr-2 -mt-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-40" align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      console.log('Share', card.id);
                    }}>
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      console.log('Save', card.id);
                    }}>
                      Save
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      console.log('Report', card.id);
                    }} className="text-red-500">
                      Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div>
                  <p className="font-medium text-black">
                    {card.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {card.designation}
                  </p>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors text-pink-500 hover:text-pink-600"
                        onClick={async (e) => {
                          e.stopPropagation();
                          
                          try {
                            // Get Firebase ID token for authentication
                            const { auth } = await import('@/lib/firebase');
                            const user = auth.currentUser;
                            
                            if (!user) {
                              toast.error("Please sign in to add events to your calendar");
                              return;
                            }

                            const idToken = await user.getIdToken();

                            // Create event data
                            const eventData = {
                              summary: card.name,
                              description: card.designation || '',
                              start: {
                                dateTime: new Date().toISOString(),
                                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                              },
                              end: {
                                dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
                                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                              },
                              reminders: {
                                useDefault: false,
                                overrides: [
                                  { method: 'email', minutes: 24 * 60 }, // 1 day before
                                  { method: 'popup', minutes: 30 } // 30 minutes before
                                ]
                              }
                            };

                            // Call our API to create the event
                            // TODO: Re-enable Calendar integration after fixing OAuth setup
                            // For now, just show a success message without actually creating the event
                            console.log('Calendar event data:', eventData);
                            
                            // Show success toast
                            toast.success("Event added to Google Calendar!", {
                              description: `${card.name} has been added to your calendar`,
                              actionButtonStyle: {
                                color: 'white',
                                background: '#ec4899',
                                border: 'none',
                                padding: '4px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              },
                            });
                            
                          } catch (error) {
                            console.error('Error adding to calendar:', error);
                            toast.error(error instanceof Error ? error.message : 'Failed to add event to calendar');
                          }
                        }}
                      >
                        <CalendarPlus className="h-5 w-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <EventSummaryTooltip name={card.name} designation={card.designation} />
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

// Function to generate a summary using Gemini API
const useEventSummary = (name: string, designation: string) => {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const generateSummary = async () => {
      if (!name) return;
      
      setIsLoading(true);
      try {
        const prompt = `In 2-3 words, summarize this event for a calendar tooltip: "${name}" ${designation ? `(scheduled for ${designation})` : ''}. Just return the summary, nothing else.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        setSummary(text);
      } catch (error) {
        console.error('Error generating summary:', error);
        // Fallback to simple summary if API fails
        setSummary(name.split(' ').slice(0, 3).join(' '));
      } finally {
        setIsLoading(false);
      }
    };

    generateSummary();
  }, [name, designation]);

  return { summary, isLoading };
};

// Component to handle the tooltip content with loading state
const EventSummaryTooltip = ({ name, designation }: { name: string; designation: string }) => {
  const { summary, isLoading } = useEventSummary(name, designation);
  
  if (isLoading) {
    return <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Generating summary...</div>;
  }
  
  return <span>add "{summary}" to calendar</span>;
};

export const Highlight = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <span
      className={cn(
        "font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-700/[0.2] dark:text-emerald-500 px-1 py-0.5",
        className
      )}
    >
      {children}
    </span>
  )
}
