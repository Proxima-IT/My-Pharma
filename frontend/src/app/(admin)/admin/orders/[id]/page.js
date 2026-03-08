'use client';
import React, { useEffect, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiArrowLeft,
  FiPackage,
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
} from 'react-icons/fi';
import { useAdminOrders } from '../../../hooks/useAdminOrders';
import { formatCurrency, formatDate } from '@/app/(user)/lib/formatters';

export default function AdminOrderDetailsPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const {
    orderDetails,
    loading,
    isUpdating,
    error,
    fetchOrderDetails,
    updateStatus,
  } = useAdminOrders();

  useEffect(() => {
    if (id) fetchOrderDetails(id);
  }, [id, fetchOrderDetails]);

  const parsedInfo = useMemo(() => {
    if (!orderDetails?.shipping_address) {
      return {
        name: 'N/A',
        email: 'N/A',
        phone: 'N/A',
        address: 'No address provided',
      };
    }
    const parts = orderDetails.shipping_address.split(',').map(p => p.trim());
    return {
      name: parts[0] || 'N/A',
      email: parts[1] || 'N/A',
      phone: parts[2] || 'N/A',
      address: parts.slice(3).join(', ') || 'N/A',
    };
  }, [orderDetails]);

  const handleStatusChange = async newStatus => {
    if (confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      await updateStatus(id, newStatus);
    }
  };

  if (loading && !orderDetails) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#3A5A40] border-t-transparent animate-spin" />
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-[#8A8A78]">
            Loading_Details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="w-full py-20 text-center bg-white border border-red-100">
        <p className="text-red-600 font-bold mb-4">
          Order not found or error occurred.
        </p>
        <button
          onClick={() => router.back()}
          className="text-[#3A5A40] font-bold underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col items-start gap-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-3 bg-[#3A5A40] text-white px-6 py-3 hover:bg-[#F59E0B] transition-all cursor-pointer group border border-transparent"
        >
          <FiArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
            Go Back
          </span>
        </button>

        <div className="space-y-3">
          <h1 className="text-4xl font-black text-[#1B1B1B] tracking-tighter uppercase leading-none">
            Order Details
          </h1>
          <div className="font-mono text-sm font-bold text-[#8A8A78] uppercase tracking-widest">
            Order_ID: <span className="text-[#1B1B1B]">#{orderDetails.id}</span>
          </div>
          <p className="text-[13px] text-[#6B6B5E] font-medium">
            Customer:{' '}
            <span className="text-[#3A5A40] font-bold">{parsedInfo.name}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-start">
        {/* Main Column */}
        <div className="xl:col-span-2 space-y-8">
          {/* 1. Order Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-100 p-6">
              <span className="block font-mono text-[10px] font-bold text-[#8A8A78] uppercase mb-2">
                Order Date
              </span>
              <span className="text-sm font-bold text-[#1B1B1B]">
                {formatDate(orderDetails.created_at)}
              </span>
            </div>
            <div className="bg-white border border-gray-100 p-6">
              <span className="block font-mono text-[10px] font-bold text-[#8A8A78] uppercase mb-2">
                Total Amount
              </span>
              <span className="text-lg font-black text-[#3A5A40]">
                {formatCurrency(orderDetails.total)}
              </span>
            </div>
            <div className="bg-white border border-gray-100 p-6">
              <span className="block font-mono text-[10px] font-bold text-[#8A8A78] uppercase mb-2">
                Current Status
              </span>
              <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold uppercase">
                {orderDetails.status}
              </span>
            </div>
          </div>

          {/* 2. Items List */}
          <div className="bg-white border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <FiPackage className="text-[#3A5A40]" />
              <h3 className="text-xs font-bold text-[#1B1B1B] uppercase tracking-widest">
                Ordered Medicines
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              {orderDetails.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 flex justify-between items-center hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-[#1B1B1B] text-sm uppercase">
                      {item.product_name}
                    </p>
                    <div className="flex items-center gap-3">
                      <p className="font-mono text-[11px] text-[#8A8A78]">
                        Price: {formatCurrency(item.price_at_order)} x{' '}
                        {item.quantity}
                      </p>

                      {/* DOSAGE UI: Highlighted for Admin visibility */}
                      {item.dosage && (
                        <span className="px-2 py-0.5 bg-[#E8F0EA] border border-[#3A5A40]/20 text-[#3A5A40] font-mono text-[10px] font-bold uppercase">
                          Dosage: {item.dosage}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[#1B1B1B]">
                    {formatCurrency(item.price_at_order * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Shipping Address */}
          <div className="bg-white border border-gray-100 p-8">
            <h3 className="text-xs font-bold text-[#1B1B1B] uppercase tracking-widest flex items-center gap-2 mb-4">
              <FiMapPin className="text-[#3A5A40]" /> Delivery Address
            </h3>
            <p className="text-sm text-[#1B1B1B] leading-relaxed font-bold uppercase tracking-tight">
              {parsedInfo.address}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Status Management */}
          <div className="bg-white border border-gray-100 p-6">
            <h3 className="text-xs font-bold text-[#1B1B1B] uppercase tracking-widest flex items-center gap-2 mb-6">
              <FiClock className="text-[#3A5A40]" /> Update Status
            </h3>
            <div className="flex flex-col gap-2">
              {[
                'PENDING',
                'CONFIRMED',
                'SHIPPED',
                'DELIVERED',
                'CANCELLED',
              ].map(status => (
                <button
                  key={status}
                  disabled={isUpdating || orderDetails.status === status}
                  onClick={() => handleStatusChange(status)}
                  className={`w-full py-3 text-[10px] font-bold uppercase tracking-widest border transition-all cursor-pointer ${
                    orderDetails.status === status
                      ? 'bg-gray-50 border-gray-100 text-[#B7B7A4] cursor-not-allowed'
                      : 'bg-white border-gray-200 text-[#1B1B1B] hover:border-[#3A5A40] hover:text-[#3A5A40]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white border border-gray-100 p-6">
            <h3 className="text-xs font-bold text-[#1B1B1B] uppercase tracking-widest flex items-center gap-2 mb-6">
              <FiUser className="text-[#3A5A40]" /> Customer Info
            </h3>
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <FiUser className="text-[#8A8A78] shrink-0" />
                <span className="text-xs text-[#1B1B1B] font-bold uppercase">
                  {parsedInfo.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <FiMail className="text-[#8A8A78] shrink-0" />
                <span className="text-xs text-[#6B6B5E] truncate">
                  {parsedInfo.email}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <FiPhone className="text-[#8A8A78] shrink-0" />
                <span className="text-xs text-[#6B6B5E] font-mono">
                  {parsedInfo.phone}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
