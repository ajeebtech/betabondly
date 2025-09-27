'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
};

export default function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = '/auth/name',
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If authentication is required but no user is logged in, redirect to login
      if (requireAuth && !user) {
        router.push(redirectTo);
      }
      // If authentication is not required but user is logged in, redirect to home/dashboard
      else if (!requireAuth && user) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, requireAuth, redirectTo, router]);

  // Show loading indicator while checking auth state
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If auth state is as expected, render children
  if ((requireAuth && user) || (!requireAuth && !user)) {
    return <>{children}</>;
  }

  // Default return (will be replaced by the redirect)
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
