'use client';

import React, { useEffect, use, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FiArrowLeft,
  FiCheck,
  FiBox,
  FiHome,
  FiAlertCircle,
  FiFileText,
  FiPackage,
  FiXCircle,
} from 'react-icons/fi';
import { TbTruckDelivery, TbBike } from 'react-icons/tb';
import { useProductData } from '@/app/(public)/hooks/useProductData';
import { formatDate, formatCurrency } from '../../../../lib/formatters';
import OrderedProductCard from '../../[id]/components/OrderedProductCard';
import { API_BASE_URL, getMediaUrl } from '@/app/(shared)/lib/apiConfig';

/**
 * PrescriptionOrderDetailsPage
 * 100% Pixel-Perfect Match to the Order Tracking design.
 * Fixed: Updated address parsing to handle the Object response from shipping_address_detail.
 */
export default function PrescriptionOrderDetailsPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { products } = useProductData();

  useEffect(() => {
    const fetchPrescriptionDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(
          `${API_BASE_URL}/prescriptions/${resolvedParams.id}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!res.ok) throw new Error('Prescription order not found');
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams?.id) fetchPrescriptionDetails();
  }, [resolvedParams?.id]);

  // 1. Updated Address Parsing Logic for Object Data
  const addressDetails = useMemo(() => {
    const detail = order?.shipping_address_detail;
    if (!detail)
      return {
        fullName: 'N/A',
        phone: 'N/A',
        cleanAddress: 'N/A',
        gender: 'N/A',
        district: 'N/A',
        thana: 'N/A',
      };

    // If backend returns an object (as seen in the latest response)
    if (typeof detail === 'object') {
      return {
        fullName: detail.full_name || 'N/A',
        phone: detail.phone || 'N/A',
        gender: detail.gender || 'N/A',
        district: detail.district || 'N/A',
        thana: detail.thana || 'N/A',
        cleanAddress: detail.address || 'N/A',
      };
    }

    // Fallback for string parsing
    const parts = detail.split(',').map(p => p.trim());
    return {
      fullName: parts[0] || 'N/A',
      phone: parts[2] || 'N/A',
      cleanAddress: parts.slice(3).join(', ') || detail,
      gender: 'N/A',
      district: 'N/A',
      thana: 'N/A',
    };
  }, [order]);

  // 2. Milestone Mapping
  const steps = [
    {
      label: 'Rx Uploaded',
      status: 'PENDING',
      icon: <FiFileText className="w-6 h-6 md:w-8" />,
    },
    {
      label: 'Rx Verified',
      status: 'APPROVED',
      icon: <FiCheck className="w-6 h-6 md:w-8" />,
    },
    {
      label: 'Processing',
      status: 'PROCESSING',
      icon: <TbTruckDelivery className="w-6 h-6 md:w-8" />,
    },
    {
      label: 'On The Way',
      status: 'SHIPPED',
      icon: <TbBike className="w-6 h-6 md:w-8" />,
    },
    {
      label: 'Completed',
      status: 'USED',
      icon: <FiPackage className="w-6 h-6 md:w-8" />,
    },
  ];

  const currentStatus = order?.status?.toUpperCase() || '';
  const activeIndex = steps.findIndex(s => s.status === currentStatus);
  const isRejected = currentStatus === 'REJECTED';

  if (loading)
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (error || !order) {
    return (
      <div className="w-full h-screen bg-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <FiAlertCircle size={48} className="text-red-500" />
        <h2 className="text-2xl font-bold text-black">
          Prescription Not Found
        </h2>
        <Link href="/user/orders" className="font-bold underline text-black">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 animate-in fade-in duration-700 w-full overflow-x-hidden text-black">
      <div className="w-full px-4 sm:px-6 lg:px-10 pt-6 md:pt-10 flex items-center gap-6">
        <button
          onClick={() => router.back()}
          className="w-fit flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 rounded-full text-sm font-bold text-black hover:bg-gray-50 transition-all cursor-pointer shadow-none"
        >
          <FiArrowLeft /> Back
        </button>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
          Prescription Tracking
        </h1>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-10 mt-6 md:mt-10 space-y-6 md:space-y-10">
        {/* Header Info Bar */}
        <div className="w-full bg-white border border-gray-100 rounded-[24px] md:rounded-[32px] p-5 md:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl lg:text-[28px] font-bold">
              Order ID: RX-{order.id}
            </h2>
            <p className="text-sm text-black font-medium">
              Order Date:{' '}
              <span className="font-bold">{formatDate(order.created_at)}</span>
            </p>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-6 md:gap-10 lg:gap-16 w-full lg:w-auto">
            <div className="text-left sm:text-center md:text-right">
              <span
                className={`px-4 py-1.5 text-[11px] md:text-[13px] font-bold rounded-full uppercase ${isRejected ? 'bg-red-50 text-red-600' : 'bg-[#F0FDF4] text-[#10B981]'}`}
              >
                {isRejected ? 'Rejected' : 'Active'}
              </span>
              <p className="text-[10px] md:text-[12px] font-light uppercase tracking-widest mt-2">
                Status
              </p>
            </div>
            <div className="text-left sm:text-center md:text-right">
              <span className="px-4 py-1.5 bg-gray-50 text-black text-[11px] md:text-[13px] font-bold rounded-full uppercase">
                {order.medicine_supply_duration?.replace('_', ' ') || 'N/A'}
              </span>
              <p className="text-[10px] md:text-[12px] font-light uppercase tracking-widest mt-2">
                Duration
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1 text-left sm:text-center md:text-right">
              <span className="text-lg md:text-xl lg:text-2xl font-bold">
                {order.total
                  ? `৳${parseFloat(order.total).toLocaleString()}`
                  : 'TBD'}
              </span>
              <p className="text-[10px] md:text-[12px] font-light uppercase tracking-widest mt-1">
                Total Amount
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal Timeline */}
        {!isRejected ? (
          <div className="w-full bg-white border border-gray-100 rounded-[24px] md:rounded-[32px] p-5 md:p-12 space-y-8 overflow-hidden shadow-none">
            <h3 className="text-xs md:text-sm font-bold uppercase tracking-[0.2em]">
              Timeline
            </h3>
            <div className="overflow-x-auto no-scrollbar pb-4">
              <div className="relative min-w-[700px] md:min-w-full pt-4 pb-8">
                <div className="absolute top-[50px] md:top-[60px] left-[10%] right-[10%] h-1 bg-gray-100 rounded-full" />
                <div
                  className="absolute top-[50px] md:top-[60px] left-[10%] h-1 bg-[#10B981] rounded-full transition-all duration-1000"
                  style={{
                    width: `${activeIndex !== -1 ? (activeIndex / (steps.length - 1)) * 80 : 0}%`,
                  }}
                />
                <div className="relative flex justify-between">
                  {steps.map((step, idx) => {
                    const isCompleted = idx <= activeIndex;
                    const historyItem = order.status_history?.find(
                      h => h.status === step.status,
                    );
                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center text-center w-1/5 space-y-4 md:space-y-6"
                      >
                        <div
                          className={`w-16 h-16 md:w-24 lg:w-28 rounded-[20px] md:rounded-[32px] flex items-center justify-center transition-all duration-500 ${isCompleted ? 'bg-[#F3F4F6]' : 'bg-gray-50 text-gray-300'}`}
                        >
                          {step.icon}
                        </div>
                        <div
                          className={`w-8 h-8 md:w-10 rounded-full border-4 border-white flex items-center justify-center z-10 transition-all duration-500 ${isCompleted ? 'bg-[#10B981] text-white' : 'bg-gray-200 text-transparent'}`}
                        >
                          <FiCheck className="w-4 h-4 md:w-5" strokeWidth={4} />
                        </div>
                        <div className="space-y-1">
                          <p
                            className={`text-[12px] md:text-[15px] font-bold ${isCompleted ? 'text-black' : 'text-gray-400'}`}
                          >
                            {step.label}
                          </p>
                          {historyItem && (
                            <div className="text-[10px] md:text-[12px] font-medium text-gray-500">
                              <p>{historyItem.time_bd}</p>
                              <p>{historyItem.date_bd}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full bg-red-50 p-8 md:p-12 rounded-[24px] md:rounded-[32px] flex items-center gap-4 text-red-600 border border-red-100">
            <FiXCircle className="w-8 h-8 md:w-10 md:h-10 shrink-0" />
            <div>
              <h3 className="text-lg md:text-xl font-bold uppercase tracking-tight">
                Prescription Rejected
              </h3>
              <p className="text-sm md:text-base font-medium">
                This prescription was not approved by our pharmacist. Please
                check the notes.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-10">
          <div className="space-y-6 md:space-y-10">
            {/* Prescription Images Section */}
            <div className="w-full bg-white border border-gray-100 rounded-[24px] md:rounded-[32px] p-5 md:p-8 space-y-6">
              <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                <FiFileText className="text-gray-400" /> Uploaded Prescription
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {order.images?.map(img => (
                  <div
                    key={img.id}
                    className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-gray-100"
                  >
                    <Image
                      src={getMediaUrl(img.image_url || img.image)}
                      alt="Prescription"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
              {order.prescription_note && (
                <div className="p-5 bg-gray-50 rounded-[20px] border border-gray-100">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Prescription Note
                  </p>
                  <p className="text-[15px] text-black font-medium leading-relaxed">
                    {order.prescription_note}
                  </p>
                </div>
              )}
            </div>

            {/* Medicines List */}
            {order.items?.length > 0 && (
              <div className="w-full bg-white border border-gray-100 rounded-[24px] md:rounded-[32px] p-5 md:p-8 space-y-6">
                <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <FiPackage className="text-gray-400" /> Medicines Provided
                </h3>
                <div className="space-y-4">
                  {order.items.map(item => (
                    <OrderedProductCard
                      key={item.id}
                      item={item}
                      productInfo={
                        Array.isArray(products)
                          ? products.find(p => p.id === item.product)
                          : products?.results?.find(p => p.id === item.product)
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 md:space-y-10">
            {/* Shipping Address Section */}
            <div className="w-full bg-white border border-gray-100 rounded-[24px] md:rounded-[32px] p-5 md:p-8 space-y-8">
              <h3 className="text-xl md:text-2xl font-bold">
                Shipping Address
              </h3>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-[20px] border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black shadow-sm shrink-0">
                  <FiHome size={24} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-base md:text-lg truncate">
                    {addressDetails.fullName}
                  </h4>
                </div>
              </div>
              <div className="space-y-5">
                {[
                  { label: 'Phone Number', value: addressDetails.phone },
                  { label: 'Gender', value: addressDetails.gender },
                  { label: 'Deistic', value: addressDetails.district },
                  { label: 'Thana', value: addressDetails.thana },
                  { label: 'Full Address', value: addressDetails.cleanAddress },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center text-sm md:text-[15px] gap-1 sm:gap-0"
                  >
                    <span className="w-full sm:w-32 md:w-36 text-black font-light uppercase tracking-wider shrink-0">
                      {item.label}
                    </span>
                    <span className="hidden sm:inline text-gray-300 mr-4 md:mr-6">
                      -
                    </span>
                    <span className="flex-1 font-bold sm:text-right break-words">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vertical Order Timeline */}
            <div className="w-full bg-white border border-gray-100 rounded-[24px] md:rounded-[32px] p-5 md:p-8 space-y-8">
              <h3 className="text-xl md:text-2xl font-bold">Order Timeline</h3>
              <div className="space-y-0">
                {order.status_history?.map((history, idx) => {
                  const isLast = idx === order.status_history.length - 1;
                  const isCurrent = idx === 0;
                  return (
                    <div
                      key={history.id || idx}
                      className="relative pl-12 md:pl-16 pb-10 md:pb-12"
                    >
                      {!isLast && (
                        <div className="absolute left-[19px] md:left-[23px] top-10 md:top-12 bottom-0 w-0.5 bg-[#10B981]" />
                      )}
                      <div
                        className={`absolute left-0 top-1.5 w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-white flex items-center justify-center z-10 ${isCurrent ? 'bg-[#10B981] text-white' : 'bg-gray-200 text-gray-400'}`}
                      >
                        <FiCheck
                          className="w-4 h-4 md:w-5 md:h-5"
                          strokeWidth={4}
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-[11px] md:text-[14px] font-bold text-gray-400 uppercase tracking-widest">
                          {history.date_bd}, {history.time_bd}
                        </p>
                        <div className="bg-white border border-gray-100 p-5 md:p-8 rounded-[20px] md:rounded-[24px] space-y-2">
                          <div className="flex flex-wrap items-center gap-3 md:gap-4">
                            <h4 className="font-bold text-base md:text-xl uppercase">
                              Order {history.status}
                            </h4>
                            {isCurrent && (
                              <span className="px-2.5 py-1 bg-[#F0FDF4] text-[#10B981] text-[9px] md:text-[11px] font-bold rounded-full uppercase border border-[#DCFCE7]">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-sm md:text-[16px] text-gray-500 font-medium">
                            Your prescription order has been{' '}
                            {history.status.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
