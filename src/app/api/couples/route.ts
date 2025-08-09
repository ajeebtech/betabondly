import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import { randomUUID } from "crypto"

export async function POST(req: Request) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name } = await req.json()
  const slug = name.toLowerCase().replace(/\s+/g, "-") + "-" + Math.floor(Math.random() * 1000)

  const { data, error } = await supabase
    .from("couples")
    .insert([{ id: randomUUID(), slug, name, created_by: userId }])
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ couple: data[0] })
}
