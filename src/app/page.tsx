'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Box, Container, Text, VStack, HStack, Icon } from '@chakra-ui/react'
import { AnimatedGradientBadge } from "@/components/magicui/animated-gradient-badge"
import { AnimatedSubscribeButton } from "@/components/magicui/animated-subscribe-button"
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { HowItWorks } from "@/components/HowItWorks";
import { GrainGradient } from '@paper-design/shaders-react';
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: [0.16, 1, 0.3, 1] as const 
    } 
  },
} as const

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
}

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

export default function Home() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <Box minH="100vh" position="relative" overflow="hidden" className="hero-section" bg="var(--background)">

      {/* Hero Section */}
      <Box 
        as="main" 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        position="relative"
        zIndex={1}
        pt={16} // Account for fixed navbar
        pb={20}
      >
        {/* Grain Gradient Background */}
        <Box 
          position="absolute" 
          top={0} 
          left={0} 
          right={0} 
          bottom={0} 
          zIndex={0}
          overflow="hidden"
        >
          <GrainGradient
            style={{ 
              position: 'absolute',
              width: '100%',
              height: '100%',
              opacity: 0.7,
              mixBlendMode: 'multiply'  // This will help blend the colors
            }}
            colorBack="hsl(30, 100%, 97%)"  // Cream white as background
            softness={0.6}
            intensity={0.6}
            noise={1}
            shape="corners"
            offsetX={0}
            offsetY={0}
            scale={1}
            rotation={0}
            speed={3.5}
            colors={[
              "hsl(30, 100%, 97%)",  // Cream white
              "hsl(30, 90%, 94%)",   // Light cream
              "hsl(272, 76%, 93%)",  // Light purple
              "hsl(338, 100%, 95%)", // Very light pink
              "hsl(338, 100%, 90%)", // Light pink
              "hsl(338, 100%, 85%)", // Medium light pink
              "hsl(338, 100%, 80%)"  // Slightly darker pink
            ]}
          />
        </Box>

        <Container 
          maxW="container.xl" 
          position="relative" 
          zIndex={1} 
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minH={{ base: 'calc(100vh - 80px)', md: 'calc(100vh - 100px)' }}
          pt="80px"
          px={4}
        >
          <Box
            as={motion.div}
            initial="hidden"
            animate="show"
            variants={stagger}
            w="100%"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center w-full max-w-6xl mx-auto">
              {/* Left column: tagline */}
              <div className="md:col-span-5">
                <Text 
                  as={motion.p} 
                  variants={fadeUp} 
                  fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }} 
                  fontWeight="normal"
                  color="gray.900" // spans will override
                  opacity={1}
                  className="leading-tight tracking-tight"
                  maxW="36rem"
                  textAlign={{ base: 'center', md: 'left' }}
                  mt={{ base: 0, md: -6, lg: -10 }}
                >
                  <span className="block text-gray-600 font-normal">your little corner of the internet,</span>
                  <span className="block mt-1 text-gray-900 font-bold">
                    only for <span className="font-bold" style={{ color: '#e60076' }}>two</span>.
                  </span>
                </Text>
              </div>

              {/* Right column: main hero content */}
              <div className="md:col-span-7 -mt-6 md:-mt-12 lg:-mt-16 xl:-mt-20">
                <Box position="relative" zIndex={10} w="full">
                  <Text
                    as={motion.p}
                    variants={fadeUp}
                    fontSize={{ base: '4.5rem', sm: '6rem', md: '8rem' }}
                    fontWeight="bold"
                    color="#e60076"
                    lineHeight={1}
                    letterSpacing="tighter"
                    textShadow={[
                      '2px 2px 4px rgba(0, 0, 0, 0.2)',
                      '0 0 10px rgba(0, 0, 0, 0.15)',
                      '0 0 20px rgba(0, 0, 0, 0.1)'
                    ].join(', ')}                
                    textAlign={{ base: 'center', md: 'left' }}
                  >
                    bondly.
                  </Text>
                </Box>
          {/* Top-right waitlist form (desktop/tablet) */}
          <Box 
            className="hidden md:block"
            position="absolute"
            right={{ base: 2, md: 6, lg: 10 }}
            top={{ base: 2, md: 6, lg: 8 }}
            zIndex={2}
          >
            <form className="hs-form" onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;
              const submitButton = form.querySelector('button[type=\"submit\"]') as HTMLButtonElement;
              
              // Basic email validation
              if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                alert('Please enter a valid email address');
                return;
              }
              
              try {
                // Disable button and show loading state
                submitButton.disabled = true;
                submitButton.innerHTML = 'Joining...';
                
                const response = await fetch('/api/waitlist', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ email }),
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                  throw new Error(data.error || 'Something went wrong');
                }
                
                setShowSuccess(true);
                setShowError(false);
                form.reset();
                // Hide success message after 5 seconds
                setTimeout(() => setShowSuccess(false), 5000);
              } catch (error: any) {
                console.error('Error:', error);
                setErrorMessage(error?.message || 'Failed to join waitlist. Please try again.');
                setShowError(true);
                // Hide error message after 5 seconds
                setTimeout(() => setShowError(false), 5000);
              } finally {
                // Re-enable button
                submitButton.disabled = false;
                submitButton.innerHTML = 'join waitlist <svg class="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
              }
            }}>
              <div className="flex flex-col items-center gap-2 sm:flex-row">
                <div className="hidden sm:block">
                  <AnimatedGradientBadge text="early access • be the first" />
                </div>
                <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-lg p-1 bg-white shadow-sm">
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
                        className="hs-input py-3 pl-10 pr-4 block w-full sm:w-72 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none shadow-sm text-gray-800 bg-white" 
                        placeholder="Enter your email" 
                        style={{ color: '#1a1a1a' }}
                        required
                      />
                    </div>
                  </div>
                </div>
                <AnimatedSubscribeButton 
                  type="submit"
                  className="w-full sm:w-auto whitespace-nowrap py-3 px-6 text-sm font-semibold rounded-lg border border-transparent bg-[#e60076] text-white hover:bg-[#cc0066] focus:outline-none focus:ring-2 focus:ring-[#e60076] focus:ring-offset-2 transition-all"
                  subscribeStatus={showSuccess}
                  onClick={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget.form;
                    if (!form) return;
                    
                    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;
                    const submitButton = form.querySelector('button[type=\"submit\"]') as HTMLButtonElement;
                    
                    // Basic email validation
                    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                      setErrorMessage('Please enter a valid email address');
                      setShowError(true);
                      setTimeout(() => setShowError(false), 5000);
                      return;
                    }
                    
                    try {
                      // Disable button and show loading state
                      submitButton.disabled = true;
                      
                      const response = await fetch('/api/waitlist', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email }),
                      });
                      
                      const data = await response.json();
                      
                      if (!response.ok) {
                        throw new Error(data.error || 'Something went wrong');
                      }
                      
                      setShowSuccess(true);
                      setShowError(false);
                      form.reset();
                      // Hide success message after 5 seconds
                      setTimeout(() => setShowSuccess(false), 5000);
                    } catch (error: any) {
                      console.error('Error:', error);
                      setErrorMessage(error?.message || 'Failed to join waitlist. Please try again.');
                      setShowError(true);
                      // Hide error message after 5 seconds
                      setTimeout(() => setShowError(false), 5000);
                    } finally {
                      // Re-enable button
                      submitButton.disabled = false;
                    }
                  }}
                >
                  <span className="group inline-flex items-center">
                    join waitlist
                    <ChevronRightIcon className="ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <span className="group inline-flex items-center">
                    <CheckIcon className="mr-1 size-4" />
                    Joined!
                  </span>
                </AnimatedSubscribeButton>
              </div>
            </form>
          </Box>

                <HStack 
                  as={motion.div} 
                  variants={fadeUp} 
                  spacing={6} 
                  pt={4}
                  flexWrap="wrap"
                  justifyContent={{ base: 'center', md: 'flex-start' }}
                >
                  <form className="hs-form md:hidden" onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;
                    const submitButton = form.querySelector('button[type=\"submit\"]') as HTMLButtonElement;
                    
                    // Basic email validation
                    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                      alert('Please enter a valid email address');
                      return;
                    }
                    
                    try {
                      // Disable button and show loading state
                      submitButton.disabled = true;
                      submitButton.innerHTML = 'Joining...';
                      
                      const response = await fetch('/api/waitlist', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email }),
                      });
                      
                      const data = await response.json();
                      
                      if (!response.ok) {
                        throw new Error(data.error || 'Something went wrong');
                      }
                      
                      setShowSuccess(true);
                      setShowError(false);
                      form.reset();
                      // Hide success message after 5 seconds
                      setTimeout(() => setShowSuccess(false), 5000);
                    } catch (error: any) {
                      console.error('Error:', error);
                      setErrorMessage(error?.message || 'Failed to join waitlist. Please try again.');
                      setShowError(true);
                      // Hide error message after 5 seconds
                      setTimeout(() => setShowError(false), 5000);
                    } finally {
                      // Re-enable button
                      submitButton.disabled = false;
                      submitButton.innerHTML = 'join waitlist <svg class="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
                    }
                  }}>
                    <div className="flex flex-col items-center gap-2 sm:flex-row border border-gray-200 rounded-lg p-1 bg-white">
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
                            className="hs-input py-3 pl-10 pr-4 block w-full sm:w-72 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none shadow-sm text-gray-800 bg-white" 
                            placeholder="Enter your email" 
                            style={{ color: '#1a1a1a' }}
                            required
                          />
                        </div>
                      </div>
                      <AnimatedSubscribeButton 
                        type="submit"
                        className="w-full sm:w-auto whitespace-nowrap py-3 px-6 text-sm font-semibold rounded-lg border border-transparent bg-[#e60076] text-white hover:bg-[#cc0066] focus:outline-none focus:ring-2 focus:ring-[#e60076] focus:ring-offset-2 transition-all"
                        subscribeStatus={showSuccess}
                        onClick={async (e) => {
                          e.preventDefault();
                          const form = e.currentTarget.form;
                          if (!form) return;
                          
                          const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;
                          const submitButton = form.querySelector('button[type=\"submit\"]') as HTMLButtonElement;
                          
                          // Basic email validation
                          if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                            setErrorMessage('Please enter a valid email address');
                            setShowError(true);
                            setTimeout(() => setShowError(false), 5000);
                            return;
                          }
                          
                          try {
                            // Disable button and show loading state
                            submitButton.disabled = true;
                            
                            const response = await fetch('/api/waitlist', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({ email }),
                            });
                            
                            const data = await response.json();
                            
                            if (!response.ok) {
                              throw new Error(data.error || 'Something went wrong');
                            }
                            
                            setShowSuccess(true);
                            setShowError(false);
                            form.reset();
                            // Hide success message after 5 seconds
                            setTimeout(() => setShowSuccess(false), 5000);
                          } catch (error: any) {
                            console.error('Error:', error);
                            setErrorMessage(error?.message || 'Failed to join waitlist. Please try again.');
                            setShowError(true);
                            // Hide error message after 5 seconds
                            setTimeout(() => setShowError(false), 5000);
                          } finally {
                            // Re-enable button
                            submitButton.disabled = false;
                          }
                        }}
                      >
                        <span className="group inline-flex items-center">
                          join waitlist
                          <ChevronRightIcon className="ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                        <span className="group inline-flex items-center">
                          <CheckIcon className="mr-1 size-4" />
                          Joined!
                        </span>
                      </AnimatedSubscribeButton>
                    </div>
                  </form>
                </HStack>
              </div>
            </div>
          </Box>
          {/* Bottom-right mockup placeholder (replace with your asset) */}
          <Box 
            className="hidden md:block"
            position="absolute"
            right={{ base: 2, md: 10, lg: 16 }}
            bottom={{ base: 2, md: 10, lg: 16 }}
            zIndex={3}
            pointerEvents="auto"
          >
            <motion.div
              initial={{ opacity: 0, x: 60, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div 
                className="relative w-[420px] lg:w-[640px] h-[260px] lg:h-[400px]"
                animate={{ y: [0, -8, 0], rotate: [0, -0.2, 0.2, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <CardContainer containerClassName="py-0">
                  <CardBody className="relative w-[420px] lg:w-[640px] h-[260px] lg:h-[400px] rounded-xl border border-black/5 bg-transparent">
                    {/* Subtle outer outline to complete the window */}
                    <CardItem translateZ={40} className="absolute inset-0 rounded-xl border border-black/10 shadow-[0_0_0_1px_rgba(0,0,0,0.02)_inset]" aria-hidden="true">
                      <span className="sr-only">window outline</span>
                    </CardItem>
                    {/* Laptop frame */}
                    <CardItem translateZ={60} className="absolute inset-0 rounded-xl bg-white/90 border border-black/5 shadow-2xl">
                      {/* Top bar */}
                      <div className="h-9 flex items-center gap-2 px-4 border-b border-black/5 bg-gray-50/80 rounded-t-xl">
                        <span className="w-3 h-3 rounded-full bg-red-400/80"></span>
                        <span className="w-3 h-3 rounded-full bg-yellow-400/80"></span>
                        <span className="w-3 h-3 rounded-full bg-green-400/80"></span>
                        <div className="ml-3 flex-1 h-6 rounded-md bg-gray-100 border border-black/5" />
                      </div>
                    </CardItem>
                    {/* Screen area */}
                    <CardItem translateZ={100} className="absolute inset-x-0 bottom-0 top-9 p-4 bg-white rounded-b-xl overflow-hidden">
                      <div className="w-full h-full rounded-lg border border-black/5 bg-white">
                        {/* Tabs + address bar (browser chrome) */}
                        <div className="flex items-center gap-2 p-2 border-b border-black/5 bg-gray-50">
                          <div className="flex gap-1">
                            <div className="px-2 py-1 text-[10px] rounded bg-white border border-black/10 text-gray-600">bondly</div>
                            <div className="px-2 py-1 text-[10px] rounded bg-gray-100 border border-black/10 text-gray-500">docs</div>
                            <div className="px-2 py-1 text-[10px] rounded bg-gray-100 border border-black/10 text-gray-500 hidden sm:block">pricing</div>
                          </div>
                          <div className="ml-auto h-7 w-2/3 rounded-md bg-white border border-black/10 shadow-inner" />
                        </div>
                        {/* Page content (desktop wide) */}
                        <div className="p-4 space-y-4">
                          <div className="h-28 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-black/5" />
                          <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2 h-24 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 border border-black/5" />
                            <div className="h-24 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 border border-black/5" />
                            <div className="h-20 rounded-lg bg-white border border-black/5 shadow-sm" />
                            <div className="h-20 rounded-lg bg-white border border-black/5 shadow-sm" />
                            <div className="h-20 rounded-lg bg-white border border-black/5 shadow-sm" />
                          </div>
                        </div>
                        {/* Soft glare */}
                        <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-tr from-white/40 to-transparent" />
                      </div>
                    </CardItem>
                    {/* Laptop base/keyboard hint */}
                    <CardItem translateZ={20} className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[85%] h-4 rounded-b-xl bg-gray-200/90 border border-black/5">
                      <span className="sr-only">laptop base</span>
                    </CardItem>
                  </CardBody>
                </CardContainer>
              </motion.div>
            </motion.div>
          </Box>
        </Container>
      </Box>
      
      {/* Gradient transition with subtle shadow */}
      <Box 
        h="100px" 
        w="100%" 
        position="relative" 
        zIndex={1}
        style={{
          background: 'linear-gradient(0deg, var(--main-bg) 0%, var(--background) 100%)',
          marginTop: '-40px',
          marginBottom: '40px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
        }}
      />
      
      {/* Features Section */}
      <Box id="features" className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto" position="relative" zIndex={2}>
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-1">
            <h2 className="font-bold text-2xl md:text-3xl text-gray-800">
              Making long-distance love feel closer than ever
            </h2>
            <p className="mt-2 md:mt-4 text-gray-600">
              A small private space for you on the internet to write posts, plan dates, document everything you do, and most importantly, communicate.
            </p>
          </div>
          {/* End Col */}

          <div className="lg:col-span-2">
            <div className="grid sm:grid-cols-2 gap-8 md:gap-12">
              {/* Icon Block */}
              <div className="flex gap-x-5">
                <svg className="shrink-0 mt-1 size-6 text-[#e11d48]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" x2="8" y1="16" y2="16"/><line x1="16" x2="16" y1="16" y2="16"/></svg>
                <div className="grow">
                  <h3 className="text-lg font-semibold text-gray-800">
                    private & secure
                  </h3>
                  <p className="mt-1 text-gray-600">
                    Your space is just for the two of you, with end-to-end encryption and no distractions.
                  </p>
                </div>
              </div>
              {/* End Icon Block */}

              {/* Icon Block */}
              <div className="flex gap-x-5">
                <svg className="shrink-0 mt-1 size-6 text-[#e11d48]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
                <div className="grow">
                  <h3 className="text-lg font-semibold text-gray-800">
                    silly and simple
                  </h3>
                  <p className="mt-1 text-gray-600">
                    Clean, modern design that puts your relationship first, making every interaction special.
                  </p>
                </div>
              </div>
              {/* End Icon Block */}

              {/* Icon Block */}
              <div className="flex gap-x-5">
                <svg className="shrink-0 mt-1 size-6 text-[#e11d48]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                <div className="grow">
                  <h3 className="text-lg font-semibold text-gray-800">
                    document everything
                  </h3>
                  <p className="mt-1 text-gray-600">
                    From sweet messages to important dates, keep all your memories organized in one place.
                  </p>
                </div>
              </div>
              {/* End Icon Block */}

              {/* Icon Block */}
              <div className="flex gap-x-5">
                <svg className="shrink-0 mt-1 size-6 text-[#e11d48]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <div className="grow">
                  <h3 className="text-lg font-semibold text-gray-800">
                    built for just you two.
                  </h3>
                  <p className="mt-1 text-gray-600">
                    Every feature is designed with your relationship in mind, making it easy to stay connected.
                  </p>
                </div>
              </div>
              {/* End Icon Block */}
            </div>
          </div>
          {/* End Col */}
        </div>
        {/* End Grid */}
      </Box>

      {/* How It Works Section */}
      <Box id="how-it-works" py={20} position="relative" zIndex={2}>
        <Box 
          position="absolute" 
          top={0} 
          left={0} 
          right={0} 
          bottom={0} 
          style={{
            background: 'linear-gradient(0deg, var(--main-bg) 0%, rgba(255, 250, 230, 0.98) 100%)',
            zIndex: -1,
            borderTop: '1px solid rgba(0, 0, 0, 0.05)'
          }} 
        />
        <HowItWorks />
      </Box>

      {/* Subscribe Section */}
      <Box id="waitlist" className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto" bg="white" position="relative" zIndex={2}>
        <Box position="absolute" top={0} left={0} right={0} bottom={0} bg="white" zIndex={-1} />
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
          <form className="hs-form" onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;
            const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
            
            // Basic email validation
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              alert('Please enter a valid email address');
              return;
            }
            
            try {
              // Disable button and show loading state
              submitButton.disabled = true;
              submitButton.innerHTML = 'Joining...';
              
              const response = await fetch('/api/waitlist', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
              });
              
              const data = await response.json();
              
              if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
              }
              
              setShowSuccess(true);
              setShowError(false);
              form.reset();
              // Hide success message after 5 seconds
              setTimeout(() => setShowSuccess(false), 5000);
            } catch (error: any) {
              console.error('Error:', error);
              setErrorMessage(error?.message || 'Failed to join waitlist. Please try again.');
              setShowError(true);
              // Hide error message after 5 seconds
              setTimeout(() => setShowError(false), 5000);
            } finally {
              // Re-enable button
              submitButton.disabled = false;
              submitButton.innerHTML = 'join waitlist <svg class="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
            }
          }}>
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
              <AnimatedSubscribeButton 
                type="submit"
                className="w-full sm:w-auto whitespace-nowrap py-3 px-6 text-sm font-semibold rounded-lg border border-transparent bg-[#e60076] text-white hover:bg-[#cc0066] focus:outline-none focus:ring-2 focus:ring-[#e60076] focus:ring-offset-2 transition-all"
                subscribeStatus={showSuccess}
                onClick={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget.form;
                  if (!form) return;
                  
                  const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;
                  const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
                  
                  // Basic email validation
                  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    setErrorMessage('Please enter a valid email address');
                    setShowError(true);
                    setTimeout(() => setShowError(false), 5000);
                    return;
                  }
                  
                  try {
                    // Disable button and show loading state
                    submitButton.disabled = true;
                    
                    const response = await fetch('/api/waitlist', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ email }),
                    });
                    
                    const data = await response.json();
                    
                    if (!response.ok) {
                      throw new Error(data.error || 'Something went wrong');
                    }
                    
                    setShowSuccess(true);
                    setShowError(false);
                    form.reset();
                    // Hide success message after 5 seconds
                    setTimeout(() => setShowSuccess(false), 5000);
                  } catch (error: any) {
                    console.error('Error:', error);
                    setErrorMessage(error?.message || 'Failed to join waitlist. Please try again.');
                    setShowError(true);
                    // Hide error message after 5 seconds
                    setTimeout(() => setShowError(false), 5000);
                  } finally {
                    // Re-enable button
                    submitButton.disabled = false;
                  }
                }}
              >
                <span className="group inline-flex items-center">
                  join waitlist
                  <ChevronRightIcon className="ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <span className="group inline-flex items-center">
                  <CheckIcon className="mr-1 size-4" />
                  Joined!
                </span>
              </AnimatedSubscribeButton>
            </div>
          </form>
          <p className="mt-3 text-sm text-gray-500">no spam, unsubscribe at any time.</p>
        </div>
      </Box>

      {/* Footer */}
      <Box py={6} borderTopWidth={1} borderColor="gray.200" bg="white" position="relative" zIndex={2}>
        <Box position="absolute" top={0} left={0} right={0} bottom={0} bg="white" zIndex={-1} />
        <Container maxW="container.xl" textAlign="center">
          <Text
            as={motion.p}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            fontSize="sm"
            color="gray.500"
          >
            {new Date().getFullYear()} ajeebtech.
          </Text>
        </Container>
      </Box>
    </Box>
  );
}
