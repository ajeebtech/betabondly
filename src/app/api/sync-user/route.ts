import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// Endpoint disabled after migration to Firebase. Replace with Firebase Storage implementation.
export async function POST() {
  return NextResponse.json(
    { error: "Sync-user API not implemented. Migrated from Supabase to Firebase." },
    { status: 501 }
  );
}
