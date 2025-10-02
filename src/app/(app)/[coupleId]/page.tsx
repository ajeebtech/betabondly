"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { CalendarIcon, Plus, MoreVertical, Heart, MessageCircle, Share2, Bookmark, Flag } from "lucide-react"
import { CameraIcon } from '@/components/icons/CameraIcon';
import { CalendarDrawer } from "@/components/CalendarDrawer"
import { DateDetailsDrawer } from "@/components/DateDetailsDrawer"
import EnhancedSidebar from "@/components/EnhancedSidebar"
import NotificationsPopover from "@/components/NotificationsPopover"
import { PostsLayout } from "@/components/PostsLayout"
import { EnhancedPostComposer } from "@/components/EnhancedPostComposer"
import { Button } from "../../../../components/ui/button"
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
    <div className="flex min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      {/* Enhanced Sidebar */}
      <aside className="shrink-0 relative z-40">
        <EnhancedSidebar />
      </aside>

      <div className="flex-1 flex flex-col relative ml-[64px]">
        {/* Top Navigation Bar */}
        <header className="w-full bg-white/80 backdrop-blur-sm border-b border-rose-100 px-6 py-4 flex justify-end sticky top-0 z-50 shadow-sm">
          <div className="flex items-center space-x-4">
            <button className="h-10 w-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200">
              <span className="text-white font-bold">!</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row p-4 md:p-8 gap-8">
          {/* Left Column - Posts */}
          <div className="w-full lg:flex-1 max-w-[40rem] mx-auto">
            {/* Enhanced Post Composer */}
            <div className="w-full mb-8">
              <EnhancedPostComposer 
                placeholder="type whatever"
                onPost={(postData) => {
                  console.log('New post:', postData);
                  // Handle the post data here
                  // You can add it to your posts state or send to API
                }}
              />
            </div>
            
            {/* Scrollable Posts Container */}
            <div className="w-full h-[calc(100vh-250px)] overflow-y-auto pr-2">
              {/* First Post */}
              <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden mb-6 border border-rose-100 hover:shadow-xl transition-all duration-300">
                {/* Post Header */}
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-100 to-rose-100 flex items-center justify-center text-pink-600 font-semibold shadow-sm">
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
              <p className="text-gray-800 text-lg leading-relaxed">
                i love my bangable bengali huzz 💕
              </p>
              
              {/* Post Actions */}
              <div className="flex items-center space-x-4 pt-4 pb-2 px-1">
                <button className="group relative p-3 rounded-full bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 transition-all duration-200 hover:scale-110 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500 group-hover:text-pink-600 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button className="group relative p-3 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-200 hover:scale-110 shadow-sm">
                  <CameraIcon className="h-6 w-6 text-green-500 group-hover:text-green-600 transition-all" />
                </button>
              </div>
            </div>
          </div>

          {/* Second Post */}
          <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden mb-6 border border-rose-100 hover:shadow-xl transition-all duration-300">
            {/* Post Header */}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center text-blue-600 font-semibold shadow-sm">
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
              <p className="text-gray-800 text-lg leading-relaxed">
                Celebrating 6 months together today! 💕 Time really does fly when you're having fun. Can't wait for all the adventures still to come! #anniversary #couplegoals
              </p>
              
              {/* Post Actions */}
              <div className="flex items-center space-x-4 pt-4 pb-2 px-1">
                <button className="group relative p-3 rounded-full bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 transition-all duration-200 hover:scale-110 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500 group-hover:text-pink-600 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button className="group relative p-3 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-200 hover:scale-110 shadow-sm">
                  <CameraIcon className="h-6 w-6 text-green-500 group-hover:text-green-600 transition-all" />
                </button>
              </div>
            </div>
          </div>

          {/* Third Post - Scrollable Content */}
          <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden mb-6 border border-rose-100 hover:shadow-xl transition-all duration-300">
            {/* Post Header */}
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center text-green-600 font-semibold shadow-sm">
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
              <p className="text-gray-800 text-lg leading-relaxed mb-4">
                Our amazing journey around the world! 🌎
              </p>
              
              <div className="space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="p-4 bg-gradient-to-r from-gray-50 to-rose-50 rounded-xl border border-rose-100 shadow-sm hover:shadow-md transition-all duration-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Day {i + 1}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {i % 2 === 0 
                        ? 'Exploring beautiful landscapes and trying local cuisine.' 
                        : 'Visited historical sites and met amazing people along the way.'}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Post Actions */}
              <div className="flex items-center space-x-4 text-gray-400 border-t border-rose-100 pt-4 mt-4">
                <button className="p-2 rounded-full bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 transition-all duration-200 hover:scale-110 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500 hover:text-pink-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button className="p-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-200 hover:scale-110 shadow-sm">
                  <CameraIcon className="h-5 w-5 text-green-500 hover:text-green-600 transition-colors" />
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
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100 p-4 mt-4 hover:shadow-xl transition-all duration-300">
            <CardStack 
              items={CARDS} 
              className="w-full"
              onSwipe={(id) => {
                console.log(`Card ${id} swiped away`);
              }}
            />
          </div>
        </div>
        
        <Button 
          onClick={() => setIsDateDetailsOpen(true)}
          className="fixed bottom-8 right-8 rounded-full h-16 w-16 p-0 flex items-center justify-center shadow-xl hover:scale-110 transition-all duration-200 bg-gradient-to-br from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-2 border-white"
        >
          <Plus className="h-7 w-7" />
        </Button>
        
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
