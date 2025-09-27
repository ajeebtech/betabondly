import { ReactNode } from 'react';
import { auth } from '@/lib/firebase/config';
import { redirect } from 'next/navigation';

interface AuthLayoutProps {
  children: ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  // This is a server component, so we can use getAuth directly
  const user = auth.currentUser;
  
  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {children}
    </div>
  );
}
