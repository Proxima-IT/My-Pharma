'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  FiFileText,
  FiPlus,
  FiArrowLeft,
  FiEye,
  FiDownload,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiCheck,
} from 'react-icons/fi';
import { usePrescriptions } from '../../hooks/usePrescriptions';
import { formatDate } from '../../lib/formatters';
import UiButton from '@/app/(public)/components/UiButton';
import WhyUploadAccordion from './components/WhyUploadAccordion';
import PrescriptionUploadModal from './components/PrescriptionUploadModal';

export default function MyPrescriptionsPage() {
  const { prescriptions, filter, setFilter, isLoading, error, refresh } =
    usePrescriptions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const filters = ['All', 'Pending', 'Approved', 'Rejected', 'Used'];

  const getStatusStyles = status => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return 'bg-green-50 text-green-600 border-green-100';
      case 'PENDING':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'REJECTED':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'USED':
        return 'bg-gray-100 text-gray-500 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const handleDownload = async (fileUrl, fileName) => {
    setDownloadingId(fileName);
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Prescription-${fileName}.pdf`; // Defaulting to PDF or original extension
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
      alert('Failed to download file. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Mobile Sub-Page Header */}
      <div className="flex items-center gap-4 lg:hidden mb-2">
        <Link href="/user" className="p-2 -ml-2 text-gray-600">
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">My Prescriptions</h1>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-(--gray-900) tracking-tight">
            My Prescriptions
          </h1>
          <p className="text-sm text-(--gray-500) mt-1 font-normal">
            Manage your digital medical records and prescriptions.
          </p>
        </div>

        <div className="w-full md:w-auto">
          <UiButton onClick={() => setIsModalOpen(true)}>
            <div className="flex items-center gap-2">
              <FiPlus strokeWidth={3} />
              <span>UPLOAD NEW</span>
            </div>
          </UiButton>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-[11px] font-bold transition-all whitespace-nowrap border uppercase tracking-wider ${
              filter === f
                ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/20'
                : 'bg-white text-gray-500 border-gray-200 hover:border-primary-500 hover:text-primary-500'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <WhyUploadAccordion />

      {/* Content Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-gray-100">
            <p className="text-sm font-bold text-red-500">{error}</p>
          </div>
        ) : prescriptions.length > 0 ? (
          prescriptions.map(item => (
            <div
              key={item.id}
              className="group bg-white rounded-[32px] border border-gray-100 overflow-hidden transition-all hover:border-primary-200 hover:shadow-sm"
            >
              <div className="aspect-[4/3] bg-gray-50 relative flex items-center justify-center overflow-hidden">
                {item.file ? (
                  <img
                    src={item.file}
                    alt="Prescription"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <FiFileText size={40} className="text-gray-200" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button className="p-3 bg-white rounded-full text-primary-500 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <FiEye size={18} />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm truncate">
                      Rx #{item.id.toString().slice(-5)}
                    </h3>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${getStatusStyles(item.status)}`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <button
                    onClick={() => handleDownload(item.file, item.id)}
                    disabled={downloadingId === item.id}
                    className="text-[10px] font-bold text-gray-400 hover:text-primary-500 flex items-center gap-1.5 transition-colors uppercase tracking-[0.15em] disabled:opacity-50"
                  >
                    <FiDownload />{' '}
                    {downloadingId === item.id ? 'Downloading...' : 'Download'}
                  </button>
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                    {item.patient_name_on_rx || 'Patient Rx'}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-[40px] py-24 flex flex-col items-center text-center px-6 border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6">
              <FiFileText size={36} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              No prescriptions found
            </h3>
            <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto font-normal leading-relaxed">
              Try changing your filter or upload a new prescription.
            </p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <PrescriptionUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={refresh}
      />
    </div>
  );
}
