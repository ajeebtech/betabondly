'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export const useRequireAuth = (redirectUrl = '/auth/name') => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window === 'undefined') return;

    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push(redirectUrl);
    }
  }, [user, loading, router, redirectUrl]);

  return { user, loading };
};

export const useRequireNoAuth = (redirectUrl = '/dashboard') => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window === 'undefined') return;

    // If not loading and user exists, redirect to dashboard
    if (!loading && user) {
      router.push(redirectUrl);
    }
  }, [user, loading, router, redirectUrl]);

  return { user, loading };
};
