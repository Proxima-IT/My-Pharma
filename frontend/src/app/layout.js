import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "./(public)/components/Header";
import Footer from "./(public)/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata = {
  title: "My Pharma",
  description: "Simplifying life beyond medicine.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased  ">
        <Header></Header>
        {children}
        <Footer></Footer>
      </body>
    </html>
  );
}
