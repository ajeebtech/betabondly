'use client';

import { Button } from '@chakra-ui/react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          UI Showcase
        </Link>
        <nav className="flex items-center space-x-6">
          <Link href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Features
          </Link>
          <Link href="#demo" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Demo
          </Link>
          <Button colorScheme="blue">
            Sign Up
          </Button>
        </nav>
      </div>
    </header>
  );
}
