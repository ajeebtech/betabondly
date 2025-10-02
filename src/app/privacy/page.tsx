'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box } from '@chakra-ui/react';
import { GrainGradient } from '@paper-design/shaders-react';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
  style: ['italic'], // enable italic
});


export default function PrivacyPage() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join waitlist');
      }

      setShowSuccess(true);
      form.reset();
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error: any) {
      console.error('Error:', error);
      setErrorMessage(error?.message || 'Failed to join waitlist. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box minH="100vh" w="100vw" position="relative" overflow="hidden">
      <GrainGradient 
        style={{ 
          height: '100vh', 
          width: '100%',
          backgroundColor: '#e076b2',
        }}
        colorBack="#e076b2"
        softness={0.7}
        intensity={0.6}
        noise={0.8}
        shape="corners"
        offsetX={0}
        offsetY={0}
        scale={1.1}
        rotation={20}
        speed={2.5}
        colors={[
          "hsl(140, 70%, 70%)",
          "hsl(150, 80%, 65%)",
          "hsl(160, 75%, 60%)",
          "hsl(120, 60%, 75%)"
        ]}
      />

     {/* Header */}
<Box
  position="absolute"
  top={{ base: '80px', md: '120px' }} // moved further down
  left={0}
  right={0}
  zIndex={2}
  display="flex"
  justifyContent="center"
  px={4}
>
  <h1
    className={`${playfair.className} text-center text-3xl md:text-5xl leading-tight`}
    style={{ fontWeight: 700 }}
  >
    privacy policy
  </h1>
</Box>


      <Box 
        position="relative" 
        zIndex={1} 
        w="100%" 
        h="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
      >
        <Box 
          id="waitlist" 
          className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto" 
          bg="white" 
          position="relative" 
          zIndex={2} 
          borderRadius="xl" 
          boxShadow="lg" 
          maxW="container.lg"
        >
          <Box 
            position="absolute" 
            top={0} 
            left={0} 
            right={0} 
            bottom={0} 
            bg="white" 
            zIndex={-1} 
            borderRadius="xl" 
          />
          <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
            <h2 className="text-2xl font-bold md:text-4xl md:leading-tight text-gray-800">
              be notified when it comes out!
            </h2>
            <p className="mt-2 text-gray-600">
              we are a couple making this for the rest of the couples on the internet.
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            <AnimatePresence>
              {(showSuccess || showError) && (
                <motion.div 
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 300, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className={`text-sm rounded-md p-3 ${showSuccess ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {showSuccess ? (
                        <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">
                        {showSuccess ? 'Thank you! 🎉' : 'Something went wrong'}
                      </p>
                      <p className="text-sm">
                        {showSuccess 
                          ? 'Thanks for joining our waitlist! Check your email for updates.'
                          : errorMessage}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form className="hs-form" onSubmit={handleSubmit}>
              <div className="flex flex-col items-center gap-2 sm:flex-row border border-gray-200 rounded-lg p-1">
                <div className="w-full">
                  <label htmlFor="email" className="sr-only">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-20 pl-4">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" className="text-gray-400">
                        <path d="M1 2C0.447715 2 0 2.44772 0 3V12C0 12.5523 0.447715 13 1 13H14C14.5523 13 15 12.5523 15 12V3C15 2.44772 14.5523 2 14 2H1ZM1 3L14 3V3.92494C13.9174 3.92486 13.8338 3.94751 13.7589 3.99505L7.5 7.96703L1.24112 3.99505C1.16621 3.94751 1.0826 3.92486 1 3.92494V3ZM1 4.90797V12H14V4.90797L7.74112 8.87995C7.59394 8.97335 7.40606 8.97335 7.25888 8.87995L1 4.90797Z" fillRule="evenodd" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      className="hs-input py-3 pl-10 pr-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none shadow-sm text-gray-800 bg-white" 
                      placeholder="Enter your email" 
                      style={{ color: '#1a1a1a' }}
                      required
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full sm:w-auto whitespace-nowrap py-3 px-6 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-pink-500 text-white hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Joining...' : 'join waitlist'}
                  {!isSubmitting && (
                    <svg className="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/>
                      <path d="m12 5 7 7-7 7"/>
                    </svg>
                  )}
                </button>
              </div>
              <p className="mt-3 text-sm text-gray-500 text-center">no spam, unsubscribe at any time.</p>
            </form>
          </div>
        </Box>
      </Box>
    </Box>
  );
}
