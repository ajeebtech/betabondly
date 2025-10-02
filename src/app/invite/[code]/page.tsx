'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { getInviteByCode, useInviteCode } from '@/lib/inviteUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function InvitePage({ params }: { params: { code: string } }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkInvite = async () => {
      try {
        const invite = await getInviteByCode(params.code);
        
        if (!invite) {
          setError('Invalid or expired invite code');
          return;
        }
        
        if (invite.used) {
          setError('This invite has already been used');
          return;
        }
        
        setInviteData(invite);
      } catch (err) {
        console.error('Error checking invite:', err);
        setError('Failed to verify invite');
      } finally {
        setLoading(false);
      }
    };
    
    checkInvite();
  }, [params.code]);

  const handleAcceptInvite = async () => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        // Redirect to sign up with the invite code
        router.push(`/sign-up?invite=${params.code}`);
        return;
      }
      
      // Use the invite code
      await useInviteCode(params.code, user.uid);
      
      // Redirect to the couple's page
      router.push(`/couple/${params.code}`);
    } catch (err) {
      console.error('Error accepting invite:', err);
      setError('Failed to accept invite');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verifying invite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invite Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => router.push('/')}
            >
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>You've been invited!</CardTitle>
          <CardDescription>
            Join your partner on Bondly to start sharing your journey together.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full" 
            onClick={handleAcceptInvite}
            disabled={loading}
          >
            {auth.currentUser ? 'Accept Invite' : 'Sign Up to Accept'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
