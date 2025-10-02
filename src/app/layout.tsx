import { Inter, Indie_Flower } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from 'sonner';
import './globals.css';

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

import { Header } from '@/components/Header';
import { GrainGradient } from '@paper-design/shaders-react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Remove the server-side injected class
                  if (document.documentElement.classList.contains('chakra-ui-light') || 
                      document.documentElement.classList.contains('chakra-ui-dark')) {
                    document.documentElement.classList.remove('chakra-ui-light', 'chakra-ui-dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body style={{
        fontFamily: 'var(--font-inter), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        position: 'relative'
      }} className={`${inter.variable} ${indieFlower.variable}`}>
        <div className="fixed inset-0 -z-10">
          <GrainGradient
            style={{
              width: '100vw',
              height: '100vh',
              backgroundColor: '#e076b2',
              position: 'fixed',
              top: 0,
              left: 0,
            }}
            colors={["#ffffff", "#fef6ff", "#ffe6ff", "#ffffff"]}
            colorBack="#ffffff"
            softness={0.5}
            intensity={0.5}
            noise={0.15}
            shape="corners"
            speed={0.8}
          />
        </div>
        <Providers>
          <div className="relative z-10">
            <Header />
            <main>
              {children}
              <Toaster position="top-center" richColors />
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}