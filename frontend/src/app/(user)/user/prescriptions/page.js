'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { usePrescriptions } from '../../hooks/usePrescriptions';
import { uploadPrescriptionApi } from '../../api/prescriptionApi';
import PrescriptionCard from './components/PrescriptionCard';
import UploadCard from './components/UploadCard';
import UiButton from '@/app/(public)/components/UiButton';

/**
 * MyPrescriptionsPage Component
 * Features: Prescription library management and redirection to order flow with pre-selected ID.
 */
export default function MyPrescriptionsPage() {
  const router = useRouter();
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

      await uploadPrescriptionApi(token, formData);
      await refresh(false);
      setSelectedId(null);
    } catch (err) {
      console.error('Upload error:', err);
      alert(err.message || 'Failed to upload prescription. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleSelect = id => {
    setSelectedId(prevId => (prevId === id ? null : id));
  };

  /**
   * Redirects to the Prescription Ordering page passing the selected ID
   * so the user doesn't have to re-upload the same file.
   */
  const handlePlaceOrder = () => {
    if (selectedId) {
      router.push(`/upload-prescription?prescriptionId=${selectedId}`);
    }
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
      <div className="bg-white rounded-[32px] p-6 md:p-10 border border-gray-100/50 min-h-[600px] flex flex-col shadow-none">
        <div className="mb-10 hidden lg:block">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            My Prescriptions
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Select an existing prescription to place a new order.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-grow">
          {prescriptions.map(item => (
            <PrescriptionCard
              key={item.id}
              item={item}
              isSelected={selectedId === item.id}
              onSelect={() => handleToggleSelect(item.id)}
            />
          ))}

          {isLoading && prescriptions.length === 0 && (
            <div className="col-span-1 flex items-center justify-center aspect-[4/3] bg-gray-50 rounded-2xl border-[5px] border-white">
              <div className="w-6 h-6 border-2 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <UploadCard onUpload={handleDirectUpload} isLoading={isUploading} />
        </div>

        {/* Bottom Action Section */}
        <div className="mt-12 pt-8 border-t border-gray-50 flex justify-start">
          <div className="w-full max-w-[240px]">
            <UiButton disabled={!selectedId} onClick={handlePlaceOrder}>
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
