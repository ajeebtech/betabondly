"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const [postContent, setPostContent] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Post content:", postContent)
    setPostContent("")
  }

  // Sample posts data
  const posts = [
    {
      id: 1,
      author: "Alex Morgan",
      username: "@alex_morgan",
      time: "2h ago",
      content: "Just had an amazing dinner date with my love! ❤️ #DateNight #CoupleGoals",
      likes: 5,
      comments: 24,
    },
    {
      id: 2,
      author: "Jessica Lee",
      username: "@jessica_lee",
      time: "5h ago",
      content: "Celebrating 6 months together today! Time flies when you're having fun with the love of your life. 💕 #Anniversary",
      likes: 12,
      comments: 8,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Our Moments</h1>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 w-full">
        <div className="flex justify-center mb-8">
          <form onSubmit={handleSubmit} className="w-full max-w-[600px] px-4">
            <div className="relative border border-gray-200 rounded-2xl p-4 bg-white shadow-sm w-full">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What's happening?"
                className="w-full min-h-24 p-0 text-base border-none resize-none focus:outline-none focus:ring-0 bg-transparent placeholder:text-gray-400"
                style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
              />
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg text-gray-600"
                  >
                    <span className="sr-only">Add media</span>
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{postContent.length}/280</span>
                  <Button
                    type="submit"
                    disabled={!postContent.trim()}
                    className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {post.author.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{post.author}</h3>
                    <p className="text-sm text-gray-500">{post.username} · {post.time}</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-900 mb-4 leading-relaxed">{post.content}</p>
              <div className="flex items-center gap-6 text-gray-500">
                <button className="flex items-center gap-2 hover:text-blue-600">
                  <span className="text-sm">❤️ {post.likes}</span>
                </button>
                <button className="flex items-center gap-2 hover:text-blue-600">
                  <span className="text-sm">💬 {post.comments}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
