"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <Link href="/" className="logo">
            Bondly
          </Link>
        </motion.div>

        <div className="nav-links">
          <Link href="/features" className="nav-link">
            Features
          </Link>
          <Link href="/about" className="nav-link">
            About
          </Link>
          <Link href="/login" className="btn btn-primary">
            Sign In
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="mobile-menu-button">
          <svg 
            width="24" 
            height="24" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 6h16M4 12h16m-7 6h7" 
            />
          </svg>
        </button>
      </div>
      <style jsx>{`
        .navbar {
          width: 100%;
          padding: 1rem 1.5rem;
          background-color: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(4px);
          border-bottom: 1px solid #fce4ec;
        }
        .logo {
          font-size: 1.5rem;
          font-family: 'Indie Flower', cursive;
          color: #d6336c;
          text-decoration: none;
          transition: color 0.2s ease-in-out;
        }
        .logo:hover {
          color: #c02e61;
        }
        .nav-links {
          display: none;
          align-items: center;
          gap: 2rem;
        }
        .nav-link {
          color: #4a4a4a;
          text-decoration: none;
          transition: color 0.2s ease-in-out;
        }
        .nav-link:hover {
          color: #d6336c;
        }
        .mobile-menu-button {
          display: block;
          color: #4a4a4a;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
        }
        .mobile-menu-button:hover {
          color: #d6336c;
        }
        @media (min-width: 768px) {
          .nav-links {
            display: flex;
          }
          .mobile-menu-button {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;