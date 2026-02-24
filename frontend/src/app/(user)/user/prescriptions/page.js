'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { usePrescriptions } from '../../hooks/usePrescriptions';
import { uploadPrescriptionApi } from '../../api/prescriptionApi';
import PrescriptionCard from './components/PrescriptionCard';
import UploadCard from './components/UploadCard';
import UiButton from '@/app/(public)/components/UiButton';

export default function MyPrescriptionsPage() {
  const { prescriptions, isLoading, error, refresh } = usePrescriptions();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const handleDirectUpload = async file => {
    if (!file) return;

    setIsUploading(true);
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', `Prescription_${new Date().getTime()}`);

      // Use the real API function
      await uploadPrescriptionApi(token, formData);

      // Refresh the list immediately without a page reload
      // Passing false to refresh to avoid the full-page spinner if desired
      await refresh(false);

      // Optional: Clear selection if a new one is uploaded
      setSelectedId(null);
    } catch (err) {
      console.error('Upload error:', err);
      alert(err.message || 'Failed to upload prescription. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Toggle selection logic: Unselect if clicking the same ID
  const handleToggleSelect = id => {
    setSelectedId(prevId => (prevId === id ? null : id));
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Mobile Sub-Page Header */}
      <div className="flex items-center gap-4 lg:hidden mb-2">
        <Link href="/user" className="p-2 -ml-2 text-gray-600">
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">My Prescriptions</h1>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[32px] p-6 md:p-10 border border-gray-100/50 min-h-[600px] flex flex-col">
        <div className="mb-10 hidden lg:block">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            My Prescriptions
          </h1>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-grow">
          {/* 1. List of existing Prescriptions */}
          {prescriptions.map(item => (
            <PrescriptionCard
              key={item.id}
              item={item}
              isSelected={selectedId === item.id}
              onSelect={() => handleToggleSelect(item.id)}
            />
          ))}

          {/* 2. Loading Placeholder (Only for initial load) */}
          {isLoading && prescriptions.length === 0 && (
            <div className="col-span-1 flex items-center justify-center aspect-[4/3] bg-gray-50 rounded-2xl border-[5px] border-white">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* 3. Upload Card always at the end */}
          <UploadCard onUpload={handleDirectUpload} isLoading={isUploading} />
        </div>

        {/* 4. Bottom Action Section */}
        <div className="mt-12 pt-8 border-t border-gray-50 flex justify-start">
          <div className="w-full max-w-[240px]">
            <UiButton
              disabled={!selectedId}
              onClick={() => console.log('Placing order with Rx:', selectedId)}
            >
              <div className="flex items-center justify-center gap-3">
                <span>PLACE ORDER</span>
                <FiArrowRight size={18} strokeWidth={3} />
              </div>
            </UiButton>
          </div>
        </div>

        {error && !isLoading && prescriptions.length === 0 && (
          <div className="mt-10 p-4 bg-red-50 border border-red-100 rounded-2xl text-center">
            <p className="text-sm font-bold text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
