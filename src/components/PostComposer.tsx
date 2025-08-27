"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Button as StatefulButton } from "@/components/ui/stateful-button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface PostComposerProps {
  onPost?: (content: string) => void
  className?: string
}

export function PostComposer({ onPost, className = "" }: PostComposerProps) {
  const [content, setContent] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const MAX_CHARS = 280
  const WARNING_THRESHOLD = 20

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [content])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim() && content.length <= MAX_CHARS && onPost) {
      onPost(content)
      setContent("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const remainingChars = MAX_CHARS - content.length
  const isNearLimit = remainingChars <= WARNING_THRESHOLD
  const isOverLimit = remainingChars < 0

  return (
    <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-10 border-b border-gray-100">
      <div className="max-w-2xl mx-auto w-full px-4 py-2">
        <form
          onSubmit={handleSubmit}
          className={`w-full ${className} ${
            isFocused ? "ring-1 ring-blue-400" : "ring-1 ring-gray-200"
          } rounded-full transition-all duration-200 bg-white shadow-sm`}
        >
          <div className="py-2 px-4">
            {/* Main textarea */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder="What's happening?"
                className="w-full min-h-[40px] py-2 text-sm border-none resize-none focus:outline-none focus:ring-0 bg-white placeholder:text-gray-500 text-gray-900 rounded-full px-4"
                style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                maxLength={MAX_CHARS}
                aria-label="Compose new post"
              />
            </div>

            {/* Bottom toolbar */}
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
              {/* Left side - Action buttons */}
              <div className="flex items-center gap-1">
                {/* Media Button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-blue-50 text-blue-500 hover:text-blue-600 rounded-full transition-colors"
                      aria-label="Add media"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z" />
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 border border-gray-200 rounded-lg shadow-lg" align="start">
                    <DropdownMenuItem className="gap-2 cursor-pointer p-2 hover:bg-gray-50 text-sm">
                      <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Photo/Video
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer p-2 hover:bg-gray-50 text-sm">
                      <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      Poll
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer p-2 hover:bg-gray-50 text-sm">
                      <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Location
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer p-2 hover:bg-gray-50 text-sm">
                      <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                        />
                      </svg>
                      Hashtags
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer p-2 hover:bg-gray-50 text-sm">
                      <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Tag people
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Tools Button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-blue-50 text-blue-500 hover:text-blue-600 rounded-full transition-colors"
                      aria-label="Tools"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                        />
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-40 border border-gray-200 rounded-lg shadow-lg" align="start">
                    <DropdownMenuItem className="gap-2 cursor-pointer p-2 hover:bg-gray-50 text-sm">
                      <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Schedule post
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer p-2 hover:bg-gray-50 text-sm">
                      <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Add to calendar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Right side - Post button */}
              <div className="flex items-center">
                <StatefulButton
                  type="submit"
                  disabled={!content.trim() || isOverLimit}
                  className={`h-8 px-4 rounded-full text-sm font-medium transition-colors ${
                    !content.trim() || isOverLimit
                      ? "bg-blue-300 text-white cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                  aria-label="Post"
                  onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
                    if (onPost && content.trim() && !isOverLimit) {
                      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
                      onPost(content);
                      setContent("");
                    }
                  }}
                >
                  Post
                </StatefulButton>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
