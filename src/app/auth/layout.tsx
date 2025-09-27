import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './auth.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authenticate to access your account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
          {children}
        </div>
      </body>
    </html>
  );
}
