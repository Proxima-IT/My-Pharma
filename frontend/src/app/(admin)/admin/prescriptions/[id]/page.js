'use client';

import React, { useEffect, use, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FiArrowLeft,
  FiCheck,
  FiX,
  FiSearch,
  FiPlus,
  FiTrash2,
  FiUser,
  FiMapPin,
  FiFileText,
  FiActivity,
  FiHash,
} from 'react-icons/fi';
import { usePrescriptionAdmin } from '../../../hooks/usePrescriptionAdmin';
import { useProductAdmin } from '../../../hooks/useProductAdmin';
import { formatCurrency, formatDate } from '@/app/(user)/lib/formatters';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';

/**
 * Admin Prescription Verification Page
 * Design System: Super Admin "Sharp Minimalist"
 * - rounded-none
 * - shadow-none
 * - border-gray-100 (Thin borders)
 * - font-mono for technical data
 */
export default function AdminPrescriptionDetailPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { id } = resolvedParams;

  // Hooks
  const {
    prescriptionDetails,
    loading,
    isUpdating,
    fetchPrescriptionDetails,
    verifyRx,
  } = usePrescriptionAdmin();
  const { products, fetchProducts } = useProductAdmin();

  // Local States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [adminNotes, setAdminNotes] = useState('');
  const [doctorInfo, setDoctorInfo] = useState({ name: '', reg: '' });

  useEffect(() => {
    if (id) fetchPrescriptionDetails(id);
  }, [id, fetchPrescriptionDetails]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      fetchProducts({ search: searchQuery, is_active: 'true' });
    }
  }, [searchQuery, fetchProducts]);

  // Address Parsing Logic (Handles both Object and String formats)
  const address = useMemo(() => {
    const detail = prescriptionDetails?.shipping_address_detail;
    if (!detail) return { name: 'N/A', phone: 'N/A', full: 'N/A' };
    if (typeof detail === 'object')
      return {
        name: detail.full_name,
        phone: detail.phone,
        full: detail.address,
      };
    const parts = detail.split(',').map(p => p.trim());
    return { name: parts[0], phone: parts[2], full: parts.slice(3).join(', ') };
  }, [prescriptionDetails]);

  const addItem = product => {
    const exists = selectedItems.find(item => item.id === product.id);
    if (exists) {
      setSelectedItems(
        selectedItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ]);
    }
    setSearchQuery('');
  };

  const removeItem = id =>
    setSelectedItems(selectedItems.filter(i => i.id !== id));

  const totalValue = selectedItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const handleAction = async status => {
    if (status === 'APPROVED' && selectedItems.length === 0) {
      alert('Please add at least one medicine before approving.');
      return;
    }

    const payload = {
      status: status,
      notes: adminNotes,
      doctor_name: doctorInfo.name,
      doctor_reg_number: doctorInfo.reg,
      items: selectedItems.map(item => ({
        product: item.id,
        quantity_prescribed: item.quantity,
      })),
    };

    const success = await verifyRx(id, payload);
    if (success) {
      alert(
        `Prescription ${status === 'APPROVED' ? 'Verified' : 'Rejected'} Successfully`,
      );
      router.push('/admin/orders');
    }
  };

  if (loading || !prescriptionDetails) {
    return (
      <div className="p-20 text-center font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-[#8A8A78]">
        FETCHING_PRESCRIPTION_CORE_DATA...
      </div>
    );
  }

  const labelClass =
    'font-mono text-[10px] font-bold text-[#8A8A78] uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-11 px-4 bg-white border border-gray-100 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase placeholder:text-gray-200 text-[#1B1B1B]';

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-8">
        <div className="space-y-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[#8A8A78] hover:text-[#1B1B1B] transition-colors cursor-pointer"
          >
            <FiArrowLeft /> Return_To_Logistics
          </button>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none text-[#1B1B1B]">
            Review Prescription
          </h1>
          <div className="flex gap-4 font-mono text-[11px] font-bold text-[#8A8A78] uppercase tracking-widest">
            <span className="flex items-center gap-1">
              <FiHash /> RX-{prescriptionDetails.id}
            </span>
            <span>•</span>
            <span>{formatDate(prescriptionDetails.created_at)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleAction('REJECTED')}
            disabled={isUpdating}
            className="h-14 px-8 bg-white border border-red-100 text-red-600 font-bold uppercase text-[11px] tracking-widest hover:bg-red-50 transition-all cursor-pointer disabled:opacity-50"
          >
            Reject Request
          </button>
          <button
            onClick={() => handleAction('APPROVED')}
            disabled={isUpdating}
            className="h-14 px-8 bg-[#1B1B1B] text-white font-bold uppercase text-[11px] tracking-widest hover:bg-[#3A5A40] transition-all cursor-pointer disabled:opacity-50"
          >
            {isUpdating ? 'INITIALIZING...' : 'Verify & Approve'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Main Column */}
        <div className="xl:col-span-8 space-y-10">
          {/* 1. Image Viewer Container */}
          <div className="bg-white border border-gray-100 p-8 space-y-6">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 text-[#1B1B1B]">
              <FiFileText className="text-[#3A5A40]" /> Digital Asset Review
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {prescriptionDetails.images?.map(img => (
                <div
                  key={img.id}
                  className="relative aspect-[3/4] border border-gray-50 overflow-hidden group bg-gray-50"
                >
                  <Image
                    src={getMediaUrl(img.image_url || img.image)}
                    alt="Prescription"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                  <a
                    href={getMediaUrl(img.image_url || img.image)}
                    target="_blank"
                    className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[#1B1B1B] font-mono text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    Open_Full_Resolution
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Product Assignment Container */}
          <div className="bg-white border border-gray-100 p-8 space-y-8">
            <div className="space-y-4">
              <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#1B1B1B]">
                Assign Medicines
              </h3>
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A78]" />
                <input
                  type="text"
                  placeholder="SEARCH_CATALOG_BY_NAME..."
                  className={inputClass + ' pl-12 h-14'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery.length > 2 && (
                  <div className="absolute top-full left-0 w-full bg-white border border-gray-100 z-50 max-h-64 overflow-y-auto border-t-0">
                    {(products.results || []).map(p => (
                      <div
                        key={p.id}
                        onClick={() => addItem(p)}
                        className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors"
                      >
                        <span className="font-bold text-xs uppercase text-[#1B1B1B]">
                          {p.name}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-[#3A5A40]">
                          {formatCurrency(p.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selection Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[#8A8A78] font-mono text-[10px] uppercase tracking-widest border-b border-gray-100">
                    <th className="py-4 font-bold">Medicine_Identifier</th>
                    <th className="py-4 text-center font-bold">Qty</th>
                    <th className="py-4 text-right font-bold">Unit_Price</th>
                    <th className="py-4 text-right font-bold">Subtotal</th>
                    <th className="py-4 text-right w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {selectedItems.map(item => (
                    <tr key={item.id} className="group">
                      <td className="py-5 text-xs font-bold uppercase text-[#1B1B1B]">
                        {item.name}
                      </td>
                      <td className="py-5 text-center">
                        <input
                          type="number"
                          className="w-16 h-8 text-center border border-gray-100 font-mono text-xs focus:border-black outline-none"
                          value={item.quantity}
                          onChange={e =>
                            setSelectedItems(
                              selectedItems.map(i =>
                                i.id === item.id
                                  ? {
                                      ...i,
                                      quantity: parseInt(e.target.value) || 1,
                                    }
                                  : i,
                              ),
                            )
                          }
                        />
                      </td>
                      <td className="py-5 text-right font-mono text-xs text-[#6B6B5E]">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-5 text-right font-mono text-xs font-bold text-[#1B1B1B]">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                      <td className="py-5 text-right">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[#8A8A78] hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {selectedItems.length > 0 && (
                    <tr className="bg-gray-50/50">
                      <td
                        colSpan="3"
                        className="py-6 px-4 font-mono text-[11px] font-bold uppercase tracking-widest text-[#1B1B1B]"
                      >
                        Total_Order_Value
                      </td>
                      <td className="py-6 text-right px-4 font-mono text-sm font-black text-[#3A5A40]">
                        {formatCurrency(totalValue)}
                      </td>
                      <td></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="xl:col-span-4 space-y-8">
          {/* Customer Module */}
          <div className="bg-white border border-gray-100 p-8 space-y-6">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest border-b border-gray-50 pb-4 flex items-center gap-2 text-[#1B1B1B]">
              <FiUser className="text-[#3A5A40]" /> Customer Profile
            </h3>
            <div className="space-y-5">
              <div className="space-y-1">
                <label className={labelClass}>Customer_Name</label>
                <p className="font-bold uppercase text-xs text-[#1B1B1B]">
                  {address.name}
                </p>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Contact_Number</label>
                <p className="font-mono font-bold text-xs text-[#1B1B1B]">
                  {address.phone}
                </p>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Delivery_Destination</label>
                <p className="font-bold text-[11px] leading-relaxed uppercase text-[#1B1B1B]">
                  {address.full}
                </p>
              </div>
            </div>
          </div>

          {/* Verification Module */}
          <div className="bg-white border border-gray-100 p-8 space-y-6">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest border-b border-gray-50 pb-4 flex items-center gap-2 text-[#1B1B1B]">
              <FiActivity className="text-[#3A5A40]" /> Verification Logs
            </h3>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Doctor_Credential_Name</label>
                <input
                  className={inputClass}
                  value={doctorInfo.name}
                  onChange={e =>
                    setDoctorInfo({ ...doctorInfo, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Registration_Identifier</label>
                <input
                  className={inputClass}
                  value={doctorInfo.reg}
                  onChange={e =>
                    setDoctorInfo({ ...doctorInfo, reg: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Internal_Audit_Notes</label>
                <textarea
                  className={inputClass + ' h-28 py-3 resize-none normal-case'}
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
