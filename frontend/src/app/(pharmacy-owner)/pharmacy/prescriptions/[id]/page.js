'use client';

import React, { useEffect, use, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  FiChevronLeft,
  FiSearch,
  FiPlus,
  FiTrash2,
  FiUser,
  FiMapPin,
  FiFileText,
  FiActivity,
  FiCheck,
  FiX,
  FiImage,
} from 'react-icons/fi';
import { usePharmacyPrescriptions } from '../../../hooks/usePharmacyPrescriptions';
import { usePharmacyProducts } from '../../../hooks/usePharmacyProducts';
import { formatCurrency, formatDate } from '@/app/(user)/lib/formatters';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';

/**
 * PharmacyPrescriptionVerificationPage
 * Design System: Pharmacy Owner "Sharp & Authoritative"
 * - rounded-none
 * - border-2 border-black
 * - high contrast
 */
export default function PharmacyPrescriptionVerificationPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { id } = resolvedParams;

  // Hooks
  const {
    prescriptionDetails,
    isLoading: rxLoading,
    isUpdating,
    loadPrescriptionDetails,
    verifyRx,
  } = usePharmacyPrescriptions();

  const { products, handleSearch } = usePharmacyProducts();

  // Local States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [adminNotes, setAdminNotes] = useState('');
  const [doctorInfo, setDoctorInfo] = useState({ name: '', reg: '' });

  useEffect(() => {
    if (id) loadPrescriptionDetails(id);
  }, [id, loadPrescriptionDetails]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      handleSearch(searchQuery);
    }
  }, [searchQuery, handleSearch]);

  // 1. Address Parsing Logic (Synchronized with working Super Admin logic)
  const address = useMemo(() => {
    const detail = prescriptionDetails?.shipping_address_detail;
    if (!detail) return { name: 'N/A', phone: 'N/A', full: 'N/A' };

    if (typeof detail === 'object')
      return {
        name: detail.full_name || 'N/A',
        phone: detail.phone || 'N/A',
        full: detail.address || 'N/A',
      };

    const parts = detail.split(',').map(p => p.trim());
    return {
      name: parts[0] || 'N/A',
      phone: parts[2] || 'N/A',
      full: parts.slice(3).join(', ') || detail,
    };
  }, [prescriptionDetails]);

  // 2. Image Collection Logic
  const allImages = useMemo(() => {
    if (!prescriptionDetails) return [];
    const imgs = [];
    if (prescriptionDetails.images && prescriptionDetails.images.length > 0) {
      prescriptionDetails.images.forEach(img =>
        imgs.push(getMediaUrl(img.image_url || img.image)),
      );
    } else if (prescriptionDetails.image || prescriptionDetails.file) {
      imgs.push(
        getMediaUrl(prescriptionDetails.image || prescriptionDetails.file),
      );
    }
    return imgs;
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

  const removeItem = itemId =>
    setSelectedItems(selectedItems.filter(i => i.id !== itemId));

  const totalValue = selectedItems.reduce(
    (acc, item) => acc + parseFloat(item.price) * item.quantity,
    0,
  );

  const handleProcessOrder = async status => {
    if (status === 'APPROVED' && selectedItems.length === 0) {
      alert('CRITICAL_ERROR: Medicine assignment manifest is empty.');
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
        `SYSTEM_LOG: Prescription RX-${id} has been ${status.toLowerCase()}.`,
      );
      router.push('/pharmacy/prescriptions');
    }
  };

  if (rxLoading || !prescriptionDetails) {
    return (
      <div className="w-full py-40 flex flex-col items-center justify-center bg-[#FAF7F2] gap-4">
        <div className="w-10 h-10 border-4 border-black border-t-transparent animate-spin" />
        <div className="font-mono text-xs font-bold tracking-[0.3em] uppercase text-black">
          Accessing_Prescription_Archive...
        </div>
      </div>
    );
  }

  const labelClass =
    'font-mono text-[10px] font-bold text-[#8A8A78] uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-12 px-4 bg-white border-2 border-black rounded-none text-sm font-mono focus:outline-none uppercase placeholder:text-gray-300 text-black';

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 pb-20 bg-[#FAF7F2]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-black pb-8">
        <div className="flex flex-col gap-4">
          <Link href="/pharmacy/prescriptions">
            <button className="flex items-center gap-2 px-6 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#3A5A40] transition-all cursor-pointer rounded-none border-none">
              <FiChevronLeft /> BACK_TO_DATABASE
            </button>
          </Link>
          <h1 className="text-4xl font-black text-black tracking-tighter uppercase leading-none">
            Verify Rx{' '}
            <span className="font-mono text-2xl opacity-40">
              #RX-{prescriptionDetails.id}
            </span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleProcessOrder('REJECTED')}
            disabled={isUpdating}
            className="h-14 px-8 border-2 border-black bg-white text-black font-bold uppercase text-xs tracking-widest hover:bg-black hover:text-white transition-all cursor-pointer rounded-none disabled:opacity-50"
          >
            <FiX className="inline mr-2" /> REJECT_REQUEST
          </button>
          <button
            onClick={() => handleProcessOrder('APPROVED')}
            disabled={isUpdating}
            className="h-14 px-8 bg-black text-white font-bold uppercase text-xs tracking-widest hover:bg-[#3A5A40] transition-all cursor-pointer rounded-none disabled:opacity-50"
          >
            {isUpdating ? (
              'EXECUTING...'
            ) : (
              <>
                <FiCheck className="inline mr-2" /> VERIFY_&_APPROVE
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Workspace Column */}
        <div className="xl:col-span-8 space-y-10">
          {/* 1. Image Review */}
          <div className="bg-white border-2 border-black p-0">
            <div className="bg-black text-white px-6 py-4 flex items-center gap-3">
              <FiFileText />
              <h3 className="text-sm font-bold uppercase tracking-widest">
                Prescription_Digital_Asset
              </h3>
            </div>
            <div className="p-8">
              {allImages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {allImages.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-[3/4] border-2 border-black group bg-[#F8F9FA]"
                    >
                      <Image
                        src={url}
                        alt="Rx"
                        fill
                        className="object-contain p-2"
                        unoptimized
                      />
                      <a
                        href={url}
                        target="_blank"
                        className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-mono text-[10px] font-bold uppercase tracking-widest transition-all"
                      >
                        Inspect_Resolution
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-gray-300 gap-4 border-2 border-dashed border-black/10">
                  <FiImage size={48} />
                  <p className="font-mono text-xs font-bold uppercase">
                    No_Asset_Found
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 2. Assignment Engine */}
          <div className="bg-white border-2 border-black p-8 space-y-8">
            <div className="space-y-4">
              <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-black">
                Assign_Medicines_From_Catalog
              </h3>
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="SEARCH_BY_NAME..."
                  className={inputClass + ' pl-12 h-14'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery.length > 2 && (
                  <div className="absolute top-full left-0 w-full bg-white border-2 border-black z-50 max-h-64 overflow-y-auto border-t-0">
                    {(products || []).map(p => (
                      <div
                        key={p.id}
                        onClick={() => addItem(p)}
                        className="p-4 border-b border-gray-100 hover:bg-[#F3F4F6] cursor-pointer flex justify-between items-center transition-colors"
                      >
                        <span className="font-bold text-sm uppercase text-black">
                          {p.name}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#3A5A40]">
                          {formatCurrency(p.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto border-t-2 border-black pt-8">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="text-[#8A8A78] uppercase tracking-widest border-b-2 border-black">
                    <th className="py-4 font-bold">Item_Description</th>
                    <th className="py-4 text-center font-bold">Qty</th>
                    <th className="py-4 text-right font-bold">Unit_Rate</th>
                    <th className="py-4 text-right font-bold">Line_Total</th>
                    <th className="py-4 text-right w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/5">
                  {selectedItems.map(item => (
                    <tr key={item.id} className="group hover:bg-[#F8F9FA]">
                      <td className="py-5 font-bold uppercase text-black">
                        {item.name}
                      </td>
                      <td className="py-5 text-center">
                        <input
                          type="number"
                          className="w-16 h-10 text-center border-2 border-black font-bold focus:bg-black focus:text-white outline-none bg-white transition-colors"
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
                      <td className="py-5 text-right text-gray-500">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-5 text-right font-bold text-black">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                      <td className="py-5 text-right">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:scale-110 transition-transform cursor-pointer border-none bg-transparent"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {selectedItems.length > 0 ? (
                    <tr className="bg-black text-white">
                      <td
                        colSpan="3"
                        className="py-6 px-6 font-bold uppercase tracking-widest"
                      >
                        Gross_Manifest_Value
                      </td>
                      <td className="py-6 text-right px-6 font-black text-lg">
                        {formatCurrency(totalValue)}
                      </td>
                      <td></td>
                    </tr>
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-10 text-center text-gray-400 italic uppercase"
                      >
                        No_Items_Assigned
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="xl:col-span-4 space-y-10">
          <div className="bg-white border-2 border-black p-0">
            <div className="bg-black text-white px-6 py-4 flex items-center gap-3">
              <FiUser />
              <h3 className="text-sm font-bold uppercase tracking-widest">
                Customer_Logistics
              </h3>
            </div>
            <div className="p-8 space-y-6 font-mono text-xs">
              <div className="space-y-1">
                <label className={labelClass}>Full_Name</label>
                <p className="font-black text-sm uppercase text-black">
                  {address.name}
                </p>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Contact_Line</label>
                <p className="font-black text-sm text-black">{address.phone}</p>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Requested_Duration</label>
                <p className="font-black text-sm text-black uppercase">
                  {prescriptionDetails.medicine_supply_duration?.replace(
                    '_',
                    ' ',
                  ) || 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Coordinates</label>
                <p className="font-bold leading-relaxed uppercase text-black">
                  {address.full}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-black p-0">
            <div className="bg-black text-white px-6 py-4 flex items-center gap-3">
              <FiActivity />
              <h3 className="text-sm font-bold uppercase tracking-widest">
                Verification_Log
              </h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className={labelClass}>Doctor_Name</label>
                <input
                  className={inputClass}
                  value={doctorInfo.name}
                  onChange={e =>
                    setDoctorInfo({ ...doctorInfo, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Registration_No</label>
                <input
                  className={inputClass}
                  value={doctorInfo.reg}
                  onChange={e =>
                    setDoctorInfo({ ...doctorInfo, reg: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Internal_Notes</label>
                <textarea
                  className={inputClass + ' h-32 py-4 resize-none normal-case'}
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
