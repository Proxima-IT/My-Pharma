'use client';

import React from 'react';
import Link from 'next/link';
import {
  FiFileText,
  FiShield,
  FiAlertCircle,
  FiCheckCircle,
  FiMail,
  FiPhone,
} from 'react-icons/fi';

/**
 * Terms and Conditions Page Component
 * Architecture: High-fidelity static content with legal-grade indexing.
 * Design: Public Storefront (Shadow-free, rounded-[32px], premium blue theme).
 */
export default function TermsAndConditionsPage() {
  const lastUpdated = 'May 2026';

  return (
    <div className="w-full space-y-12 pb-20 animate-in fade-in duration-700 bg-white min-h-screen">
      {/* Header Banner */}
      <section className="bg-(--color-primary-25) py-16 px-4 text-center border-b border-gray-100">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto text-(--color-primary-500) shadow-sm border border-primary-50">
            <FiFileText size={32} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase leading-none">
            Terms & Conditions
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10 text-gray-700 leading-relaxed">
        <section className="bg-white border border-gray-100 rounded-[32px] p-8 sm:p-12 space-y-8 shadow-none">
          <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl">
            <p className="text-[15px] font-medium text-gray-600 italic">
              Welcome to My Pharma Limited (“My Pharma”, “we”, “our”, or “us”).
              These Terms and Conditions govern your access to and use of our
              website, mobile application, digital platforms, services, and
              related technologies, including but not limited to{' '}
              <strong className="text-gray-900">mypharma.com.bd</strong>{' '}
              (collectively referred to as the “Platform”).
            </p>
          </div>

          <div className="space-y-12">
            {/* 1. Company Info */}
            <article className="space-y-4">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <span className="text-(--color-primary-500)">1.</span> Company
                Information
              </h2>
              <div className="pl-8 space-y-4">
                <p>
                  1.1. My Pharma Limited is a company incorporated and operating
                  under the applicable laws of Bangladesh with RJSC Registration
                  No. C-208341/2026.
                </p>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-2 text-sm">
                  <p>
                    <strong>Website:</strong> mypharma.com.bd
                  </p>
                  <p>
                    <strong>Support:</strong> 01335236650
                  </p>
                  <p>
                    <strong>Email:</strong> support@mypharma.com.bd
                  </p>
                  <p>
                    <strong>Address:</strong> Pyramid Prottasha, 75 East Raza
                    Bazar, Panthapath, Dhaka-1215
                  </p>
                </div>
              </div>
            </article>

            {/* 2. Eligibility */}
            <article className="space-y-4">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <span className="text-(--color-primary-500)">2.</span>{' '}
                Eligibility and Acceptance
              </h2>
              <div className="pl-8 space-y-3">
                <p>
                  2.1. By using the Platform, you confirm that you are legally
                  capable of entering into a binding agreement and that all
                  information provided is accurate.
                </p>
                <p>
                  2.2. We reserve the right to refuse service or terminate
                  access where policy violations are detected.
                </p>
              </div>
            </article>

            {/* 5. Prescription Policy */}
            <article className="space-y-4 p-8 bg-amber-50 rounded-[32px] border border-amber-100">
              <h2 className="text-2xl font-black text-amber-900 flex items-center gap-3">
                <FiAlertCircle className="text-amber-500" /> 5. Prescription
                Policy
              </h2>
              <div className="pl-8 space-y-3 text-amber-800">
                <p>
                  5.1. Prescription-only medicines will only be dispensed upon
                  submission of a valid prescription issued by a licensed
                  medical practitioner in Bangladesh.
                </p>
                <p>
                  5.2. My Pharma reserves the right to verify, clarify, or
                  reject suspicious or invalid prescriptions at its sole
                  discretion.
                </p>
              </div>
            </article>

            {/* 6 & 7 Pricing / Delivery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <article className="space-y-3">
                <h3 className="text-xl font-black text-gray-900">
                  6. Pricing & Payments
                </h3>
                <p className="text-sm">
                  Prices are subject to change due to batch updates or
                  regulatory adjustments. We accept COD, MFS, and Online
                  Gateways.
                </p>
              </article>
              <article className="space-y-3">
                <h3 className="text-xl font-black text-gray-900">
                  7. Delivery
                </h3>
                <p className="text-sm">
                  Delivery timelines are estimates. Charges vary by location.
                  Users must provide accurate address details to ensure
                  fulfillment.
                </p>
              </article>
            </div>

            {/* 8. Returns */}
            <article className="space-y-4">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <span className="text-(--color-primary-500)">8.</span> Returns &
                Refunds
              </h2>
              <div className="pl-8">
                <ul className="list-disc list-inside space-y-2 marker:text-(--color-primary-500)">
                  <li>
                    Refunds apply for incorrect, damaged, or expired items.
                  </li>
                  <li>
                    Medicines are generally not returnable once delivered unless
                    quality issues are identified.
                  </li>
                  <li>Claims must be verified before approval.</li>
                </ul>
              </div>
            </article>

            {/* 12. Intellectual Property */}
            <article className="space-y-4">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <span className="text-(--color-primary-500)">12.</span>{' '}
                Intellectual Property
              </h2>
              <p className="pl-8">
                All Platform content (logos, code, designs) is owned by or
                licensed to My Pharma Limited. Reproduction without permission
                is strictly prohibited.
              </p>
            </article>

            {/* 15 & 16 Legal */}
            <div className="space-y-6">
              <article className="space-y-3">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <span className="text-(--color-primary-500)">15.</span>{' '}
                  Limitation of Liability
                </h2>
                <p className="pl-8 text-sm">
                  My Pharma is not liable for indirect damages, service
                  interruptions, or user negligence. Maximum liability is capped
                  at the amount paid for the service.
                </p>
              </article>

              <article className="space-y-3">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <span className="text-(--color-primary-500)">16.</span>{' '}
                  Disclaimer
                </h2>
                <p className="pl-8 text-sm italic">
                  Platform content is for general informational purposes and is
                  NOT a substitute for professional medical advice.
                </p>
              </article>
            </div>

            {/* 20. Governing Law */}
            <article className="space-y-4 bg-gray-900 p-8 rounded-[32px] text-white">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <FiShield className="text-(--color-primary-500)" /> 20.
                Governing Law
              </h2>
              <p className="pl-8 opacity-80">
                These Terms and Conditions are governed by the laws of
                Bangladesh. Any disputes fall under the jurisdiction of the
                competent courts of Bangladesh.
              </p>
            </article>

            {/* 23. Final Acceptance */}
            <article className="text-center pt-10">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-(--success-50) text-(--success-700) rounded-full border border-(--success-100) font-bold text-sm uppercase tracking-widest mb-6">
                <FiCheckCircle /> 23. Acceptance of Agreement
              </div>
              <p className="text-gray-500 text-sm max-w-2xl mx-auto">
                By using the Platform, you acknowledge that you have read,
                understood, and accepted these Terms and Conditions in their
                entirety.
              </p>
            </article>
          </div>
        </section>
      </div>

      {/* Footer Contact */}
      <footer className="max-w-4xl mx-auto px-4 py-12 border-t border-gray-100 text-center space-y-6">
        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">
          Need clarification?
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="mailto:support@mypharma.com.bd"
            className="flex items-center gap-2 px-8 py-3 bg-white border border-gray-200 rounded-full font-bold text-sm text-(--color-primary-500) hover:bg-gray-50 transition-all"
          >
            <FiMail /> support@mypharma.com.bd
          </a>
          <a
            href="tel:01335236650"
            className="flex items-center gap-2 px-8 py-3 bg-white border border-gray-200 rounded-full font-bold text-sm text-(--color-primary-500) hover:bg-gray-50 transition-all"
          >
            <FiPhone /> 01335236650
          </a>
        </div>
        <div className="pt-8">
          <Link
            href="/"
            className="text-gray-400 hover:text-(--color-primary-500) font-bold text-xs uppercase tracking-[0.3em] transition-all"
          >
            Return to Dashboard
          </Link>
        </div>
      </footer>
    </div>
  );
}
