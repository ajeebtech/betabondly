// src/components/ProtectedRoute.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      if (!user) {
        router.push('/onboarding');
      }
    });
    return () => unsubscribe();
  }, [router]);

  return <>{children}</>;
}