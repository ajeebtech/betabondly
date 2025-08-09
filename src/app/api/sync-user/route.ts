// app/api/sync-user/route.ts
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST() {
  const { userId } = auth()

  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Create if not exists
  await supabase.from('users').upsert({
    clerk_id: userId
  }, { onConflict: 'clerk_id' })

  return new Response('OK')
}
