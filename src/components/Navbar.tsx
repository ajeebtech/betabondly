"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 inset-x-0 flex flex-wrap md:justify-start md:flex-nowrap z-50 w-full text-sm transition-all duration-300 bg-transparent">
      <nav className="mt-4 relative max-w-2xl w-full bg-white/90 backdrop-blur-md border border-gray-200 rounded-[24px] mx-2 flex flex-wrap md:flex-nowrap items-center justify-between p-1 ps-4 md:py-0 sm:mx-auto">
        <div className="flex items-center">
          <Link 
            href="/" 
            className="flex-none rounded-md text-xl inline-block font-semibold focus:outline-hidden focus:opacity-80" 
            aria-label="Bondly"
          >
            <motion.span 
              className="text-2xl font-bold text-pink-500"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              bondly.
            </motion.span>
          </Link>
        </div>

        <div className="flex items-center gap-1 md:order-4 md:ms-4">
          <Link 
            href="#waitlist"
            className="w-full sm:w-auto whitespace-nowrap py-2 px-3 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-full border border-transparent bg-pink-500 text-white hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById('waitlist');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            waitlist
          </Link>

          <button 
            type="button" 
            className="hs-collapse-toggle flex justify-center items-center size-9.5 border border-gray-200 text-gray-500 rounded-full hover:bg-gray-200 focus:outline-none focus:bg-gray-200 md:hidden" 
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="hs-navbar-header-floating"
            aria-label="Toggle navigation"
          >
            {!isOpen ? (
              <svg className="hs-collapse-open:hidden shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" x2="21" y1="6" y2="6"/>
                <line x1="3" x2="21" y1="12" y2="12"/>
                <line x1="3" x2="21" y1="18" y2="18"/>
              </svg>
            ) : (
              <svg className="hs-collapse-open:block hidden shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
              </svg>
            )}
          </button>
        </div>

        <div 
          id="hs-navbar-header-floating" 
          className={`${isOpen ? 'block' : 'hidden'} hs-collapse overflow-hidden transition-all duration-300 basis-full grow md:block`}
          aria-labelledby="hs-navbar-header-floating-collapse"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-2 md:gap-3 mt-3 md:mt-0 py-2 md:py-0 md:ps-7">
            <button 
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setIsOpen(false);
              }}
              className="py-0.5 md:py-3 px-4 md:px-1 border-s-2 md:border-s-0 md:border-b-2 border-transparent font-medium text-gray-800 hover:text-pink-500 focus:outline-none"
            >
              home
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('features');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
                setIsOpen(false);
              }}
              className="py-0.5 md:py-3 px-4 md:px-1 border-s-2 md:border-s-0 md:border-b-2 border-transparent font-medium text-gray-600 hover:text-pink-500 focus:outline-none"
            >
              features
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('how-it-works');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
                setIsOpen(false);
              }}
              className="py-0.5 md:py-3 px-4 md:px-1 border-s-2 md:border-s-0 md:border-b-2 border-transparent font-medium text-gray-600 hover:text-pink-500 focus:outline-none"
            >
              how it works
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;