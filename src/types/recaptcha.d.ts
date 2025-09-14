// Extend the Window interface to include reCAPTCHA types
declare global {
  interface Window {
    recaptcha?: any; // We'll use any for now since we don't have the exact type
    grecaptcha?: any; // Some reCAPTCHA implementations use grecaptcha
  }
}

export {}; // This file needs to be a module
