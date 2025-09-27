'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/auth/LoadingSpinner';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { setUser, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // If user is not authenticated, redirect to login
        router.push('/auth/name');
      } else {
        // Update auth context with user data
        setUser(user);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router, setUser]);

  // Show loading spinner while checking auth state
  if (isLoading || loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
