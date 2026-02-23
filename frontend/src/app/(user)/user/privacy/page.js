'use client';
import React from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiLock } from 'react-icons/fi';

export default function PrivacyPage() {
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center gap-4 lg:hidden mb-2">
        <Link
          href="/user"
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Privacy</h1>
      </div>

      <div className="bg-white rounded-[40px] p-8 md:p-12 border border-gray-200 shadow-sm space-y-10">
        <div className="flex items-center gap-4 text-primary-500">
          <FiLock size={32} />
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Privacy Policy
          </h1>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Data Collection</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            We collect information to provide better services to our users—from
            figuring out basic stuff like which language you speak, to more
            complex things like which medicines you order frequently.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">How We Use Data</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Your data is used to process orders, verify prescriptions, and
            provide personalized health tips. We never sell your personal health
            information to third parties.
          </p>
        </section>
      </div>
    </div>
  );
}
