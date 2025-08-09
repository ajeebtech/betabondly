// lib/api.ts
import { supabase } from './supabaseClient'

export async function postTweet({ coupleId, content, mediaUrl }: {
  coupleId: string
  content: string
  mediaUrl?: string
}) {
  const { data, error } = await supabase.from('tweets').insert([{
    couple_id: coupleId,
    content,
    media_url: mediaUrl || null
  }])
  if (error) throw error
  return data
}
