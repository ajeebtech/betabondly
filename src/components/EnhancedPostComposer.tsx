"use client"

import React, { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Image, 
  Paperclip, 
  Send, 
  Youtube, 
  X, 
  Camera, 
  Smile,
  MapPin,
  Calendar,
  Hash,
  UserPlus,
  Video,
  Music,
  FileText,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { extractYouTubeLinks, extractYouTubeVideoId, getYouTubeThumbnail } from "@/lib/youtube"

interface MediaFile {
  id: string
  file: File
  preview: string
  type: 'image' | 'video'
}

interface YouTubePreview {
  id: string
  url: string
  videoId: string
  title: string
  thumbnail: string
  duration: string
}

interface PostData {
  content: string
  media: MediaFile[]
  youtubeLinks: YouTubePreview[]
}

interface EnhancedPostComposerProps {
  onPost?: (postData: PostData) => void
  className?: string
  placeholder?: string
}

export function EnhancedPostComposer({ 
  onPost, 
  className = "", 
  placeholder = "What's on your mind?" 
}: EnhancedPostComposerProps) {
  const [content, setContent] = useState("")
  const [media, setMedia] = useState<MediaFile[]>([])
  const [youtubeLinks, setYoutubeLinks] = useState<YouTubePreview[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [isComposing, setIsComposing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const MAX_CHARS = 500
  const MAX_MEDIA = 4
  const MAX_YOUTUBE = 2

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [])

  // Handle file upload
  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return

    const newMedia: MediaFile[] = []
    
    Array.from(files).forEach((file) => {
      if (media.length + newMedia.length >= MAX_MEDIA) return
      
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const id = Math.random().toString(36).substr(2, 9)
        newMedia.push({
          id,
          file,
          preview: URL.createObjectURL(file),
          type: file.type.startsWith('image/') ? 'image' : 'video'
        })
      }
    })

    setMedia(prev => [...prev, ...newMedia])
  }, [media.length])

  // Extract YouTube links from content
  const processYouTubeLinks = useCallback((text: string) => {
    const links = extractYouTubeLinks(text)
    if (!links.length) return []

    return links.slice(0, MAX_YOUTUBE).map((url, index) => {
      const videoId = extractYouTubeVideoId(url)
      return {
        id: `yt-${index}`,
        url: url.trim(),
        videoId: videoId || '',
        title: `YouTube Video ${index + 1}`,
        thumbnail: videoId ? getYouTubeThumbnail(videoId) : '',
        duration: "0:00"
      }
    })
  }, [])

  // Handle content change
  const handleContentChange = useCallback((value: string) => {
    setContent(value)
    
    // Extract YouTube links
    const newYoutubeLinks = processYouTubeLinks(value)
    setYoutubeLinks(newYoutubeLinks)
    
    adjustTextareaHeight()
  }, [processYouTubeLinks, adjustTextareaHeight])

  // Remove media
  const removeMedia = useCallback((id: string) => {
    setMedia(prev => {
      const item = prev.find(m => m.id === id)
      if (item) {
        URL.revokeObjectURL(item.preview)
      }
      return prev.filter(m => m.id !== id)
    })
  }, [])

  // Remove YouTube link
  const removeYouTubeLink = useCallback((id: string) => {
    const linkToRemove = youtubeLinks.find(yt => yt.id === id)
    if (linkToRemove) {
      setYoutubeLinks(prev => prev.filter(yt => yt.id !== id))
      // Remove the specific URL from content
      setContent(prev => prev.replace(linkToRemove.url, '').trim())
    }
  }, [youtubeLinks])

  // Handle submit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() && media.length === 0 && youtubeLinks.length === 0) return
    
    setIsComposing(true)
    
    try {
      const postData: PostData = {
        content: content.trim(),
        media,
        youtubeLinks
      }
      
      if (onPost) {
        await onPost(postData)
      }
      
      // Reset form
      setContent("")
      setMedia([])
      setYoutubeLinks([])
      setIsFocused(false)
      
      // Clean up object URLs
      media.forEach(item => URL.revokeObjectURL(item.preview))
      
    } catch (error) {
      console.error('Error posting:', error)
    } finally {
      setIsComposing(false)
    }
  }, [content, media, youtubeLinks, onPost])

  // Handle key down
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }, [handleSubmit])

  const remainingChars = MAX_CHARS - content.length
  const isNearLimit = remainingChars <= 50
  const isOverLimit = remainingChars < 0
  const hasContent = content.trim() || media.length > 0 || youtubeLinks.length > 0

  return (
    <Card className={cn(
      "w-full bg-white/90 backdrop-blur-sm border border-rose-100 shadow-lg hover:shadow-xl transition-all duration-300",
      isFocused && "ring-2 ring-pink-500 ring-offset-2",
      className
    )}>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main content area */}
          <div className="space-y-4">
            {/* Textarea */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={cn(
                  "min-h-[120px] max-h-[200px] resize-none border-0 bg-transparent text-lg placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0",
                  "leading-relaxed"
                )}
                maxLength={MAX_CHARS}
              />
              
              {/* Character count */}
              {content.length > 0 && (
                <div className="absolute bottom-2 right-2">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    isOverLimit ? "bg-red-100 text-red-600" :
                    isNearLimit ? "bg-yellow-100 text-yellow-600" :
                    "bg-gray-100 text-gray-500"
                  )}>
                    {remainingChars}
                  </span>
                </div>
              )}
            </div>

            {/* Media previews */}
            {(media.length > 0 || youtubeLinks.length > 0) && (
              <div className="space-y-3">
                {/* Uploaded media */}
                {media.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {media.map((item) => (
                      <div key={item.id} className="relative group">
                        {item.type === 'image' ? (
                          <img
                            src={item.preview}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-xl border border-rose-100"
                          />
                        ) : (
                          <video
                            src={item.preview}
                            className="w-full h-32 object-cover rounded-xl border border-rose-100"
                            controls
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(item.id)}
                          className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* YouTube previews */}
                {youtubeLinks.length > 0 && (
                  <div className="space-y-2">
                    {youtubeLinks.map((yt) => (
                      <div key={yt.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100">
                        <img
                          src={yt.thumbnail}
                          alt="YouTube thumbnail"
                          className="w-16 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{yt.title}</p>
                          <p className="text-xs text-gray-500">YouTube Video</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeYouTubeLink(yt.id)}
                          className="h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-rose-100">
            <div className="flex items-center space-x-2">
              {/* Image upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={media.length >= MAX_MEDIA}
                className={cn(
                  "p-3 rounded-full transition-all duration-200 hover:scale-110",
                  media.length >= MAX_MEDIA
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 text-pink-600 hover:text-pink-700"
                )}
                title="Add photos/videos"
              >
                <Image className="h-5 w-5" />
              </button>

              {/* YouTube */}
              <button
                type="button"
                disabled={youtubeLinks.length >= MAX_YOUTUBE}
                className={cn(
                  "p-3 rounded-full transition-all duration-200 hover:scale-110",
                  youtubeLinks.length >= MAX_YOUTUBE
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-600 hover:text-red-700"
                )}
                title="Add YouTube link"
              >
                <Youtube className="h-5 w-5" />
              </button>

              {/* Camera */}
              <button
                type="button"
                className="p-3 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-600 hover:text-green-700 transition-all duration-200 hover:scale-110"
                title="Take photo"
              >
                <Camera className="h-5 w-5" />
              </button>

              {/* Emoji */}
              <button
                type="button"
                className="p-3 rounded-full bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 text-yellow-600 hover:text-yellow-700 transition-all duration-200 hover:scale-110"
                title="Add emoji"
              >
                <Smile className="h-5 w-5" />
              </button>
            </div>

            {/* Post button */}
            <Button
              type="submit"
              disabled={!hasContent || isOverLimit || isComposing}
              className={cn(
                "px-6 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 shadow-lg",
                hasContent && !isOverLimit
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              {isComposing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Posting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Post</span>
                  <Send className="h-4 w-4" />
                </div>
              )}
            </Button>
          </div>

          {/* Helper text */}
          <div className="text-xs text-gray-500 text-center">
            <p>💡 Tip: Paste a YouTube link to automatically embed the video</p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
