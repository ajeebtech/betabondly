'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    recaptchaLoaded?: () => void;
  }
}

export function RecaptchaLoader() {
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    // Check if reCAPTCHA is already loaded
    if (window.recaptcha) {
      console.log('reCAPTCHA already loaded');
      return;
    }

    console.log('Loading reCAPTCHA script...');
    
    // Create script element
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    
    // Add error handling
    script.onerror = () => {
      console.error('Failed to load reCAPTCHA script');
    };
    
    // Add to document
    document.body.appendChild(script);
    
    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return null;
}
