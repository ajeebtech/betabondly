'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export function InviteSection({ userId }: { userId: string }) {
  const [inviteLink, setInviteLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerateInvite = async () => {
    setLoading(true);
    try {
      // Generate a new coupleId (UUID)
      const coupleId = uuidv4();
      const link = `https://bondly.fun/invite/${coupleId}`;
      // Create user doc
      await setDoc(doc(db, 'users', userId), {
        status: 'awaiting',
        coupleId,
        invite_link: link,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      // Create couple doc
      await setDoc(doc(db, 'couples', coupleId), {
        users: [userId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tier: 'free', // Add tier field
      });
      setInviteLink(link);
      toast.success('Invite link generated!');
    } catch (error) {
      toast.error('Failed to generate invite link');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInvite = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    toast.success('Invite link copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full max-w-md mt-8">
      <CardHeader>
        <CardTitle>Invite Your Partner</CardTitle>
        <CardDescription>
          Share this link with your partner to connect your accounts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!inviteLink ? (
          <Button onClick={handleGenerateInvite} className="w-full" disabled={loading}>
            {loading ? 'Generating…' : 'Generate Invite Link'}
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input value={inviteLink} readOnly className="flex-1" />
              <Button size="icon" onClick={handleCopyInvite} disabled={isCopied}>
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this link with your partner. When they sign up or sign in, they'll be added to your couple.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
