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
import { API_BASE_URL, getMediaUrl } from '@/app/(shared)/lib/apiConfig';
import { Document, Page as PdfPage, pdfjs } from 'react-pdf';
import { searchProducts } from '@/app/(public)/lib/productSearchEngine';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
    updatePrescription,
  } = usePrescriptionAdmin();
  const { products, fetchProducts } = useProductAdmin();

  // Local States
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [pendingQty, setPendingQty] = useState({});
  const [adminNotes, setAdminNotes] = useState('');
  const [doctorInfo, setDoctorInfo] = useState({ name: '', reg: '' });
  const [hasSignature, setHasSignature] = useState(false);
  const [patientName, setPatientName] = useState('');

  useEffect(() => {
    if (id) fetchPrescriptionDetails(id);
  }, [id, fetchPrescriptionDetails]);

  // Automatic seen synchronization for the current detail context.
  // Triggers a silent patch to mark the prescription as read upon arrival (mirrors orders/[id]/page.js).
  useEffect(() => {
    if (prescriptionDetails && !prescriptionDetails.is_seen && !isUpdating) {
      updatePrescription(id, { is_seen: true });
    }
  }, [prescriptionDetails, id, updatePrescription, isUpdating]);

  // Pre-populate form with existing data when viewing an already-verified prescription
  useEffect(() => {
    if (!prescriptionDetails) return;
    if (prescriptionDetails.doctor_name)
      setDoctorInfo(prev => ({
        ...prev,
        name: prescriptionDetails.doctor_name,
      }));
    if (prescriptionDetails.doctor_reg_number)
      setDoctorInfo(prev => ({
        ...prev,
        reg: prescriptionDetails.doctor_reg_number,
      }));
    if (prescriptionDetails.has_signature) setHasSignature(true);
    if (prescriptionDetails.patient_name_on_rx)
      setPatientName(prescriptionDetails.patient_name_on_rx);
    if (prescriptionDetails.notes) setAdminNotes(prescriptionDetails.notes);
    if (prescriptionDetails.items?.length > 0) {
      const items = prescriptionDetails.items.map(item => ({
        id: item.product,
        name: item.product_name,
        price: 0,
        quantity: item.quantity_prescribed,
      }));
      setSelectedItems(items);

      // Fetch product prices to enrich items
      const enrichPrices = async () => {
        try {
          const token = localStorage.getItem('access_token');
          const ids = items.map(i => i.id);
          const res = await fetch(
            `${API_BASE_URL}/products/?page_size=100&is_active=true`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (res.ok) {
            const data = await res.json();
            const productList = data.results || data || [];
            setSelectedItems(prev =>
              prev.map(item => {
                const match = productList.find(p => p.id === item.id);
                return match
                  ? { ...item, price: parseFloat(match.price) }
                  : item;
              }),
            );
          }
        } catch (err) {
          console.error('Failed to enrich product prices:', err);
        }
      };
      enrichPrices();
    }
  }, [prescriptionDetails]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      if (allProducts.length === 0) {
        const fetchAll = async () => {
          try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(
              `${API_BASE_URL}/products/?page_size=2000&is_active=true`,
              { headers: { Authorization: `Bearer ${token}` } },
            );
            const data = await res.json();
            const items = data.results || data || [];
            setAllProducts(items);
            setSearchResults(searchProducts(items, searchQuery, { limit: 15 }));
          } catch (err) {
            console.error('Failed to pre-fetch all products:', err);
          }
        };
        fetchAll();
      } else {
        setSearchResults(
          searchProducts(allProducts, searchQuery, { limit: 15 }),
        );
      }
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, allProducts]);

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

  const addItem = (product, qty) => {
    const quantity = Math.max(1, qty || pendingQty[product.id] || 1);
    const exists = selectedItems.find(item => item.id === product.id);
    if (exists) {
      setSelectedItems(
        selectedItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
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
          quantity,
        },
      ]);
    }
    setPendingQty(prev => ({ ...prev, [product.id]: 1 }));
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
      has_signature: hasSignature,
      patient_name_on_rx: patientName,
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
        FETCHING PRESCRIPTION CORE DATA...
      </div>
    );
  }

  const labelClass =
    'font-mono text-[10px] font-bold text-[#8A8A78] uppercase mb-2 block tracking-widest';
  const inputClass =
    'w-full h-11 px-4 bg-white border border-gray-100 rounded-none text-sm font-mono focus:outline-none focus:border-[#3A5A40] transition-all uppercase placeholder:text-gray-200 text-[#1B1B1B]';

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Status Banner */}
      {prescriptionDetails.status !== 'PENDING' && (
        <div
          className={`w-full p-6 flex items-center gap-4 ${
            prescriptionDetails.status === 'APPROVED' ||
            prescriptionDetails.status === 'USED'
              ? 'bg-green-50 border border-green-100'
              : prescriptionDetails.status === 'REJECTED'
                ? 'bg-red-50 border border-red-100'
                : 'bg-gray-50 border border-gray-100'
          }`}
        >
          <div
            className={`w-10 h-10 flex items-center justify-center ${
              prescriptionDetails.status === 'APPROVED' ||
              prescriptionDetails.status === 'USED'
                ? 'text-green-600'
                : prescriptionDetails.status === 'REJECTED'
                  ? 'text-red-600'
                  : 'text-gray-600'
            }`}
          >
            {prescriptionDetails.status === 'REJECTED' ? (
              <FiX size={24} strokeWidth={3} />
            ) : (
              <FiCheck size={24} strokeWidth={3} />
            )}
          </div>
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest">
              This prescription has been {prescriptionDetails.status}
            </p>
            {prescriptionDetails.verified_at && (
              <p className="font-mono text-[10px] text-[#8A8A78] mt-1">
                Verified on {formatDate(prescriptionDetails.verified_at)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-8">
        <div className="space-y-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[#8A8A78] hover:text-[#1B1B1B] transition-colors cursor-pointer"
          >
            <FiArrowLeft /> Return To Logistics
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
        {prescriptionDetails.status === 'PENDING' && (
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
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Main Column */}
        <div className="xl:col-span-8 space-y-10">
          {/* 0. Prescription Metadata */}
          <div className="bg-white border border-gray-100 p-8 space-y-6">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 text-[#1B1B1B]">
              <FiFileText className="text-[#3A5A40]" /> Prescription Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label className={labelClass}>Status</label>
                <span
                  className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                    prescriptionDetails.status === 'PENDING'
                      ? 'bg-amber-50 text-amber-600'
                      : prescriptionDetails.status === 'APPROVED'
                        ? 'bg-green-50 text-green-600'
                        : prescriptionDetails.status === 'REJECTED'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  {prescriptionDetails.status}
                </span>
              </div>
              <div>
                <label className={labelClass}>User Email</label>
                <p className="font-mono font-bold text-xs text-[#1B1B1B] break-all">
                  {prescriptionDetails.user_email || 'N/A'}
                </p>
              </div>
              <div>
                <label className={labelClass}>Supply Duration</label>
                <p className="font-bold text-xs uppercase text-[#1B1B1B]">
                  {prescriptionDetails.medicine_supply_duration?.replace(
                    '_',
                    ' ',
                  ) || 'N/A'}
                </p>
              </div>
              <div>
                <label className={labelClass}>Issue Date</label>
                <p className="font-mono font-bold text-xs text-[#1B1B1B]">
                  {prescriptionDetails.issue_date || 'N/A'}
                </p>
              </div>
            </div>
            {prescriptionDetails.patient_name_on_rx && (
              <div>
                <label className={labelClass}>Patient Name on Rx</label>
                <p className="font-bold text-xs uppercase text-[#1B1B1B]">
                  {prescriptionDetails.patient_name_on_rx}
                </p>
              </div>
            )}
            {prescriptionDetails.prescription_note && (
              <div className="p-5 bg-gray-50 border border-gray-100">
                <label className={labelClass}>Prescription Note</label>
                <p className="text-sm text-[#1B1B1B] font-medium leading-relaxed">
                  {prescriptionDetails.prescription_note}
                </p>
              </div>
            )}
            {prescriptionDetails.additional_products_note && (
              <div className="p-5 bg-gray-50 border border-gray-100">
                <label className={labelClass}>Additional Products Note</label>
                <p className="text-sm text-[#1B1B1B] font-medium leading-relaxed">
                  {prescriptionDetails.additional_products_note}
                </p>
              </div>
            )}
          </div>

          {/* 1. Image Viewer Container */}
          <div className="bg-white border border-gray-100 p-8 space-y-6">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 text-[#1B1B1B]">
              <FiFileText className="text-[#3A5A40]" /> Digital Asset Review
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Primary file/image */}
              {(prescriptionDetails.file || prescriptionDetails.image) &&
                (() => {
                  const src =
                    prescriptionDetails.file || prescriptionDetails.image;
                  const isPdf = src?.toLowerCase().endsWith('.pdf');
                  return (
                    <div className="relative aspect-[3/4] border border-gray-50 overflow-hidden group bg-gray-50">
                      {isPdf ? (
                        <div className="w-full h-full flex items-center justify-center overflow-hidden pointer-events-none">
                          <Document
                            file={getMediaUrl(src)}
                            loading={
                              <FiFileText
                                size={40}
                                className="text-gray-300 animate-pulse"
                              />
                            }
                          >
                            <PdfPage
                              pageNumber={1}
                              width={250}
                              renderTextLayer={false}
                              renderAnnotationLayer={false}
                            />
                          </Document>
                        </div>
                      ) : (
                        <Image
                          src={getMediaUrl(src)}
                          alt="Prescription"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      )}
                      <a
                        href={getMediaUrl(src)}
                        target="_blank"
                        className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[#1B1B1B] font-mono text-[10px] font-bold uppercase tracking-widest transition-all z-10"
                      >
                        Open Full Resolution
                      </a>
                    </div>
                  );
                })()}

              {/* Additional images */}
              {prescriptionDetails.images?.map(img => {
                const srcUrl = img.image_url || img.image;
                const isPdf = srcUrl?.toLowerCase().endsWith('.pdf');
                return (
                  <div
                    key={img.id}
                    className="relative aspect-[3/4] border border-gray-50 overflow-hidden group bg-gray-50"
                  >
                    {isPdf ? (
                      <div className="w-full h-full flex items-center justify-center overflow-hidden pointer-events-none">
                        <Document
                          file={getMediaUrl(srcUrl)}
                          loading={
                            <FiFileText
                              size={40}
                              className="text-gray-300 animate-pulse"
                            />
                          }
                        >
                          <PdfPage
                            pageNumber={1}
                            width={250}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                          />
                        </Document>
                      </div>
                    ) : (
                      <Image
                        src={getMediaUrl(srcUrl)}
                        alt="Prescription"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    )}
                    <a
                      href={getMediaUrl(srcUrl)}
                      target="_blank"
                      className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[#1B1B1B] font-mono text-[10px] font-bold uppercase tracking-widest transition-all z-10"
                    >
                      Open Full Resolution
                    </a>
                  </div>
                );
              })}
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
                  placeholder="SEARCH CATALOG BY NAME..."
                  className={inputClass + ' pl-12 h-14'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery.length >= 2 && (
                  <div className="absolute top-full left-0 w-full bg-white border border-gray-100 z-50 max-h-80 overflow-y-auto border-t-0">
                    {searchResults.length > 0 ? (
                      searchResults.map(p => (
                        <div
                          key={p.id}
                          className="p-4 border-b border-gray-50 hover:bg-gray-50 flex items-center justify-between gap-4 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-xs uppercase text-[#1B1B1B] block truncate">
                              {p.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold text-[#3A5A40]">
                                {formatCurrency(p.price)}
                              </span>
                              {p.ingredient_name && (
                                <span className="text-[9px] text-gray-400 font-mono uppercase truncate">
                                  • {p.ingredient_name}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <input
                              type="number"
                              min="1"
                              className="w-14 h-9 text-center border border-gray-200 font-mono text-xs focus:border-[#3A5A40] outline-none"
                              value={pendingQty[p.id] || 1}
                              onClick={e => e.stopPropagation()}
                              onChange={e => {
                                const val = parseInt(e.target.value) || 1;
                                setPendingQty(prev => ({
                                  ...prev,
                                  [p.id]: val,
                                }));
                              }}
                            />
                            <button
                              onClick={() => addItem(p)}
                              className="h-9 px-4 bg-[#1B1B1B] text-white font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-[#3A5A40] transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <FiPlus size={12} strokeWidth={3} /> Add
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center font-mono text-[10px] text-gray-400 uppercase">
                        No products found in catalog
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Selection Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[#8A8A78] font-mono text-[10px] uppercase tracking-widest border-b border-gray-100">
                    <th className="py-4 font-bold">Medicine Identifier</th>
                    <th className="py-4 text-center font-bold">Qty</th>
                    <th className="py-4 text-right font-bold">Unit Price</th>
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
                        Total Order Value
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
                <label className={labelClass}>Customer Name</label>
                <p className="font-bold uppercase text-xs text-[#1B1B1B]">
                  {address.name}
                </p>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Contact Number</label>
                <p className="font-mono font-bold text-xs text-[#1B1B1B]">
                  {address.phone}
                </p>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Delivery Destination</label>
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
                <label className={labelClass}>Doctor Credential Name</label>
                <input
                  className={inputClass}
                  value={doctorInfo.name}
                  onChange={e =>
                    setDoctorInfo({ ...doctorInfo, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Registration Identifier</label>
                <input
                  className={inputClass}
                  value={doctorInfo.reg}
                  onChange={e =>
                    setDoctorInfo({ ...doctorInfo, reg: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Patient Name on Rx</label>
                <input
                  className={inputClass}
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  placeholder="AS ON PRESCRIPTION"
                />
              </div>
              <div className="flex items-center gap-3 py-2">
                <button
                  type="button"
                  onClick={() => setHasSignature(!hasSignature)}
                  className={`w-10 h-10 border flex items-center justify-center transition-all cursor-pointer ${
                    hasSignature
                      ? 'bg-[#3A5A40] border-[#3A5A40] text-white'
                      : 'bg-white border-gray-200 text-transparent'
                  }`}
                >
                  <FiCheck size={16} strokeWidth={3} />
                </button>
                <label className="font-mono text-[10px] font-bold text-[#8A8A78] uppercase tracking-widest">
                  Doctor Signature Present
                </label>
              </div>
              <div>
                <label className={labelClass}>Internal Audit Notes</label>
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
