"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useAuth();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

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

        {/* Button Group */}
        <div className="flex items-center gap-x-3 lg:gap-x-4 ms-auto py-1 lg:ps-6 lg:order-3 lg:col-span-3">
          {!loading && user ? (
            <Button
              onClick={async () => {
                await signOut(auth);
                window.location.reload();
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-black/90 transition-colors duration-200 border border-transparent hover:bg-white hover:border-black/10"
            >
              Logout
            </Button>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-black/90 transition-colors duration-200 border border-transparent hover:bg-white hover:border-black/10"
                aria-label="Sign in"
              >
                <Users className="h-5 w-5" />
                <span className="text-base font-semibold">sign in</span>
              </Link>
              <Link
                href="/sign-up"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-500 text-white font-semibold hover:bg-pink-600 transition-colors duration-200"
                aria-label="Get Started"
              >
                Get Started
              </Link>
            </>
          )}

          <div className="lg:hidden">
            <button 
              type="button" 
              className="hs-collapse-toggle size-9.5 flex justify-center items-center text-sm font-semibold rounded-xl border border-gray-200 text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none" 
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="hs-pro-hcail"
              aria-label="Toggle navigation"
            >
              {isOpen ? (
                <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"/>
                  <path d="m6 6 12 12"/>
                </svg>
              ) : (
                <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" x2="21" y1="6" y2="6"/>
                  <line x1="3" x2="21" y1="12" y2="12"/>
                  <line x1="3" x2="21" y1="18" y2="18"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <div 
          id="hs-pro-hcail" 
          className={`${isOpen ? 'block' : 'hidden'} hs-collapse overflow-hidden transition-all duration-300 basis-full grow lg:block lg:w-auto lg:basis-auto lg:order-2 lg:col-span-6`} 
          aria-labelledby="hs-pro-hcail-collapse"
        >
          <div className="flex flex-col gap-y-4 gap-x-0 mt-5 lg:flex-row lg:items-center lg:justify-center lg:gap-y-0 lg:gap-x-7 lg:mt-0 lg:ps-7">
            <Link 
              href="/" 
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setIsOpen(false);
              }}
              className="font-medium text-gray-800 hover:text-pink-600 transition-colors"
            >
              home
            </Link>
            <Link 
              href="#features" 
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('features');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
                setIsOpen(false);
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
                setIsOpen(false);
              }}
              className="font-medium text-gray-800 hover:text-pink-600 transition-colors"
            >
              how it works
            </Link>
            <Link 
              href="/privacy" 
              className="font-medium text-gray-800 hover:text-pink-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              privacy policy
            </Link>
            <Link 
              href="/premium" 
              className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              premium
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden w-full bg-white/95 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-end">
            <Link 
              href="/premium" 
              className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 transition-colors text-sm"
              onClick={() => setIsOpen(false)}
            >
              premium
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;