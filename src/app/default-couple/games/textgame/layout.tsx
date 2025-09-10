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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50">
        <SidebarDemo />
      </div>
      
      {/* Main content container */}
      <div className="flex-1 pl-16 md:pl-20">
        <div className="w-full max-w-4xl mx-auto px-4">
          {children}
        </div>
      </div>
    </div>
  );
}
