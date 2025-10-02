'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { generateInviteCode, getInviteLink } from '@/lib/inviteUtils';

export function InviteSection({ userId }: { userId: string }) {
  const [inviteCode, setInviteCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerateInvite = async () => {
    try {
      const code = await generateInviteCode(userId);
      setInviteCode(code);
    } catch (error) {
      toast.error('Failed to generate invite code');
      console.error(error);
    }
  };

  const handleCopyInvite = () => {
    if (!inviteCode) return;
    
    const inviteLink = getInviteLink(inviteCode);
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
        {!inviteCode ? (
          <Button 
            onClick={handleGenerateInvite}
            className="w-full"
          >
            Generate Invite Link
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input 
                value={getInviteLink(inviteCode)}
                readOnly 
                className="flex-1"
              />
              <Button 
                size="icon" 
                onClick={handleCopyInvite}
                disabled={isCopied}
              >
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
