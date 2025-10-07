"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const { user, loading } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 font-sans flex flex-wrap lg:justify-start lg:flex-nowrap z-50 w-full py-4 bg-white/30 backdrop-blur-md border-b border-white/20">
      <nav className="font-sans relative max-w-7xl w-full flex flex-wrap lg:grid lg:grid-cols-12 basis-full items-center px-4 md:px-6 lg:px-8 mx-auto">
        <div className="lg:col-span-3 flex items-center">
          <Link 
            href="/" 
            className="flex-none rounded-xl text-xl inline-block font-semibold focus:outline-hidden focus:opacity-80" 
            aria-label="Bondly"
          >
            <div className="flex items-center">
              <Image 
                src="/images/pinkbonddd.png" 
                alt="Bondly Logo" 
                width={40} 
                height={40} 
                className="mr-1/4"
                priority
              />
              <span 
                className="font-bold"
                style={{
                  color: '#e60076',
                  fontSize: '2rem',
                  lineHeight: 1,
                  letterSpacing: '-0.05em',
                  textShadow: [
                    '2px 2px 4px rgba(0, 0, 0, 0.2)',
                    '0 0 10px rgba(0, 0, 0, 0.15)',
                    '0 0 20px rgba(0, 0, 0, 0.1)'
                  ].join(', ')
                }}
              >
                ondly.
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center justify-center lg:order-2 lg:col-span-6">
          <div className="flex items-center gap-x-7">
            <Link 
              href="#features" 
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('features');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="font-medium text-gray-800 hover:text-pink-600 transition-colors"
            >
              features
            </Link>
            <Link 
              href="#how-it-works" 
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('how-it-works');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="font-medium text-gray-800 hover:text-pink-600 transition-colors"
            >
              how it works
            </Link>
            <Link 
              href="/download" 
              className="font-medium text-gray-800 hover:text-pink-600 transition-colors"
            >
              download the app
            </Link>
            <Link 
              href="/premium" 
              className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 transition-colors"
            >
              premium
            </Link>
          </div>
        </div>

        {/* Button Group */}
        <div className="flex items-center gap-x-3 lg:gap-x-4 ms-auto py-1 lg:ps-6 lg:order-3 lg:col-span-3">
          {!loading && user && (
            <Button
              onClick={async () => {
                await signOut(auth);
                window.location.reload();
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-black/90 transition-colors duration-200 border border-transparent hover:bg-white hover:border-black/10"
            >
              Logout
            </Button>
          )}
        </div>

      </nav>
      
    </header>
  );
};

export default Navbar;