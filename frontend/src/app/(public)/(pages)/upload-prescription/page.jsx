'use client';

import React, { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  FiArrowLeft,
  FiPlus,
  FiEdit3,
  FiChevronRight,
  FiX,
  FiHome,
  FiAlertCircle,
} from 'react-icons/fi';
import { useAddress } from '@/app/(user)/hooks/useAddress';
import { useOrders } from '@/app/(user)/hooks/useOrders';

/**
 * UploadPrescription Component
 * 100% Pixel-Perfect Match to the provided design.
 * Fixed: Reverted image key to 'images' to match the official Order API documentation.
 * Note: All UI elements, including the Green Message and layout, are strictly preserved.
 */
export default function UploadPrescriptionPage() {
  const router = useRouter();
  const { addresses } = useAddress();
  const {
    durations,
    placePrescriptionOrder,
    isPlacingOrder,
    error: orderError,
  } = useOrders();

  // Form States
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [savePrescription, setSavePrescription] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [note, setNote] = useState('');
  const fileInputRef = useRef(null);

  // Get default address
  const defaultAddress = useMemo(() => {
    return addresses.find(a => a.is_default) || addresses[0];
  }, [addresses]);

  const handleFileChange = e => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert('Max 5 images allowed');
      return;
    }
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = index => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleOrder = async () => {
    if (images.length === 0)
      return alert('Please upload at least one prescription image.');
    if (!selectedDuration) return alert('Please select a supply duration.');
    if (!defaultAddress) return alert('Please add a shipping address.');

    const formData = new FormData();
    // CORRECTED: Key name reverted to 'images' as per Order API documentation proof
    images.forEach(file => formData.append('images', file));
    formData.append('duration', selectedDuration);
    formData.append('message', note);
    formData.append('shipping_address', defaultAddress.id);

    try {
      const result = await placePrescriptionOrder(formData);
      router.push(`/user/orders/${result.id}`);
    } catch (err) {
      console.error('Order failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 animate-in fade-in duration-700 w-full">
      {/* Header - Full Width */}
      <div className="w-full px-4 sm:px-6 lg:px-10 pt-8 flex items-center gap-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-full text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all cursor-pointer shadow-none"
        >
          <FiArrowLeft size={18} />{' '}
          <span className="hidden sm:inline">Back</span>
        </button>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
          Upload Prescription
        </h1>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-10 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload Area */}
        <div className="lg:col-span-7 w-full">
          <div className="bg-white rounded-[32px] p-6 sm:p-10 border border-gray-100 shadow-none w-full h-fit">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-8">
              Upload Prescription
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {previews.map((src, idx) => (
                <div
                  key={idx}
                  className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-100 group"
                >
                  <Image
                    src={src}
                    alt="Rx Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="aspect-[4/3] border-2 border-dashed border-[#10B981]/30 bg-[#F0FDF4]/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#F0FDF4] transition-all group"
                >
                  <div className="w-14 h-14 rounded-full bg-[#10B981] flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                    <FiPlus size={28} strokeWidth={3} />
                  </div>
                  <p className="text-[16px] font-bold text-[#10B981]">
                    Click to upload
                  </p>
                  <p className="text-[14px] text-gray-400">or drag and drop</p>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />

            <div className="mt-10 flex items-center gap-4">
              <input
                type="checkbox"
                id="saveRx"
                checked={savePrescription}
                onChange={e => setSavePrescription(e.target.checked)}
                className="w-6 h-6 rounded border-gray-300 text-[#1D3583] focus:ring-[#1D3583] cursor-pointer"
              />
              <label
                htmlFor="saveRx"
                className="text-[16px] font-medium text-gray-600 cursor-pointer"
              >
                Save Prescription
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Address & Details */}
        <div className="lg:col-span-5 w-full space-y-8">
          {/* Shipping Address Card */}
          <div className="bg-white rounded-[32px] p-6 sm:p-10 border border-gray-100 shadow-none w-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Shipping Address
              </h2>
              <Link
                href="/user/address"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#F5F8FF] rounded-full text-[14px] font-bold text-[#1D3583] hover:bg-[#EEF2FF] transition-all"
              >
                <FiEdit3 /> Change
              </Link>
            </div>

            {defaultAddress ? (
              <div className="space-y-8">
                <div className="flex items-center gap-5 p-5 bg-gray-50/50 rounded-[24px] border border-gray-50">
                  <div className="w-14 h-14 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#1D3583] shrink-0">
                    <FiHome size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-gray-900 truncate">
                        {defaultAddress.full_name}
                      </h3>
                      <span className="px-3 py-1 border border-[#10B981] text-[#10B981] text-[10px] font-black rounded-full uppercase shrink-0">
                        Default
                      </span>
                    </div>
                    <p className="text-[14px] text-gray-500 truncate">
                      {defaultAddress.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'PHONE NUMBER', value: defaultAddress.phone },
                    {
                      label: 'GENDER',
                      value:
                        defaultAddress.gender_display || defaultAddress.gender,
                    },
                    { label: 'DEISTIC', value: defaultAddress.district },
                    { label: 'THANA', value: defaultAddress.thana },
                    { label: 'FULL ADDRESS', value: defaultAddress.address },
                  ].map((item, i) => (
                    <div key={i} className="flex text-[14px] sm:text-[15px]">
                      <span className="w-36 text-gray-400 font-bold uppercase tracking-widest shrink-0">
                        {item.label}
                      </span>
                      <span className="text-gray-400 mr-4">-</span>
                      <span className="flex-1 text-gray-900 font-bold text-right break-words">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-gray-400 text-base">
                  No address found. Please add one to continue.
                </p>
              </div>
            )}
          </div>

          {/* Duration & Note Card */}
          <div className="bg-white rounded-[32px] p-6 sm:p-10 border border-gray-100 shadow-none w-full">
            <h2 className="text-[13px] font-black text-gray-400 uppercase tracking-[0.2em] mb-5">
              Medicine Supply Duration
            </h2>
            <div className="flex flex-wrap gap-3">
              {durations.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDuration(d.id)}
                  className={`px-7 py-3.5 rounded-full border-2 text-[15px] font-bold transition-all cursor-pointer shadow-none ${
                    selectedDuration === d.id
                      ? 'bg-[#EEF2FF] border-[#1D3583] text-[#1D3583]'
                      : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>

            <div className="mt-10 space-y-4">
              <h2 className="text-[13px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Prescription Note
              </h2>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Enter note for your uploading prescription..."
                className="w-full min-h-[140px] p-6 bg-gray-50 border border-gray-100 rounded-[28px] text-[16px] focus:outline-none focus:bg-white focus:border-(--color-primary-500)/30 transition-all resize-none shadow-none"
              />
            </div>

            {/* RESTORED: Green Representative Message */}
            <div className="mt-10 p-6 bg-[#F0FDF4] border-2 border-dashed border-[#10B981]/30 rounded-[24px]">
              <p className="text-[15px] text-[#10B981] font-medium leading-relaxed">
                One My Pharma representative will call you shortly for
                confirming this order. You may receive cashback based on the
                final order value.
              </p>
            </div>

            {/* Error Feedback */}
            {orderError && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2">
                <FiAlertCircle className="shrink-0" />
                <p className="text-xs font-bold uppercase tracking-tight">
                  {orderError}
                </p>
              </div>
            )}

            <button
              onClick={handleOrder}
              disabled={isPlacingOrder || images.length === 0}
              className="w-full mt-10 h-[80px] bg-[#1D3583] hover:bg-[#162a6b] text-white rounded-full text-xl font-bold flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 shadow-none active:scale-[0.98]"
            >
              {isPlacingOrder ? 'Processing...' : 'Order Prescription'}
              <FiChevronRight size={24} strokeWidth={3} />
            </button>

            <div className="mt-8 text-center px-4">
              <p className="text-[13px] text-gray-400 leading-relaxed">
                By continuing you agree to our{' '}
                <Link href="/terms" className="underline hover:text-gray-600">
                  Terms of services
                </Link>
                ,{' '}
                <Link href="/privacy" className="underline hover:text-gray-600">
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link
                  href="/return-policy"
                  className="underline hover:text-gray-600"
                >
                  Return and Refund Policy.
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
