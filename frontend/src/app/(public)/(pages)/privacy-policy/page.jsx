'use client';

import React from 'react';
import Link from 'next/link';
import { FiShield, FiLock, FiInfo, FiMail, FiPhone } from 'react-icons/fi';

/**
 * Privacy Policy Page Component
 * Architecture: Deterministic static content with premium typography.
 * Design: Public Storefront (Shadow-free, rounded-[32px], primary blue theme).
 */
export default function PrivacyPolicyPage() {
  const lastUpdated = 'May 2026';

  return (
    <div className="w-full space-y-12 pb-20 animate-in fade-in duration-700 bg-white min-h-screen">
      {/* Header Banner */}
      <section className="bg-(--color-primary-25) py-16 px-4 text-center border-b border-gray-100">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto text-(--color-primary-500) shadow-sm border border-primary-50">
            <FiShield size={32} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase leading-none">
            Privacy Policy
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10 text-gray-700 leading-relaxed">
        <section className="bg-white border border-gray-100 rounded-[32px] p-8 sm:p-12 space-y-6">
          <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl">
            <p className="text-sm font-medium text-amber-800">
              Please read this Privacy Policy carefully before accessing or
              using the website, mobile application, or any services operated by
              My Pharma Limited. By accessing or using our Platform, you agree
              to the practices described in this Privacy Policy. If you do not
              agree with any part of this Policy, please discontinue use of the
              Platform.
            </p>
          </div>

          <div className="space-y-8">
            {/* 1. Introduction */}
            <article className="space-y-3">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <span className="text-(--color-primary-500)">1.</span>{' '}
                Introduction
              </h2>
              <div className="space-y-4 pl-8">
                <p>
                  This Privacy Policy applies to the website{' '}
                  <strong>mypharma.com.bd</strong>, associated mobile
                  applications, digital tools, and healthcare-related services
                  operated by My Pharma Limited (“My Pharma”, “we”, “our”, or
                  “us”).
                </p>
                <p>
                  My Pharma Limited is incorporated in Bangladesh under RJSC
                  Registration No. C-208341/2026.
                </p>
                <div className="bg-gray-50 p-4 rounded-2xl space-y-1 text-sm border border-gray-100">
                  <p>
                    <strong>Registered Address:</strong> Flat B-4, Dominno Sorrel, 131/1 New Eskaton Road, Ramna, Dhaka-1000
                  </p>
                  <p>
                    <strong>Phone:</strong> 01335236650
                  </p>
                  <p>
                    <strong>Email:</strong> support@mypharma.com.bd
                  </p>
                </div>
              </div>
            </article>

            {/* 2. Scope */}
            <article className="space-y-3">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <span className="text-(--color-primary-500)">2.</span> Scope of
                Services
              </h2>
              <div className="pl-8">
                <p className="mb-3">
                  My Pharma provides an online healthcare and pharmacy platform
                  that may include:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-4 marker:text-(--color-primary-500)">
                  <li>Online medicine ordering</li>
                  <li>Prescription medicine processing</li>
                  <li>Healthcare and wellness products</li>
                  <li>Diagnostic and lab-related services</li>
                  <li>Telemedicine or online consultation support</li>
                </ul>
              </div>
            </article>

            {/* 3. Collection */}
            <article className="space-y-3">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <span className="text-(--color-primary-500)">3.</span>{' '}
                Information We Collect
              </h2>
              <div className="pl-8 space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 uppercase text-sm tracking-widest mb-2">
                    3.1 Personal Information
                  </h3>
                  <p className="text-sm">
                    Full name, Phone number, Email address, Delivery/billing
                    address, Gender, Age, DOB, login credentials, uploaded
                    prescriptions, and shared health info.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 uppercase text-sm tracking-widest mb-2">
                    3.2 Transaction Information
                  </h3>
                  <p className="text-sm">
                    Order history, Payment information, Billing details,
                    Delivery records, and Subscription preferences.
                  </p>
                </div>
              </div>
            </article>

            {/* 4-6 Logic */}
            <article className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <span className="text-(--color-primary-500)">4.</span> How We
                  Collect Information
                </h2>
                <p className="pl-8">
                  Information is collected via account registration, order
                  placement, prescription uploads, support interactions, and
                  cookies.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <span className="text-(--color-primary-500)">5.</span> Use of
                  Information
                </h2>
                <p className="pl-8">
                  We use data for managing accounts, processing orders,
                  verifying prescriptions, customer support, and complying with
                  legal obligations.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <span className="text-(--color-primary-500)">6.</span>{' '}
                  Prescription and Health Information
                </h2>
                <p className="pl-8">
                  Prescription data is strictly used for verification, medicine
                  dispensing, and regulatory compliance. We maintain strict
                  confidentiality protocols.
                </p>
              </div>
            </article>

            {/* 7-9 Storage */}
            <article className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest mb-3 flex items-center gap-2">
                  <FiLock className="text-(--color-primary-500)" /> 10. Data
                  Security
                </h3>
                <p className="text-sm">
                  We implement technical and organizational measures to prevent
                  unauthorized access. However, internet transmissions carry
                  inherent risks.
                </p>
              </div>
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest mb-3 flex items-center gap-2">
                  <FiInfo className="text-(--color-primary-500)" /> 11. User
                  Rights
                </h3>
                <p className="text-sm">
                  You may access, update, or request deletion of your data via
                  support@mypharma.com.bd or 01335236650.
                </p>
              </div>
            </article>

            {/* 16. Contact */}
            <article className="pt-8 border-t border-gray-100 text-center space-y-4">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
                Contact Our Privacy Office
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="mailto:support@mypharma.com.bd"
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full font-bold text-sm text-(--color-primary-500) hover:bg-gray-50 transition-all"
                >
                  <FiMail /> support@mypharma.com.bd
                </a>
                <a
                  href="tel:01335236650"
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full font-bold text-sm text-(--color-primary-500) hover:bg-gray-50 transition-all"
                >
                  <FiPhone /> 01335236650
                </a>
              </div>
            </article>
          </div>
        </section>

        {/* Bengali Summary */}
        <section className="bg-(--color-primary-500) rounded-[32px] p-8 sm:p-12 text-white space-y-6">
          <h2 className="text-3xl font-black tracking-tight">
            বাংলা প্রাইভেসি পলিসি (সংক্ষিপ্ত)
          </h2>
          <p className="opacity-90 font-medium leading-relaxed">
            My Pharma Limited ব্যবহারকারীদের ব্যক্তিগত তথ্যের গোপনীয়তা ও
            নিরাপত্তাকে গুরুত্ব সহকারে বিবেচনা করে। এই প্রাইভেসি পলিসি ব্যাখ্যা
            করে কীভাবে mypharma.com.bd ওয়েবসাইট ও সংশ্লিষ্ট সেবার মাধ্যমে তথ্য
            সংগ্রহ, ব্যবহার ও সংরক্ষণ করা হয়।
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
            <div className="space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-white/60">
                তথ্য ব্যবহারের উদ্দেশ্য:
              </h4>
              <ul className="space-y-1">
                <li>• অর্ডার প্রসেসিং</li>
                <li>• ওষুধ ও স্বাস্থ্যপণ্য ডেলিভারি</li>
                <li>• কাস্টমার সাপোর্ট</li>
                <li>• প্রেসক্রিপশন যাচাইকরণ</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-white/60">
                আপনার অধিকার:
              </h4>
              <p>
                ব্যবহারকারীরা তাদের তথ্য সংশোধন, আপডেট বা মুছে ফেলার অনুরোধ করতে
                পারবেন আমাদের হটলাইন বা ইমেইল ঠিকানায়।
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Navigation */}
      <footer className="max-w-4xl mx-auto px-4 text-center py-10">
        <Link
          href="/"
          className="text-gray-400 hover:text-(--color-primary-500) font-bold text-sm uppercase tracking-widest transition-colors"
        >
          Return to Platform
        </Link>
      </footer>
    </div>
  );
}
