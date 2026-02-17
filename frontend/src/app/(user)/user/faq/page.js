'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiChevronDown, FiHelpCircle } from 'react-icons/fi';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How do I upload a prescription?',
      a: "Go to the 'My Prescriptions' tab and click 'Upload New'. You can upload a clear photo or PDF of your prescription. Our pharmacists will verify it within 15-30 minutes.",
    },
    {
      q: 'What is the estimated delivery time?',
      a: 'For major cities like Dhaka, we offer same-day delivery if ordered before 12 PM. Otherwise, it usually takes 24-48 hours depending on your location.',
    },
    {
      q: 'Are the medicines genuine?',
      a: 'Absolutely. My Pharma only sources medicines directly from top-tier pharmaceutical manufacturers and authorized distributors to ensure 100% authenticity.',
    },
    {
      q: 'How can I pay for my order?',
      a: 'We accept Cash on Delivery (COD), bKash, Nagad, and all major Credit/Debit cards through our secure payment gateway.',
    },
  ];

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center gap-4 lg:hidden mb-2">
        <Link
          href="/user"
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">FAQ</h1>
      </div>

      <div className="hidden lg:block">
        <h1 className="text-3xl font-bold text-(--gray-900) tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-base text-(--gray-500) mt-2 font-normal">
          Find quick answers to common queries about our services.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white rounded-[24px] border border-gray-200 overflow-hidden transition-all"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-bold text-gray-900 pr-4">{faq.q}</span>
              <FiChevronDown
                className={`text-primary-500 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                size={20}
              />
            </button>
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="p-6 pt-0 text-sm text-gray-500 leading-relaxed border-t border-gray-50 mt-2">
                {faq.a}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
