import { Suspense } from 'react';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import LayoutWrapper from './LayoutWrapper';
import { CartProvider } from './(public)/context/CartContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata = {
  title: 'My Pharma',
  description: 'Simplifying life beyond medicine.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased" suppressHydrationWarning={true}>
        <CartProvider>
          {/* 
            UNIVERSAL FIX: Wrapping LayoutWrapper in Suspense 
            resolves useSearchParams() build errors for Header, Sidebar, and all Pages.
          */}
          <Suspense fallback={null}>
            <LayoutWrapper>{children}</LayoutWrapper>
          </Suspense>
        </CartProvider>
      </body>
    </html>
  );
}
