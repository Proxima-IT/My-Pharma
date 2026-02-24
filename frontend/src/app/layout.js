import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import LayoutWrapper from './LayoutWrapper';

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
          ROOT CAUSE FIXED: 
          We now use LayoutWrapper. This component contains the logic 
          to show the Sidebar, Header, and Footer based on the URL.
        */}
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
