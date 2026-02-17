'use client';
import React, { useState } from 'react';
import {
  FiChevronDown,
  FiInfo,
  FiShield,
  FiSearch,
  FiFileText,
} from 'react-icons/fi';

export default function WhyUploadAccordion() {
  const [isOpen, setIsOpen] = useState(false);

  const reasons = [
    {
      icon: <FiFileText className="text-primary-500" />,
      text: 'Never lose a prescription again; access your digital records securely in the My Pharma app for life.',
    },
    {
      icon: <FiSearch className="text-primary-500" />,
      text: "Can't read the doctor's handwriting? Our 'A' Grade pharmacists will verify it and help you order the right medicine.",
    },
    {
      icon: <FiShield className="text-primary-500" />,
      text: 'Your privacy is our priority. Your prescriptions are strictly confidential and never shared with third parties.',
    },
    {
      icon: <FiInfo className="text-primary-500" />,
      text: 'As per Bangladesh Government regulations, a valid prescription is mandatory for ordering certain medicines.',
    },
  ];

  return (
    <div className="w-full bg-primary-50/50 border border-primary-100 rounded-[24px] overflow-hidden transition-all duration-500">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-primary-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary-500 shadow-sm">
            <FiInfo size={18} />
          </div>
          <span className="font-bold text-gray-900 text-sm">
            Why should you upload a prescription?
          </span>
        </div>
        <FiChevronDown
          className={`text-primary-500 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}
          size={20}
        />
      </button>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="flex gap-3 p-3 bg-white/60 rounded-xl border border-white"
            >
              <div className="mt-1 shrink-0">{reason.icon}</div>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                {reason.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
