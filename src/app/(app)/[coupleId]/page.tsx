"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Bell, CalendarIcon, Plus, MoreVertical, Heart, MessageCircle, Share2, Bookmark, Flag } from "lucide-react"
import { CameraIcon } from '@/components/icons/CameraIcon';
import { CalendarDrawer } from "@/components/CalendarDrawer"
import { DateDetailsDrawer } from "@/components/DateDetailsDrawer"
import SidebarDemo from "@/components/sidebar-demo"
import NotificationsPopover from "@/components/NotificationsPopover"
import { PostsLayout } from "@/components/PostsLayout"
import AIInputSearch from "@/components/AIInputSearch"
import { Button } from "../../../../components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../../components/ui/tooltip"
import { CardStack, Highlight } from "../../../../components/ui/card-stack"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ComposeMessageDialog } from "@/components/ComposeMessageDialog"
import { AddToCalendarDialog } from "@/components/AddToCalendarDialog"

type DatePlan = {
  date: Date
  startingPoint: string
  destination: string
  waypoints: string[]
  budget: string
  distance: string
}

const CARDS = [
  {
    id: 0,
    name: "Romantic Dinner",
    designation: "This Friday, 8:00 PM",
    content: (
      <p>
        Booked a table at <span className="font-bold text-pink-500">Le Petit Jardin</span> for a romantic dinner. Don&apos;t forget to wear that dress I love! ❤️
      </p>
    ),
  },
  {
    id: 1,
    name: "Movie Night",
    designation: "Next Tuesday, 7:30 PM",
    content: (
      <p>
        <span className="font-bold text-pink-500">Inception</span> is playing at the local theater. I know it&apos;s your favorite!
      </p>
    ),
  },
  {
    id: 2,
    name: "Weekend Getaway",
    designation: "Next Month",
    content: (
      <p>
        Surprise weekend trip to the mountains! <span className="font-bold text-pink-500">Pack warm clothes</span> and your camera. 🏔️
      </p>
    ),
  },
  {
    id: 3,
    name: "Cooking Class",
    designation: "Next Thursday, 6:30 PM",
    content: (
      <p>
        Signed us up for an Italian cooking class! <span className="font-bold text-pink-500">Get ready to make pasta from scratch</span>! 🍝
      </p>
    ),
  },
  {
    id: 4,
    name: "Beach Day",
    designation: "This Sunday, 10:00 AM",
    content: (
      <p>
        Let's go to the beach! <span className="font-bold text-pink-500">Don't forget sunscreen</span> and a towel. 🏖️
      </p>
    ),
  },
  {
    id: 5,
    name: "Anniversary Dinner",
    designation: "October 15, 7:00 PM",
    content: (
      <p>
        Made reservations at <span className="font-bold text-pink-500">The Melting Pot</span> for our anniversary! Can't wait to celebrate us. 💑
      </p>
    ),
  },
];

