import { NextResponse } from "next/server";

// Media route temporarily disabled after migration to Firebase storage.
// Replace this with Firebase Storage implementation when ready.
export async function POST() {
  return NextResponse.json(
    { error: "Media API not implemented. Migrated from Supabase to Firebase." },
    { status: 501 }
  );
}
