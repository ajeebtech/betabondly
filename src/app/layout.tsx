import { Inter, Indie_Flower } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';
import PrelineScript from '@/components/PrelineScript';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const indieFlower = Indie_Flower({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-indie-flower',
  display: 'swap',
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
    <html lang="en" className={`${inter.variable} ${indieFlower.variable}`} suppressHydrationWarning>
      <body style={{ minHeight: '100vh', margin: 0, padding: 0 }}>
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