export default function CoupleDashboard() {
  const params = useParams()
  const coupleId = (params.coupleId as string) || "default-couple"
  const [isDateDetailsOpen, setIsDateDetailsOpen] = useState(false)
  const [budget, setBudget] = useState("")
  const [distance, setDistance] = useState("5")
  const [date, setDate] = useState<Date | null>(null)

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Notification Button with Tooltip */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="fixed top-4 left-4 h-12 w-12 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-lg z-[9999] hover:bg-pink-600 transition-colors">
              <Bell className="h-6 w-6" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Notifications</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {/* Sidebar */}
      <aside className="shrink-0 relative z-40">
        <div className="w-[300px] h-full bg-white">
          <SidebarDemo />
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative">
        {/* Top Navigation Bar */}
        <header className="w-full bg-white border-b border-gray-200 px-6 py-4 flex justify-end sticky top-0 z-50">
          <div className="flex items-center space-x-4">
            <button className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-white font-bold">!</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row p-4 md:p-8 gap-8">
          {/* Left Column - Posts */}
          <div className="w-full lg:flex-1 max-w-[40rem] mx-auto">
            {/* AI Input Search */}
            <div className="w-full mb-8">
              <AIInputSearch />
            </div>
            
            {/* Scrollable Posts Container */}
            <div className="w-full h-[calc(100vh-250px)] overflow-y-auto pr-2">
              {/* First Post */}
              <div className="w-full bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100">
                {/* Post Header */}
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 font-semibold">
                        aj
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">jatin roy</h3>
                        <p className="text-xs text-gray-500">@ajeebasfuck · 2h</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button 
                          className="text-gray-400 hover:text-gray-600 p-1 -mr-2 -mt-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48" align="end">
                        <DropdownMenuItem className="flex items-center space-x-2">
                          <Bookmark className="h-4 w-4" />
                          <span>Save post</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center space-x-2">
                          <Share2 className="h-4 w-4" />
                          <span>Share</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center space-x-2 text-red-500">
                          <Flag className="h-4 w-4" />
                          <span>Report</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
            
            {/* Post Content */}
            <div className="p-4">
              <p className="text-gray-800">
                i love my bangable bengali huzz
              </p>
              
              {/* Post Actions */}
              <div className="flex items-center space-x-4 pt-4 pb-2 px-1">
                <button className="group relative p-2 rounded-full bg-pink-50 hover:bg-pink-100 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button className="group relative p-2 rounded-full bg-green-50 hover:bg-green-100 transition-colors">
                  <CameraIcon className="h-6 w-6 text-green-500 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Second Post */}
          <div className="w-full bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100">
            {/* Post Header */}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-semibold">
                    hr
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">hiya roy</h3>
                    <p className="text-xs text-gray-500">@duckdealer · 4h</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="text-gray-400 hover:text-gray-600 p-1 -mr-2 -mt-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48" align="end">
                    <DropdownMenuItem className="flex items-center space-x-2">
                      <Bookmark className="h-4 w-4" />
                      <span>Save post</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center space-x-2">
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center space-x-2 text-red-500">
                      <Flag className="h-4 w-4" />
                      <span>Report</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Post Content */}
            <div className="p-4">
              <p className="text-gray-800">
                Celebrating 6 months together today! 💕 Time really does fly when you're having fun. Can't wait for all the adventures still to come! #anniversary #couplegoals
              </p>
              
              {/* Post Actions */}
              <div className="flex items-center space-x-4 pt-4 pb-2 px-1">
                <button className="group relative p-2 rounded-full bg-pink-50 hover:bg-pink-100 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button className="group relative p-2 rounded-full bg-green-50 hover:bg-green-100 transition-colors">
                  <CameraIcon className="h-6 w-6 text-green-500 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Third Post - Scrollable Content */}
          <div className="w-full bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100">
            {/* Post Header */}
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-500 font-semibold">
                  TR
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Travel Memories</h3>
                  <p className="text-xs text-gray-500">@wanderlust · 1d</p>
                </div>
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div className="p-4 max-h-64 overflow-y-auto">
              <p className="text-gray-800 mb-4">
                Our amazing journey around the world! 🌎
              </p>
              
              <div className="space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-800">Day {i + 1}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {i % 2 === 0 
                        ? 'Exploring beautiful landscapes and trying local cuisine.' 
                        : 'Visited historical sites and met amazing people along the way.'}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Post Actions */}
              <div className="flex items-center space-x-4 text-gray-400 border-t border-gray-100 pt-3 mt-4">
                <button className="hover:text-pink-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button className="hover:text-pink-500 transition-colors">
                  <CameraIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
            </div>
          </div>
        </div>

        {/* Right Column - Card Stack - Now positioned independently */}
        <div className="fixed right-8 top-4 w-72 hidden lg:flex flex-col">
          <div className="w-full flex justify-end pr-4 mb-2">
            <AddToCalendarDialog />
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 mt-4">
            <CardStack 
              items={CARDS} 
              className="w-full"
              onSwipe={(id) => {
                console.log(`Card ${id} swiped away`);
              }}
            />
          </div>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={() => setIsDateDetailsOpen(true)}
                className="fixed bottom-8 right-8 rounded-full h-14 w-14 p-0 flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Plan a date</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Date Details Drawer */}
        <DateDetailsDrawer
          open={isDateDetailsOpen}
          onOpenChange={setIsDateDetailsOpen}
          selectedDate={date}
          onConfirm={() => {
            // Handle date confirmation
            setIsDateDetailsOpen(false);
          }}
          budget={budget}
          onBudgetChange={setBudget}
          distance={distance}
          onDistanceChange={setDistance}
        />
      </div>
    </div>
  )
}
