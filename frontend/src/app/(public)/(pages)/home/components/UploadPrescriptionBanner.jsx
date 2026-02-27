'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LuCloudUpload } from 'react-icons/lu';
import { FiLoader, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { usePrescriptions } from '@/app/(user)/hooks/usePrescriptions';

const UploadPrescriptionBanner = () => {
  const router = useRouter();
  const { uploadPrescription, isUpdating } = usePrescriptions();
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle, success, error

  const handleActionClick = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    fileInputRef.current.click();
  };

  const handleFileChange = async e => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const success = await uploadPrescription(formData);
      if (success) {
        setStatus('success');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
    // Reset input so the same file can be uploaded again if needed
    e.target.value = '';
  };

  return (
    <div className="py-[70px] px-4">
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
            Upload Your Prescription
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight mt-2">
            We’ll take care of the rest
          </h1>
          <p className="mt-4 text-white/70 max-w-md text-sm sm:text-base font-medium leading-relaxed">
            No need to search or worry. We ensure accuracy, privacy, and genuine
            medicines delivered right to your door.
          </p>

          <div className="relative mt-8">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={handleFileChange}
            />

            <button
              onClick={handleActionClick}
              disabled={isUpdating}
              className={`flex items-center gap-3 cursor-pointer rounded-full px-10 py-4 text-sm sm:text-base font-bold transition-all active:scale-95 shadow-none min-w-[180px] justify-center ${
                status === 'success'
                  ? 'bg-(--color-success-500) text-white'
                  : status === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-black hover:bg-blue-50'
              }`}
            >
              {isUpdating ? (
                <>
                  <FiLoader className="animate-spin" size={20} />
                  <span>Uploading...</span>
                </>
              ) : status === 'success' ? (
                <>
                  <FiCheck size={20} />
                  <span>Saved to Account</span>
                </>
              ) : status === 'error' ? (
                <>
                  <FiAlertCircle size={20} />
                  <span>Upload Failed</span>
                </>
              ) : (
                <>
                  <LuCloudUpload
                    size={20}
                    className="text-(--color-primary-500)"
                  />
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
