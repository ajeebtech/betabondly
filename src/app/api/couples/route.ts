import { NextResponse } from "next/server"
import { createCouple } from "@/lib/services/coupleService"

export async function POST(req: Request) {
  const { name, userId } = await req.json()
  
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }
  
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }
  try {
    const coupleId = await createCouple(userId)
    // For now, return the created coupleId. If you need name/slug stored, we can extend the service.
    return NextResponse.json({ coupleId })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to create couple" }, { status: 500 })
  }
}
