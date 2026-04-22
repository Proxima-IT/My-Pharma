import { Suspense } from 'react';
import './globals.css';
import LayoutWrapper from './LayoutWrapper';
import { CartProvider } from './(public)/context/CartContext';

export const metadata = {
  title: 'My Pharma',
  description: 'Simplifying life beyond medicine.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
