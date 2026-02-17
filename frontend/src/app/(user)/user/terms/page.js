'use client';
import React from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiShield } from 'react-icons/fi';

export default function TermsPage() {
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center gap-4 lg:hidden mb-2">
        <Link
          href="/user"
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Terms</h1>
      </div>

      <div className="bg-white rounded-[40px] p-8 md:p-12 border border-gray-200 shadow-sm space-y-10">
        <div className="flex items-center gap-4 text-primary-500">
          <FiShield size={32} />
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Terms & Conditions
          </h1>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">
            1. Acceptance of Terms
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            By accessing My Pharma, you agree to be bound by these terms. Our
            platform provides a marketplace for pharmaceutical products and
            healthcare services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">
            2. Medical Disclaimer
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            The content provided is for informational purposes only. Always seek
            the advice of your physician or other qualified health provider with
            any questions you may have regarding a medical condition.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">
            3. Prescription Policy
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Orders for prescription-only medicines will only be processed upon
            the submission and verification of a valid prescription from a
            registered medical practitioner.
          </p>
        </section>
      </div>
    </div>
  );
}
