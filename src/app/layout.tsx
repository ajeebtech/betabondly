import { Homemade_Apple, Inter } from 'next/font/google';
import { ColorModeScript } from '@chakra-ui/react';
import theme from '@/theme';

const inter = Inter({ subsets: ['latin'] });
const homemadeApple = Homemade_Apple({ 
  weight: '400', 
  subsets: ['latin'],
  variable: '--font-homemade-apple'
});

export const metadata = {
  title: 'Bondly - Connect & Share Privately',
  description: 'A private space for couples to share moments securely',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'gray.900' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      </head>
      <body className={`${inter.className} ${homemadeApple.variable} font-sans min-h-screen bg-white dark:bg-gray-900`}>
        {children}
      </body>
    </html>
  );
}
