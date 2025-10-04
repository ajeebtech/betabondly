import type { Metadata } from 'next';
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const coupleId = params.code as string; // [code] is actually [coupleId]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'checking' | 'onboarding' | 'done'>('checking');

  useEffect(() => {
    const checkAndOnboard = async () => {
      setLoading(true);
      try {
        // Check if user is authenticated
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          if (!user) {
            // Not signed in, redirect to sign up with invite
            router.replace(`/sign-up?invite=${coupleId}`);
            return;
          }

          // Check if user is already in a couple
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists() && userSnap.data().coupleId === coupleId) {
            // Already in this couple, just redirect
            router.replace(`/${coupleId}/dashboard`);
            return;
          }

          setStatus('onboarding');

          // Get couple doc
          const coupleRef = doc(db, 'couples', coupleId);
          const coupleSnap = await getDoc(coupleRef);

          if (!coupleSnap.exists()) {
            setError('Invalid or expired invite link.');
            setLoading(false);
            return;
          }

          const coupleData = coupleSnap.data();
          const users = coupleData.users || [];

          if (users.length === 1) {
            // Second user joining
            const uid1 = users[0];
            const uid2 = user.uid;
            // Update both user docs
            await setDoc(doc(db, 'users', uid2), {
              name: user.displayName || user.email || '',
              status: 'active',
              coupleId,
              invite_link: `https://bondly.fun/invite/${coupleId}`,
              email: user.email,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }, { merge: true });
            await updateDoc(doc(db, 'users', uid1), {
              status: 'active',
              updatedAt: serverTimestamp(),
            });
            await updateDoc(coupleRef, {
              users: arrayUnion(uid2),
              updatedAt: serverTimestamp(),
            });
            setStatus('done');
            router.replace(`/${coupleId}/dashboard`);
            return;
          } else if (users.length === 2 && users.includes(user.uid)) {
            // Already joined
            setStatus('done');
            router.replace(`/${coupleId}/dashboard`);
            return;
          } else {
            setError('This invite link is no longer valid.');
            setLoading(false);
            return;
          }
        });
        return () => unsubscribe();
      } catch (err) {
        setError('Failed to process invite.');
        setLoading(false);
      }
    };
    checkAndOnboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupleId]);

  if (loading || status === 'checking' || status === 'onboarding') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Processing invite...</p>
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
            <Button className="w-full" onClick={() => router.push('/')}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Should never render this, but fallback
  return null;
}
