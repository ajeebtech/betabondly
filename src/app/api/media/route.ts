import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase.Admin";

export async function POST(req: Request) {
  const body = await req.json();
  const { coupleId, path, mime, size, iv, key_encrypted_by_client, userId } = body;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  // Validate membership
  const { data: membership, error: membershipError } = await supabaseAdmin
    .from('memberships')
    .select('*')
    .eq('couple_id', coupleId)
    .eq('user_id', userId)
    .maybeSingle();
    
  if (membershipError) {
    return NextResponse.json({ error: membershipError.message }, { status: 500 });
  }
  
  if (!membership) {
    return NextResponse.json({ error: 'Not a member of this couple' }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from('media')
    .insert([{
      couple_id: coupleId,
      storage_path: path,
      mime,
      size,
      iv: Buffer.from(iv), // save as bytea
      key_encrypted: key_encrypted_by_client
    }])
    .select()
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ media: data });
}
