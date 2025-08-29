import { supabase } from './supabaseClient';

export async function getTweets(coupleId: string) {
  const { data, error } = await supabase
    .from('tweets')
    .select('*')
    .eq('couple_id', coupleId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tweets:', error);
    return [];
  }

  return data || [];
}
