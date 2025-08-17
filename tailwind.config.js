/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",        // App Router pages/layouts
    "./src/pages/**/*.{js,ts,jsx,tsx}",      // Pages Router
    "./src/components/**/*.{js,ts,jsx,tsx}", // Components
    "./node_modules/preline/preline.js",     // Preline UI
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pink: {
          300: "#f472b6",
          400: "#ec4899",
          500: "#db2777",
        },
        blue: {
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'focus-ring': '0 0 0 3px rgba(59, 130, 246, 0.5)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')({
      strategy: 'class', // Use class strategy for forms
    })
  ],
};