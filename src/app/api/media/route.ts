import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase.Admin";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { coupleId, path, mime, size, iv, key_encrypted_by_client } = body;

  // Validate membership same as /api/upload-url (omitted for brevity; replicate)
  // Find userDbId
  const { data: user } = await supabaseAdmin.from('users').select('id').eq('clerk_id', userId).maybeSingle();
  const userDbId = user?.id;
  if (!userDbId) return NextResponse.json({ error: 'user not found' }, { status: 403 });

  const { data: membership } = await supabaseAdmin
    .from('memberships')
    .select('*')
    .eq('couple_id', coupleId)
    .eq('user_id', userDbId)
    .maybeSingle();
  if (!membership) return NextResponse.json({ error: 'not a member' }, { status: 403 });

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
