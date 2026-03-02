'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { RiArrowRightLine } from 'react-icons/ri';
import {
  FaFacebook,
  FaInstagram,
  FaXTwitter,
  FaWhatsapp,
} from 'react-icons/fa6';
import { SlPhone } from 'react-icons/sl';
import { CiMail, CiLocationOn } from 'react-icons/ci';

const Footer = () => {
  return (
    <div className="bg-(--color-primary-900) px-4 md:px-7 py-12 text-white/70">
      {/* footer container */}
      <footer className="flex flex-col lg:flex-row gap-7">
        {/* left content - Brand & Subscription */}
        <div className="bg-white/5 rounded-[32px] w-full lg:w-4/12 p-8 space-y-6">
          <div className="space-y-5">
            <Image
              src="/assets/images/footer-logo.png"
              alt="My Pharma Logo"
              width={200}
              height={60}
              className="w-40 h-auto"
              priority
            />

            <p className="text-sm leading-relaxed">
              Your trusted online pharmacy for genuine medicines and healthcare
              essentials.
            </p>

            <div className="space-y-4 pt-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-widest">
                Subscribe to our emails
              </h4>
              <div className="relative w-full">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-full border border-white/10 bg-white/5 px-6 py-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-all"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white text-(--color-primary-900) rounded-full flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
                  <RiArrowRightLine size={20} />
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              {[
                { icon: <FaFacebook />, href: 'https://facebook.com' },
                { icon: <FaInstagram />, href: 'https://instagram.com' },
                { icon: <FaXTwitter />, href: 'https://x.com' },
                { icon: <FaWhatsapp />, href: 'https://wa.me/8801755697233' },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex justify-center items-center text-white hover:bg-white hover:text-(--color-primary-900) transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* right content - Links & Info */}
        <div className="bg-white/5 rounded-[32px] p-6 lg:p-10 w-full lg:w-8/12 flex flex-col justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-5">
            {/* column 1 */}
            <div>
              <h3 className="text-white text-sm font-black uppercase tracking-widest mb-6">
                Quick Links
              </h3>
              <div className="text-sm flex flex-col gap-3">
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <Link
                  href="/order-medicine"
                  className="hover:text-white transition-colors"
                >
                  Order Medicines
                </Link>
                <Link
                  href="/upload-prescription"
                  className="hover:text-white transition-colors"
                >
                  Upload Prescription
                </Link>
                <Link
                  href="/health-products"
                  className="hover:text-white transition-colors"
                >
                  Health Products
                </Link>
                <Link
                  href="/consultation"
                  className="hover:text-white transition-colors"
                >
                  Doctor Consultation
                </Link>
              </div>
            </div>

            {/* column 2 */}
            <div>
              <h3 className="text-white text-sm font-black uppercase tracking-widest mb-6">
                Services
              </h3>
              <div className="text-sm flex flex-col gap-3">
                <Link
                  href="/prescription-medicines"
                  className="hover:text-white transition-colors"
                >
                  Prescription Medicines
                </Link>
                <Link
                  href="/otc"
                  className="hover:text-white transition-colors"
                >
                  OTC Medicines
                </Link>
                <Link
                  href="/chronic-care"
                  className="hover:text-white transition-colors"
                >
                  Chronic Care
                </Link>
                <Link
                  href="/lab-test"
                  className="hover:text-white transition-colors"
                >
                  Lab Tests at Home
                </Link>
                <Link
                  href="/medicine-refill"
                  className="hover:text-white transition-colors"
                >
                  Medicine Refill
                </Link>
              </div>
            </div>

            {/* column 3 */}
            <div>
              <h3 className="text-white text-sm font-black uppercase tracking-widest mb-6">
                Compliance
              </h3>
              <div className="text-sm flex flex-col gap-3">
                <Link
                  href="/pharmacy-license"
                  className="hover:text-white transition-colors"
                >
                  Pharmacy License
                </Link>
                <Link
                  href="/regulatory"
                  className="hover:text-white transition-colors"
                >
                  Regulatory Compliance
                </Link>
                <Link
                  href="/quality"
                  className="hover:text-white transition-colors"
                >
                  Quality Assurance
                </Link>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors"
                >
                  Terms & Conditions
                </Link>
              </div>
            </div>

            {/* column 4 */}
            <div>
              <h3 className="text-white text-sm font-black uppercase tracking-widest mb-6">
                Contact
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                    <SlPhone size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                      Hotline
                    </p>
                    <p className="text-xs text-white font-bold">
                      +8809612316708
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                    <CiMail size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                      Support
                    </p>
                    <p className="text-xs text-white font-bold">
                      support@mypharma.com
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                    <CiLocationOn size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                      Address
                    </p>
                    <p className="text-xs text-white font-bold leading-relaxed">
                      Mirpur, Dhaka-1208
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Verification Section - ENLARGED FOR DESKTOP */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12 mt-12 pt-8 border-t border-white/10">
            <div className="space-y-4 w-full lg:flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                We accept:
              </p>
              <div className="relative w-full max-w-[280px] lg:max-w-[500px] xl:max-w-[650px] h-10 lg:h-16">
                <Image
                  src="/assets/images/payment.png"
                  alt="Payment Methods"
                  fill
                  sizes="(max-width: 768px) 280px, (max-width: 1280px) 500px, 650px"
                  className="object-contain object-left"
                />
              </div>
            </div>

            <div className="hidden lg:block h-16 w-px bg-white/10" />

            <div className="space-y-4 w-full lg:w-auto">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                Verified By:
              </p>
              <div className="relative w-full max-w-[140px] lg:max-w-[200px] h-10 lg:h-16">
                <Image
                  src="/assets/images/sslcommerz.png"
                  alt="SSL Commerz Verified"
                  fill
                  sizes="(max-width: 1024px) 140px, 200px"
                  className="object-contain object-left"
                />
              </div>
            </div>
          </div>
        </div>
      </footer>

      <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
        <p>© 2026 My Pharma Limited. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy
          </Link>
          <Link href="/cookies" className="hover:text-white transition-colors">
            Cookies
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;
