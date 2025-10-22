'use client';

import { useEffect } from 'react';
import EnhancedSidebar from '@/components/EnhancedSidebar';

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
    <div className="flex min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      {/* Enhanced Sidebar */}
      <EnhancedSidebar coupleId="default-couple" />
      
      {/* Main content container */}
      <div className="flex-1 ml-[64px]">
        <div className="w-full max-w-4xl mx-auto px-4">
          {children}
        </div>
      </div>
    </div>
  );
}
