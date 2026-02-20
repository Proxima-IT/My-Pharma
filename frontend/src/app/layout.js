import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "./(public)/components/Header";
import Footer from "./(public)/components/Footer";
import Sidebar from "./(public)/components/Sidebar";

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
        {/* website header  */}
        <Header></Header>
        {/* main content */}
        {/* <div className="lg:flex lg:gap-8 w-full px-2.5 lg:px-7 py-6 ">
          <div className="w-3/12 sticky top-0 h-screen overflow-y-auto">
            <Sidebar></Sidebar>
          </div>
          <div className="flex-1  "></div>
        </div> */}
        {children}
        {/* footer section  */}
        <Footer></Footer>
      </body>
    </html>
  );
}
