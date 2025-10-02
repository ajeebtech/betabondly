/**
 * YouTube utility functions for link detection and video information extraction
 */

// YouTube URL regex patterns
export const YOUTUBE_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i

export interface YouTubeVideoInfo {
  id: string
  url: string
  videoId: string
  title: string
  thumbnail: string
  duration: string
  channelTitle: string
  description: string
}

/**
 * Extract YouTube video ID from URL
 */
export function extractYouTubeVideoId(url: string): string | null {
  const match = url.match(YOUTUBE_REGEX)
  return match ? match[1] : null
}

/**
 * Check if a URL is a valid YouTube link
 */
export function isYouTubeUrl(url: string): boolean {
  return YOUTUBE_REGEX.test(url)
}

/**
 * Get YouTube thumbnail URL
 */
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'maxres'): string {
  const qualities = {
    default: 'default.jpg',
    medium: 'mqdefault.jpg',
    high: 'hqdefault.jpg',
    maxres: 'maxresdefault.jpg'
  }
  
  return `https://img.youtube.com/vi/${videoId}/${qualities[quality]}`
}

/**
 * Get YouTube embed URL
 */
export function getYouTubeEmbedUrl(videoId: string, autoplay: boolean = false): string {
  const params = new URLSearchParams({
    enablejsapi: '1',
    origin: typeof window !== 'undefined' ? window.location.origin : '',
    ...(autoplay && { autoplay: '1' })
  })
  
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}

/**
 * Extract all YouTube links from text
 */
export function extractYouTubeLinks(text: string): string[] {
  const matches = text.match(new RegExp(YOUTUBE_REGEX.source, 'gi'))
  return matches ? [...new Set(matches)] : [] // Remove duplicates
}

/**
 * Create a clean YouTube URL
 */
export function normalizeYouTubeUrl(url: string): string {
  const videoId = extractYouTubeVideoId(url)
  if (!videoId) return url
  
  return `https://www.youtube.com/watch?v=${videoId}`
}

/**
 * Format YouTube duration (ISO 8601 to readable format)
 */
export function formatYouTubeDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return '0:00'
  
  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
}

/**
 * Get YouTube video information (requires YouTube Data API)
 * This is a placeholder - you'd need to implement the actual API call
 */
export async function getYouTubeVideoInfo(videoId: string, apiKey?: string): Promise<YouTubeVideoInfo | null> {
  if (!apiKey) {
    // Return basic info without API call
    return {
      id: videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      videoId,
      title: `YouTube Video`,
      thumbnail: getYouTubeThumbnail(videoId),
      duration: '0:00',
      channelTitle: 'YouTube',
      description: ''
    }
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails`
    )
    
    if (!response.ok) throw new Error('Failed to fetch video info')
    
    const data = await response.json()
    
    if (!data.items || data.items.length === 0) return null
    
    const video = data.items[0]
    
    return {
      id: videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      videoId,
      title: video.snippet.title,
      thumbnail: getYouTubeThumbnail(videoId),
      duration: formatYouTubeDuration(video.contentDetails.duration),
      channelTitle: video.snippet.channelTitle,
      description: video.snippet.description
    }
  } catch (error) {
    console.error('Error fetching YouTube video info:', error)
    return null
  }
}
