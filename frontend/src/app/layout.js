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
        {/* 
          CartProvider: Enables real-time cart updates across the app.
          LayoutWrapper: Manages the conditional rendering of Header, Footer, and Sidebar.
        */}
        <CartProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
