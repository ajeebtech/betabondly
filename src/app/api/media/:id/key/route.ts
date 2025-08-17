import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase.Admin";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = params.id;
  const { data: media, error } = await supabaseAdmin
    .from('media')
    .select('*, couples:couple_id(name), memberships:couple_id(*)')
    .eq('id', id)
    .maybeSingle();

  if (error || !media) return NextResponse.json({ error: "not found" }, { status: 404 });

  // verify user is a member of the couple (simpler: query memberships)
  const { data: user } = await supabaseAdmin.from('users').select('id').eq('clerk_id', userId).maybeSingle();
  const userDbId = user?.id;
  const { data: mem } = await supabaseAdmin.from('memberships')
    .select('*').eq('couple_id', media.couple_id).eq('user_id', userDbId).maybeSingle();
  if (!mem) return NextResponse.json({ error: 'not authorized' }, { status: 403 });

  // Decrypt the stored key_encrypted (base64 RSA-OAEP) with server private key
  const privPem = process.env.SERVER_PRIVATE_KEY_PEM!;
  // convert PEM to privateKey and decrypt
  const privateKey = crypto.createPrivateKey({ key: privPem, format: 'pem' });
  const encryptedBuf = Buffer.from(media.key_encrypted, 'base64');
  const decrypted = crypto.privateDecrypt({ key: privateKey, oaepHash: 'sha256' }, encryptedBuf);

  // return AES key in base64
  return NextResponse.json({ key: decrypted.toString('base64') });
}
