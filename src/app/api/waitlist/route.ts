import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize the Supabase client with the service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  const { email } = await request.json()
  
  // Basic validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: 'Please provide a valid email address' },
      { status: 400 }
    )
  }

  try {
    // Insert the email into the waitlist table
    const { data, error } = await supabase
      .from('waitlist')
      .insert([{ email }])
      .select()

    if (error) {
      if (error.code === '23505') { // Duplicate email
        return NextResponse.json(
          { message: 'You\'re already on the waitlist!' },
          { status: 200 }
        )
      }
      throw error
    }

    return NextResponse.json(
      { message: 'Thanks for joining our waitlist!', data },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding to waitlist:', error)
    return NextResponse.json(
      { error: 'Failed to add to waitlist. Please try again.' },
      { status: 500 }
    )
  }
}
