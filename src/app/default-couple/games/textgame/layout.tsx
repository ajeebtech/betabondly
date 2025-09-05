'use client';

import { useEffect } from 'react';
import SidebarDemo from '@/components/sidebar-demo';

export default function TextGameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Hide the navbar
    const navbar = document.querySelector('header');
    if (navbar) {
      navbar.style.display = 'none';
    }

    return () => {
      // Restore the navbar when unmounting
      if (navbar) {
        navbar.style.display = '';
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen">
      <div className="w-16">
        <SidebarDemo />
      </div>
      <div className="flex-1 flex justify-center items-start p-4">
        <div className="w-full max-w-4xl">
          {children}
        </div>
      </div>
    </div>
  );
}
