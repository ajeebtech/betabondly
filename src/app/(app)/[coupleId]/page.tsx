"use client"

import { useParams } from 'next/navigation';
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon } from "lucide-react"
import { CalendarDrawer } from "@/components/CalendarDrawer"
import { DateDetailsDrawer } from "@/components/DateDetailsDrawer"
import { format } from "date-fns"
import { Textarea as HeroTextarea } from "@heroui/react"
import SidebarDemo from "@/components/sidebar-demo"
import HeartIcon from "@/components/HeartIcon"
import { NotificationsPopover } from "@/components/NotificationsPopover"

type DatePlan = {
  date: Date
  startingPoint: string
  destination: string
  waypoints: string[]
  budget: string
  distance: string
}

export default function CoupleDashboard() {
  const params = useParams()
  const coupleId = params.coupleId as string || 'default-couple';
  const [postContent, setPostContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isDateDetailsOpen, setIsDateDetailsOpen] = useState(false)
  const [budget, setBudget] = useState("")
  const [distance, setDistance] = useState("5")
  const [datePlan, setDatePlan] = useState<DatePlan | null>(null)
  
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [coupleId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Post content for couple", coupleId, ":", postContent)
    // In a real app, you would save this to your database
    setPostContent("")
  }

  const handleSelect = (newDate: Date | undefined) => {
    setDate(newDate)
    setIsCalendarOpen(false)
    if (newDate) {
      setIsDateDetailsOpen(true)
    }
  }

  // Sample posts data - in a real app, this would come from your database
  const posts = [
    {
      id: 1,
      author: "jatin roy",
      username: "@ajeebtech",
      time: "2h ago",
      content: `i love my bengali huzz so hot`,
      likes: 5,
      comments: 24,
    },
    {
      id: 2,
      author: "hiya roy",
      username: "@duckdealer",
      time: "5h ago",
      content: `best boyfriend in the world❤️`,
      likes: 12,
      comments: 8,
    },
  ]

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-gray-50 flex">
        {/* Sidebar - Fixed */}
        <div className="fixed inset-y-0 left-0 z-40 w-[280px] border-r border-gray-200">
          <SidebarDemo />
        </div>

        {/* Main Content */}
        <main className="relative z-30 p-6 flex flex-col items-center w-full transition-all duration-300 md:pl-[280px] min-h-screen">
          {/* Loading Skeleton for Post Composer */}
          <div className="w-full max-w-2xl mb-6 bg-white rounded-lg shadow p-4">
            <div className="animate-pulse space-y-4">
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="flex justify-end">
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>

          {/* Loading Skeleton for Posts */}
          <div className="w-full max-w-2xl space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="flex space-x-6">
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Popover */}
      <div className="fixed top-4 right-4 z-50">
        <NotificationsPopover />
      </div>
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-40">
        <SidebarDemo />
      </div>
      
      {/* Main Content */}
      <div className="md:ml-[280px] min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-8">
            {/* Post Composer */}
            <div className="w-full mb-8 bg-white rounded-2xl shadow-lg p-8">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="[&_.heroui-textarea]:focus:ring-0 [&_.heroui-textarea]:focus:ring-offset-0 [&_.heroui-textarea]:focus:outline-none [&_.heroui-textarea]:focus:ring-transparent [&_.heroui-textarea]:focus:border-transparent">
                    <HeroTextarea
                      placeholder="say whatever"
                      className="w-full focus:ring-0 focus:ring-offset-0 focus:outline-none focus:ring-transparent focus:border-transparent"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      label=""
                      labelPlacement="inside"
                      maxRows={5}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {postContent.length}/280
                    </div>
                    <Button
                      type="submit"
                      disabled={!postContent.trim()}
                      className="bg-pink-500 hover:bg-pink-600 text-white p-2"
                      title="Post"
                    >
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.20308 1.04312C1.00481 0.954998 0.772341 1.0048 0.627577 1.16641C0.482813 1.32802 0.458794 1.56455 0.568117 1.75196L3.92115 7.50002L0.568117 13.2481C0.458794 13.4355 0.482813 13.672 0.627577 13.8336C0.772341 13.9952 1.00481 14.045 1.20308 13.9569L14.7031 7.95693C14.8836 7.87668 15 7.69762 15 7.50002C15 7.30243 14.8836 7.12337 14.7031 7.04312L1.20308 1.04312ZM4.84553 7.10002L2.21234 2.586L13.2689 7.50002L2.21234 12.414L4.84552 7.90002H9C9.22092 7.90002 9.4 7.72094 9.4 7.50002C9.4 7.27911 9.22092 7.10002 9 7.10002H4.84553Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            {/* Posts Feed */}
            <div className="w-full space-y-8">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-medium text-xl">
                        {post.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{post.author}</p>
                        <p className="text-sm text-gray-500">{post.username} · {post.time}</p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-6 text-gray-800 text-lg leading-relaxed">{post.content}</p>
                  <div className="mt-6 flex items-center space-x-8 text-base text-gray-500">
                    <button className="flex items-center space-x-1 hover:text-pink-500 transition-colors">
                      <HeartIcon className="w-5 h-5" />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-pink-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{post.comments}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-pink-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
        </div>
        
        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={() => setIsCalendarOpen(true)}
            className="rounded-full h-12 px-6 flex items-center space-x-2 shadow-lg hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
          >
            <CalendarIcon className="h-5 w-5" />
            <span>plan a date!</span>
          </Button>
        </div>
        
        {/* Calendar Drawer */}
        <CalendarDrawer 
          open={isCalendarOpen}
          onOpenChange={setIsCalendarOpen}
          date={date}
          onDateSelect={handleSelect}
        />

        {/* Date Details Drawer */}
        <DateDetailsDrawer
          open={isDateDetailsOpen}
          onOpenChange={setIsDateDetailsOpen}
          selectedDate={date || null}
          budget={budget}
          onBudgetChange={setBudget}
          distance={distance}
          onDistanceChange={setDistance}
          onConfirm={() => {
            setIsDateDetailsOpen(false);
          }}
        />
      </div>
    </div>
  );
}
