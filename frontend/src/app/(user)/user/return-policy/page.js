'use client';
import React from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

export default function ReturnPolicyPage() {
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center gap-4 lg:hidden mb-2">
        <Link
          href="/user"
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Returns</h1>
      </div>

      <div className="bg-white rounded-[40px] p-8 md:p-12 border border-gray-200 shadow-sm space-y-10">
        <div className="flex items-center gap-4 text-primary-500">
          <FiRefreshCw size={32} />
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Return & Refund
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3">7-Day Return</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Items can be returned within 7 days of delivery if they are
              damaged, expired, or incorrect.
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3">Quick Refund</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Once approved, refunds are processed within 3-5 business days to
              your original payment method.
            </p>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">
            Non-Returnable Items
          </h2>
          <ul className="list-disc list-inside text-sm text-gray-500 space-y-2 leading-relaxed">
            <li>Opened or used healthcare products.</li>
            <li>Temperature-sensitive medicines (e.g., Insulin).</li>
            <li>Items without original packaging or invoice.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
