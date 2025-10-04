"use client";

import Link from 'next/link';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { UserCircle2 } from 'lucide-react';

export function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };
  // Helper for avatar fallback
  const getInitials = (nameOrEmail: string) => {
    if (!nameOrEmail) return 'U';
    const parts = nameOrEmail.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return nameOrEmail[0].toUpperCase();
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center -space-x-1 group">
            <Image 
              src="/images/pinkbonddd.png" 
              alt="Bondly Logo" 
              width={32} 
              height={32} 
              className="w-8 h-8 transition-transform group-hover:scale-110"
              priority
            />
            <span className="text-xl font-bold tracking-tight -ml-0.5">ondly</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <NavigationMenu.Root>
              <NavigationMenu.List className="flex space-x-6">
                <NavigationMenu.Item>
                  <NavigationMenu.Link
                    href="#features"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    features
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <NavigationMenu.Link
                    href="#how-it-works"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    how it works
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <NavigationMenu.Link asChild>
                    <Link
                      href="/download"
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      download the app
                    </Link>
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <NavigationMenu.Link
                    href="/premium"
                    className="text-sm font-medium bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400 bg-clip-text text-transparent font-semibold hover:opacity-90 transition-all"
                  >
                    premium
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
              </NavigationMenu.List>
            </NavigationMenu.Root>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                {/* User avatar with fallback */}
                {user.photoURL ? (
                  <Image src={user.photoURL} alt="avatar" width={32} height={32} className="rounded-full border border-gray-300" />
                ) : (
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 border border-gray-300 text-gray-600 font-bold">
                    {getInitials(user.displayName || user.email || "U")}
                  </span>
                )}
                <Button
                  onClick={handleLogout}
                  size="sm"
                  className="bg-black text-white border-black hover:bg-neutral-900 hover:text-white"
                >
                  Log Out
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="#cta">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
