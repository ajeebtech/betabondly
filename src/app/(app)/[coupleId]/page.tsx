"use client"

import { useParams } from 'next/navigation';
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CalendarDrawer } from "@/components/CalendarDrawer"
import { format } from "date-fns"

import SidebarDemo from "@/components/sidebar-demo";

export default function CoupleDashboard() {
  const params = useParams()
  const coupleId = params.coupleId as string || 'default-couple';
  const [postContent, setPostContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [date, setDate] = useState<Date | undefined>(new Date())
  
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

  // Sample posts data - in a real app, this would come from your database
  const posts = [
    {
      id: 1,
      author: "Alex Morgan",
      username: "@alex_morgan",
      time: "2h ago",
      content: `Just had an amazing dinner date with my love! ❤️ #DateNight #CoupleGoals`,
      likes: 5,
      comments: 24,
    },
    {
      id: 2,
      author: "Jessica Lee",
      username: "@jessica_lee",
      time: "5h ago",
      content: `Celebrating 6 months together today! Time flies when you're having fun with the love of your life. 💕 #Anniversary`,
      likes: 12,
      comments: 8,
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="hidden md:block">
        <SidebarDemo />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full min-h-24 p-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              rows={3}
              maxLength={280}
            />
            <div className="flex justify-between items-center mt-3">
              <div className="text-sm text-gray-500">
                {postContent.length}/280
              </div>
              <Button
                type="submit"
                disabled={!postContent.trim()}
                className="bg-pink-500 hover:bg-pink-600 text-white"
              >
                Post
              </Button>
            </div>
          </div>
        </form>

        <div className="space-y-6 mt-8">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-pink-600 font-medium">
                      {post.author.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{post.author}</h3>
                    <p className="text-sm text-gray-500">{post.username} · {post.time}</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-800 mb-4">{post.content}</p>
              <div className="flex items-center space-x-6 text-gray-500 text-sm">
                <button className="flex items-center space-x-1 hover:text-pink-600">
                  <span>❤️</span>
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-pink-600">
                  <span>💬</span>
                  <span>{post.comments} comments</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Calendar Drawer Trigger */}
      <div className="fixed bottom-4 right-4 z-50">
        <CalendarDrawer 
          date={date}
          onSelect={setDate}
          className=""
        />
      </div>
    </div>
  )
}
