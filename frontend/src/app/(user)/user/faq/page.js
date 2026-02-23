'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiChevronDown } from 'react-icons/fi';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: '1. How do I order medicines from My Pharma?',
      a: 'You can search for medicines directly or upload a valid prescription. After pharmacist verification, your order will be processed and delivered to your address.',
    },
    {
      q: '2. Do I need a prescription for all medicines?',
      a: 'V',
    },
    {
      q: '3. How do I upload my prescription?',
      a: 'Information coming soon.',
    },
    {
      q: '4. What if my prescription is unclear?',
      a: '>',
    },
    {
      q: '5. How long does delivery take?',
      a: 'Information coming soon.',
    },
    {
      q: '6. Do you deliver outside major cities?',
      a: 'Information coming soon.',
    },
    {
      q: '7. Can I track my order?',
      a: 'V',
    },
    {
      q: '8. What payment methods are available?',
      a: 'V',
    },
    {
      q: '9. Are your medicines authentic?',
      a: 'V',
    },
    {
      q: '10. How do I book a lab test?',
      a: 'V',
    },
    {
      q: '11. How will I receive my lab report?',
      a: '>',
    },
    {
      q: '12. Can I return medicines?',
      a: 'V',
    },
    {
      q: '13. How do refunds work?',
      a: 'Information coming soon.',
    },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Mobile Back Button */}
      <div className="flex items-center gap-4 lg:hidden mb-2">
        <Link href="/user" className="p-2 -ml-2 text-gray-600">
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">FAQ</h1>
      </div>

      {/* Main Unified Container */}
      <div className="bg-white rounded-[32px] p-8 md:p-12 border border-gray-100/50 min-h-[600px] flex flex-col">
        <div className="mb-10">
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">
            FAQ
          </h1>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-[24px] border border-gray-100 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors group"
              >
                <span className="font-bold text-gray-900 pr-4 text-[15px]">
                  {faq.q}
                </span>
                {/* Icon Container: Fully rounded with border */}
                <div
                  className={`w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center shrink-0 transition-all duration-300 ${openIndex === index ? 'bg-primary-500 border-primary-500 text-white' : 'text-gray-400'}`}
                >
                  <FiChevronDown
                    className={`transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                    size={20}
                  />
                </div>
              </button>
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  openIndex === index
                    ? 'max-h-[500px] opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-6 pt-0 text-[15px] text-gray-500 leading-relaxed border-t border-gray-50 mt-2">
                  {faq.a || 'Information coming soon.'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
