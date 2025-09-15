/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",        // App Router pages/layouts
    "./src/pages/**/*.{js,ts,jsx,tsx}",      // Pages Router
    "./src/components/**/*.{js,ts,jsx,tsx}", // Components
    "./node_modules/preline/preline.js",     // Preline UI
  ],
  theme: {
    extend: {
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        'fade-out': {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        'zoom-in': {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        'zoom-out': {
          '0%': { opacity: 1, transform: 'scale(1)' },
          '100%': { opacity: 0, transform: 'scale(0.95)' },
        },
        'slide-in-from-top': {
          '0%': { transform: 'translateY(-10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'slide-out-to-top': {
          '0%': { transform: 'translateY(0)', opacity: 1 },
          '100%': { transform: 'translateY(-10px)', opacity: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 150ms ease-out',
        'fade-out': 'fade-out 150ms ease-in',
        'zoom-in': 'zoom-in 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'zoom-out': 'zoom-out 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-from-top': 'slide-in-from-top 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-out-to-top': 'slide-out-to-top 200ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        pink: {
          300: "#f472b6",
          400: "#ec4899",
          500: "#db2777",
        },
        blue: {
          500: "#3b82f6",
          600: "#2563eb",
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        'indie-flower': ['Indie Flower', 'cursive'],
      },
      boxShadow: {
        'focus-ring': '0 0 0 3px rgba(59, 130, 246, 0.5)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'rainbow': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'fadeIn': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'fadeOut': {
          'from': { opacity: '1' },
          'to': { opacity: '0' },
        },
        'zoomIn': {
          'from': { transform: 'scale(0.95)' },
          'to': { transform: 'scale(1)' },
        },
        'zoomOut': {
          'from': { transform: 'scale(1)' },
          'to': { transform: 'scale(0.95)' },
        },
        'slideInFromTop': {
          'from': { transform: 'translate(-50%, -60%)' },
          'to': { transform: 'translate(-50%, -50%)' },
        },
        'slideOutToTop': {
          'from': { transform: 'translate(-50%, -50%)' },
          'to': { transform: 'translate(-50%, -60%)' },
        },
      },
      animation: {
        'rainbow': 'rainbow 8s ease infinite',
        'fade-in': 'fadeIn 150ms ease-out',
        'fade-out': 'fadeOut 150ms ease-in',
        'zoom-in': 'zoomIn 150ms ease-out',
        'zoom-out': 'zoomOut 150ms ease-in',
        'slide-in': 'slideInFromTop 150ms ease-out',
        'slide-out': 'slideOutToTop 150ms ease-in',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')({ strategy: 'class' }),
    require('daisyui'),
  ],
  daisyui: {
    themes: ["light"],
    darkTheme: false,
  },
};