"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="flex flex-wrap lg:justify-start lg:flex-nowrap z-50 w-full py-4 bg-transparent">
      <nav className="relative max-w-7xl w-full flex flex-wrap lg:grid lg:grid-cols-12 basis-full items-center px-4 md:px-6 lg:px-8 mx-auto bg-transparent">
        <div className="lg:col-span-3 flex items-center">
          <Link 
            href="/" 
            className="flex-none rounded-xl text-xl inline-block font-semibold focus:outline-hidden focus:opacity-80" 
            aria-label="Bondly"
          >
            <span className="text-2xl font-bold text-pink-500">bondly.</span>
          </Link>
        </div>

        {/* Button Group */}
        <div className="flex items-center gap-x-1 lg:gap-x-2 ms-auto py-1 lg:ps-6 lg:order-3 lg:col-span-3">
          <button 
            type="button" 
            className="size-9.5 relative flex justify-center items-center rounded-xl bg-gray-100 border border-gray-200 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none"
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById('waitlist');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="sr-only">Waitlist</span>
            <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </button>
          
          <button 
            type="button" 
            className="py-2 px-4 inline-flex items-center gap-x-2 text-sm font-medium text-nowrap rounded-xl border border-transparent bg-pink-600 text-white hover:bg-pink-700 focus:outline-hidden focus:bg-pink-700 transition disabled:opacity-50 disabled:pointer-events-none"
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById('waitlist');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            join waitlist
          </button>

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

        {/* Collapse */}
        <div 
          id="hs-pro-hcail" 
          className={`${isOpen ? 'block' : 'hidden'} hs-collapse overflow-hidden transition-all duration-300 basis-full grow lg:block lg:w-auto lg:basis-auto lg:order-2 lg:col-span-6`} 
          aria-labelledby="hs-pro-hcail-collapse"
        >
          <div className="flex flex-col gap-y-4 gap-x-0 mt-5 lg:flex-row lg:justify-center lg:items-center lg:gap-y-0 lg:gap-x-7 lg:mt-0">
            <div>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setIsOpen(false);
                }}
                className="relative inline-block text-gray-800 hover:text-pink-600 focus:outline-hidden before:absolute before:bottom-0.5 before:start-0 before:-z-1 before:w-full before:h-1 before:bg-pink-500"
              >
                home
              </button>
            </div>
            <div>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById('features');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                  setIsOpen(false);
                }}
                className="inline-block text-gray-800 hover:text-pink-600 focus:outline-hidden"
              >
                features
              </button>
            </div>
            <div>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById('how-it-works');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                  setIsOpen(false);
                }}
                className="inline-block text-gray-800 hover:text-pink-600 focus:outline-hidden"
              >
                how it works
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;