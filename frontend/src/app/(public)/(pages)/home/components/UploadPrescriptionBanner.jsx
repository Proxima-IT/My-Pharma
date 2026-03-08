'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { LuCloudUpload } from 'react-icons/lu';
import { FiCheck } from 'react-icons/fi';

const UploadPrescriptionBanner = () => {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle, success

  const handleActionClick = e => {
    // ইভেন্ট প্রিভেন্ট করা হচ্ছে যাতে কোনো ফর্ম সাবমিশন না হয়
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;

    // কোনো ডাটাবেস বা লোকাল স্টোরেজে সেভ হবে না
    setStatus('success');

    setTimeout(() => {
      setStatus('idle');
    }, 3000);

    // ইনপুট রিসেট করা হচ্ছে যাতে একই ফাইল আবার সিলেক্ট করা যায়
    e.target.value = '';
  };

  return (
    <div className="px-4">
      <div
        className="w-full h-auto bg-center bg-no-repeat bg-cover rounded-[32px] border border-gray-100 grid grid-cols-1 lg:grid-cols-2 items-center gap-6 py-12 overflow-hidden"
        style={{
          backgroundImage: "url('/assets/images/uploadbanner.png')",
        }}
      >
        <div className="flex justify-center lg:justify-start items-start lg:pl-12">
          <Image
            src="/assets/images/appicon.png"
            alt="app icon"
            width={200}
            height={200}
            className="w-1/3 lg:w-1/2 object-contain"
          />
        </div>

        {/* Content */}
        <div className="text-white space-y-1 flex flex-col items-center lg:items-start text-center lg:text-left px-6">
          <span className="font-black text-[12px] text-[#10B981] uppercase tracking-[0.2em]">
            Quick Prescription Upload
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight mt-2">
            We’ll take care of the rest
          </h1>
          <p className="mt-4 text-white/70 max-w-md text-sm sm:text-base font-medium leading-relaxed">
            Upload your prescription here. Our team will review it and help you
            find the right medicines quickly.
          </p>

          <div className="relative mt-8">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />

            {/* Upload Button */}
            <button
              type="button"
              onClick={handleActionClick}
              className={`flex items-center gap-3 cursor-pointer rounded-full px-10 py-4 text-sm sm:text-base font-bold transition-all active:scale-95 shadow-none min-w-[200px] justify-center ${
                status === 'success'
                  ? 'bg-[#10B981] text-white'
                  : 'bg-white text-black hover:bg-gray-50'
              }`}
            >
              {status === 'success' ? (
                <>
                  <FiCheck size={20} />
                  <span>File Selected</span>
                </>
              ) : (
                <>
                  <LuCloudUpload size={22} className="text-[#233b8c]" />
                  <span>Upload Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPrescriptionBanner;
