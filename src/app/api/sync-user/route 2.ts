import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase.Admin";
import { randomUUID } from "crypto";

// Request body: { coupleId, filename, userId }
export async function POST(req: Request) {
  const body = await req.json();
  const { coupleId, filename, userId } = body;
  
  if (!coupleId || !filename || !userId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify that userId is a member of coupleId
  const { data: membership, error: membershipError } = await supabaseAdmin
    .from("memberships")
    .select("*")
    .eq("couple_id", coupleId)
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    return NextResponse.json({ error: membershipError.message }, { status: 500 });
  }

  if (!membership) {
    return NextResponse.json({ error: "Not a member of this couple" }, { status: 403 });
  }

  // generate storage path
  const fileExt = filename.split('.').pop();
  const objectPath = `${coupleId}/${Date.now()}_${randomUUID()}.${fileExt}`;

  // create signed upload url/token (Supabase admin; tokens valid ~2 hours)
  const bucket = "couples-media"; // your private bucket
  const { data: signed, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUploadUrl(objectPath);

  if (error) {
    console.error("createSignedUploadUrl error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // optionally pre-insert media row with key_encrypted_by_client pending state
  // but we'll let the client call /api/media/register after upload

  return NextResponse.json({
    token: signed?.token,
    path: objectPath,
    bucket,
  });
}
