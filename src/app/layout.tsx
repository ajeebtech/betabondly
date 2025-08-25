import { Inter, Indie_Flower } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';
import PrelineScript from '@/components/PrelineScript';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  fallback: ['system-ui', 'sans-serif']
});

const indieFlower = Indie_Flower({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-indie-flower',
  fallback: ['cursive']
});

export const metadata = {
  title: 'bondly.',
  description: 'Your application description',
};

import Navbar from '@/components/Navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{
        fontFamily: 'var(--font-inter), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        minHeight: '100vh',
        margin: 0,
        padding: 0
      }} className={`${inter.variable} ${indieFlower.variable}`}>
        <Providers>
          <Navbar />
          <main>
            {children}
          </main>
          <PrelineScript />
        </Providers>
      </body>
    </html>
  );
}