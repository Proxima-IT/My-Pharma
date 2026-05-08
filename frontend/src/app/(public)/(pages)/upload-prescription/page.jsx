'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiArrowLeft, FiLoader } from 'react-icons/fi';
import { useAddress } from '@/app/(user)/hooks/useAddress';
import { useOrders } from '@/app/(user)/hooks/useOrders';
import { API_BASE_URL, getMediaUrl } from '@/app/(shared)/lib/apiConfig';

import Upload from './components/Upload';
import PrescriptionOrderForm from './components/PrescriptionOrderForm';
import AddressSelectorPopup from '@/app/(public)/components/AddressSelectorPopup';

/**
 * UploadPrescription Component
 * 100% Pixel-Perfect Match to the provided design.
 * Strategy: "Fetch-then-Clone". Converts library URLs to Files to satisfy backend requirement.
 * Fixed: Key names synchronized with Official Schema (shipping_address, images, prescription_note).
 */
function UploadPrescriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prescriptionId = searchParams.get('prescriptionId');

  const { addresses } = useAddress();
  const {
    placePrescriptionOrder,
    isPlacingOrder,
    error: orderError,
  } = useOrders();

  // Hardcoded Medicine Supply Durations (Backend expects these specific keys)
  const medicineDurations = [
    { id: '7_DAYS', name: '7 Days' },
    { id: '15_DAYS', name: '15 Days' },
    { id: '1_MONTH', name: '1 Month' },
    { id: '2_MONTHS', name: '2 Months' },
  ];

  // Shared States
  const [images, setImages] = useState([]); // User uploaded files
  const [libraryFiles, setLibraryFiles] = useState([]); // Converted library files
  const [previews, setPreviews] = useState([]); // Previews for user uploads
  const [libraryPreviews, setLibraryPreviews] = useState([]); // Previews for library assets
  const [selectedDurationId, setSelectedDurationId] = useState(null);
  const [note, setNote] = useState('');
  const [isFetchingRx, setIsFetchingRx] = useState(false);

  // Address Selection States
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddressPopupOpen, setIsAddressPopupOpen] = useState(false);

  // Initialize address from default
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const def = addresses.find(a => a.is_default) || addresses[0];
      setSelectedAddress(def);
    }
  }, [addresses, selectedAddress]);

  // Phase 1: Fetch and Convert Library Prescription to Files
  useEffect(() => {
    if (prescriptionId) {
      const fetchAndConvertRx = async () => {
        setIsFetchingRx(true);
        try {
          const token = localStorage.getItem('access_token');
          const res = await fetch(
            `${API_BASE_URL}/prescriptions/${prescriptionId}/`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (!res.ok) throw new Error('Failed to fetch prescription');
          const data = await res.json();

          // 1. Handle Previews
          let previewUrls = [];
          let downloadUrls = [];
          if (data.images?.length > 0) {
            previewUrls = data.images.map(img => getMediaUrl(img.image_url || img.image));
            downloadUrls = data.images.map(img => img.image_url || img.image || getMediaUrl(img.image));
          } else if (data.image || data.file) {
            const src = data.image || data.file;
            previewUrls = [getMediaUrl(src)];
            downloadUrls = [src];
          }
          setLibraryPreviews(previewUrls);

          // 2. "Blob Fetch" - Convert URLs to File objects for re-upload
          const filePromises = downloadUrls.map(async (url, index) => {
            // Ensure absolute URL to bypass potentially broken proxy
            const fetchUrl = url.startsWith('http') ? url : `${API_BASE_URL.replace('/api', '')}${url}`;
            
            try {
              const response = await fetch(fetchUrl);
              if (!response.ok) throw new Error(`HTTP ${response.status}`);
              const blob = await response.blob();
              
              // Prevent capturing 404 HTML pages
              const contentType = blob.type || response.headers.get('content-type') || '';
              if (contentType.includes('text/html')) {
                throw new Error('Received HTML instead of image');
              }
              
              // Map mime type to file extension
              const extMap = {
                'image/jpeg': '.jpg',
                'image/png': '.png',
                'image/webp': '.webp',
                'image/gif': '.gif',
              };
              const ext = extMap[contentType] || '.jpg';
              const mimeType = contentType.startsWith('image/') ? contentType : 'image/jpeg';
  
              return new File([blob], `library_rx_${index}${ext}`, { type: mimeType });
            } catch (err) {
              console.warn(`Failed to fetch library image ${index}:`, err);
              // Fallback: if fetch fails, skip this file so order doesn't completely break
              return null;
            }
          });
          const files = (await Promise.all(filePromises)).filter(Boolean);
          setLibraryFiles(files);

          if (data.prescription_note) setNote(data.prescription_note);
        } catch (err) {
          console.error('Rx Conversion Error:', err);
        } finally {
          setIsFetchingRx(false);
        }
      };
      fetchAndConvertRx();
    }
  }, [prescriptionId]);

  // Phase 2: Handle Final Order Submission
  const handleOrderSubmission = async () => {
    const allFiles = [...libraryFiles, ...images];

    if (allFiles.length === 0)
      return alert('Please upload or select a prescription.');
    if (!selectedDurationId) return alert('Please select a supply duration.');
    if (!selectedAddress) return alert('Please select a shipping address.');

    const formData = new FormData();

    // Append all files (Library + New Uploads) to the 'images' key
    allFiles.forEach(file => formData.append('images', file));

    // Keys synchronized with Official Schema
    formData.append('medicine_supply_duration', selectedDurationId);
    formData.append('prescription_note', note);
    formData.append('shipping_address', selectedAddress.id);

    try {
      const result = await placePrescriptionOrder(formData);
      router.push(`/user/orders/prescription/${result.id}`);
    } catch (err) {
      console.error('Order Submission Failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 animate-in fade-in duration-700 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-10 pt-8 flex items-center gap-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-full text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all cursor-pointer shadow-none"
        >
          <FiArrowLeft size={18} /> <span>Back</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Upload Prescription
        </h1>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-10 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <Upload
            prescriptionId={prescriptionId}
            isFetching={isFetchingRx}
            libraryPreviews={libraryPreviews}
            previews={previews}
            setPreviews={setPreviews}
            images={images}
            setImages={setImages}
          />
        </div>

        <div className="lg:col-span-5">
          <PrescriptionOrderForm
            durations={medicineDurations}
            selectedDurationId={selectedDurationId}
            setSelectedDurationId={setSelectedDurationId}
            note={note}
            setNote={setNote}
            address={selectedAddress}
            onOpenAddressPopup={() => setIsAddressPopupOpen(true)}
            onOrder={handleOrderSubmission}
            isPlacingOrder={isPlacingOrder}
            orderError={orderError}
          />
        </div>
      </div>

      <AddressSelectorPopup
        isOpen={isAddressPopupOpen}
        onClose={() => setIsAddressPopupOpen(false)}
        onSelect={addr => setSelectedAddress(addr)}
      />
    </div>
  );
}

export default function UploadPrescriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <FiLoader className="animate-spin text-gray-400" size={40} />
        </div>
      }
    >
      <UploadPrescriptionContent />
    </Suspense>
  );
}
