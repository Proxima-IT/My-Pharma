'use client';

import React, { useEffect, use, useMemo } from 'react';
import Link from 'next/link';
import {
  FiChevronLeft,
  FiPackage,
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
} from 'react-icons/fi';
import { usePharmacyOrders } from '../../../hooks/usePharmacyOrders';
import { formatCurrency, formatDate } from '@/app/(user)/lib/formatters';
import OrderInfoCard from './components/OrderInfoCard';
import OrderedProductCard from './components/OrderedProductCard';

export default function PharmacyOrderDetailsPage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const {
    orderDetails,
    isLoading,
    isUpdating,
    error,
    loadOrderDetails,
    updateStatus,
  } = usePharmacyOrders();

  useEffect(() => {
    if (id) loadOrderDetails(id);
  }, [id, loadOrderDetails]);

  const parsedData = useMemo(() => {
    if (!orderDetails?.shipping_address)
      return { name: 'N/A', email: 'N/A', phone: 'N/A', address: 'N/A' };
    const parts = orderDetails.shipping_address.split(',').map(p => p.trim());
    return {
      name: parts[0] || 'N/A',
      email: parts[1] || 'N/A',
      phone: parts[2] || 'N/A',
      address: parts.slice(3).join(', ') || 'N/A',
    };
  }, [orderDetails]);

  const handleStatusChange = async newStatus => {
    await updateStatus(id, newStatus);
  };

  if (isLoading && !orderDetails) {
    return (
      <div className="w-full py-40 flex items-center justify-center bg-(--color-admin-bg)">
        <div className="font-mono text-sm animate-pulse tracking-widest uppercase text-(--color-admin-primary)">
          Initializing_Order_Data...
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="w-full py-20 px-4 bg-(--color-admin-bg)">
        <div className="bg-(--color-admin-card) border border-(--color-admin-error) p-10 text-center">
          <p className="font-mono text-(--color-admin-error) font-bold mb-6 uppercase tracking-widest">
            ERROR::RECORD_NOT_FOUND: {error || 'NULL_REFERENCE'}
          </p>
          <Link
            href="/pharmacy/orders"
            className="inline-block bg-(--color-admin-navy) text-white px-6 py-3 font-bold uppercase text-xs tracking-widest hover:bg-(--color-admin-accent) transition-all duration-300"
          >
            Return to Database
          </Link>
        </div>
      </div>
    );
  }

  const getStatusStyles = status => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'bg-(--color-admin-success) text-white border-(--color-admin-border)';
      case 'SHIPPED':
        return 'bg-blue-600 text-white border-(--color-admin-border)';
      case 'CANCELLED':
        return 'bg-(--color-admin-error) text-white border-(--color-admin-border)';
      default:
        return 'bg-(--color-admin-warning) text-black border-(--color-admin-border)';
    }
  };

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 pb-20 bg-(--color-admin-bg)">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-(--color-admin-border) pb-8">
        <div className="flex flex-col gap-4">
          <Link href="/pharmacy/orders">
            <button className="flex items-center gap-2 px-4 py-2 bg-(--color-admin-navy) text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-(--color-admin-accent) transition-all duration-300 cursor-pointer">
              <FiChevronLeft /> BACK_TO_RECORDS
            </button>
          </Link>
          <h1 className="text-4xl font-black text-(--color-admin-navy) tracking-tighter uppercase">
            Order <span className="font-mono">#{orderDetails.id}</span>
          </h1>
        </div>
        <div className="font-mono text-xs bg-(--color-admin-card) border border-(--color-admin-border) px-4 py-2 font-bold text-(--color-admin-navy)">
          RECORD_TYPE: TRANSACTION_LOG
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-start">
        {/* MAIN COLUMN */}
        <div className="xl:col-span-2 space-y-10">
          {/* 1. Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-(--color-admin-border) bg-(--color-admin-border)">
            <OrderInfoCard
              label="Order Date"
              value={formatDate(orderDetails.created_at).toUpperCase()}
            />
            <OrderInfoCard
              label="Net Amount"
              value={formatCurrency(orderDetails.total)}
            />
            <OrderInfoCard label="Method" value="CASH_ON_DELIVERY" />
            <OrderInfoCard label="Payment" badge="UNPAID" badgeType="error" />
          </div>

          {/* 2. Items List */}
          <div className="bg-(--color-admin-card) border border-(--color-admin-border) p-0">
            <div className="bg-(--color-admin-navy) text-white px-6 py-4 flex items-center gap-3">
              <FiPackage />
              <h3 className="text-sm font-bold uppercase tracking-widest">
                Manifest_Entries
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {orderDetails.items?.map((item, idx) => (
                <OrderedProductCard key={idx} item={item} />
              ))}
            </div>
          </div>

          {/* 3. Shipping Address */}
          <div className="bg-(--color-admin-card) border border-(--color-admin-border) p-8">
            <h3 className="text-sm font-black text-(--color-admin-navy) uppercase tracking-widest flex items-center gap-3 mb-6 border-b border-(--color-admin-border) pb-4">
              <FiMapPin className="text-(--color-text-secondary)" />
              Delivery_Coordinates
            </h3>
            <p className="font-mono text-sm text-(--color-admin-navy) leading-relaxed font-bold uppercase">
              {parsedData.address}
            </p>
          </div>
        </div>

        {/* SIDEBAR COLUMN */}
        <div className="xl:col-span-1 space-y-10">
          {/* Status Management */}
          <div className="bg-(--color-admin-card) border border-(--color-admin-border) p-0">
            <div className="bg-(--color-admin-navy) text-white px-6 py-4">
              <h3 className="text-sm font-bold uppercase tracking-widest">
                System_Status
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div
                className={`flex items-center justify-center gap-3 py-4 border font-mono font-black uppercase text-sm tracking-widest ${getStatusStyles(orderDetails.status)}`}
              >
                {orderDetails.status}
              </div>

              <div className="space-y-2">
                <p className="font-mono text-[10px] font-bold text-(--color-text-secondary) uppercase tracking-widest mb-4">
                  EXECUTE_STATUS_CHANGE:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    'CONFIRMED',
                    'PROCESSING',
                    'SHIPPED',
                    'DELIVERED',
                    'CANCELLED',
                  ].map(status => (
                    <button
                      key={status}
                      disabled={isUpdating || orderDetails.status === status}
                      onClick={() => handleStatusChange(status)}
                      className={`w-full py-3 border font-mono text-[10px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                        orderDetails.status === status
                          ? 'bg-(--color-admin-bg) border-(--color-admin-border) text-(--color-text-secondary) cursor-not-allowed'
                          : 'border-(--color-admin-border) text-(--color-admin-navy) hover:bg-(--color-admin-accent) hover:text-white hover:border-(--color-admin-accent)'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-(--color-admin-card) border border-(--color-admin-border) p-0">
            <div className="bg-(--color-admin-navy) text-white px-6 py-4 flex items-center gap-3">
              <FiUser />
              <h3 className="text-sm font-bold uppercase tracking-widest">
                Entity_Details
              </h3>
            </div>
            <div className="p-8 space-y-6 font-mono">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-(--color-admin-border) flex items-center justify-center bg-white">
                  <FiUser size={18} className="text-(--color-admin-primary)" />
                </div>
                <p className="font-bold text-(--color-admin-navy) uppercase text-sm">
                  {parsedData.name}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-(--color-admin-border) flex items-center justify-center bg-white">
                  <FiMail size={18} className="text-(--color-admin-primary)" />
                </div>
                <p className="text-xs font-bold text-(--color-text-secondary) truncate uppercase">
                  {parsedData.email}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-(--color-admin-border) flex items-center justify-center bg-white">
                  <FiPhone size={18} className="text-(--color-admin-primary)" />
                </div>
                <p className="text-sm font-bold text-(--color-admin-navy)">
                  {parsedData.phone}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
