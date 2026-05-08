'use client';
import React, { useState } from 'react';
import { FiCheck, FiFileText } from 'react-icons/fi';
import { formatDate } from '../../../lib/formatters';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

/**
 * PrescriptionCard Component
 * Updated: Intelligently handles both single-file uploads and multi-image prescription orders.
 */
export default function PrescriptionCard({
  item,
  isSelected,
  onSelect,
  onPreview,
}) {
  // Determine the best preview image from available data sources
  const previewImage =
    item.file ||
    (item.images && item.images.length > 0
      ? item.images[0].image_url || item.images[0].image
      : null) ||
    item.image;

  const isPdf = previewImage?.toLowerCase().endsWith('.pdf');
  const [numPages, setNumPages] = useState(null);

  return (
    <div
      onClick={onSelect}
      className={`relative bg-white rounded-2xl border-[5px] transition-all cursor-pointer ${
        isSelected
          ? 'border-primary-500 ring-0'
          : 'border-white ring-1 ring-gray-100'
      }`}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-10 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center animate-in zoom-in duration-300">
          <FiCheck size={14} strokeWidth={4} />
        </div>
      )}

      {/* Image Container */}
      <div
        className="aspect-[4/3] bg-gray-50 relative overflow-hidden rounded-[11px]"
        onClick={e => {
          e.stopPropagation();
          if (onPreview) onPreview();
        }}
      >
        {previewImage ? (
          isPdf ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 overflow-hidden pointer-events-none">
              <Document
                file={getMediaUrl(previewImage)}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <FiFileText
                      size={40}
                      strokeWidth={1.5}
                      className="animate-pulse"
                    />
                  </div>
                }
              >
                <Page
                  pageNumber={1}
                  width={250}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
              <div className="absolute inset-0 bg-black/5 flex items-end p-2">
                <span className="text-[9px] font-bold uppercase tracking-widest bg-white/90 px-2 py-0.5 rounded shadow-sm text-gray-500">
                  PDF PREVIEW
                </span>
              </div>
            </div>
          ) : (
            <img
              src={getMediaUrl(previewImage)}
              alt="Prescription Preview"
              className="w-full h-full object-cover"
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200 font-bold text-xs uppercase tracking-widest">
            No Preview
          </div>
        )}
      </div>

      {/* Text Section */}
      <div className="p-4 flex flex-col gap-0.5">
        <p className="text-sm font-bold text-gray-900">
          {formatDate(item.created_at)}
        </p>
        <div className="flex justify-between items-center">
          <p className="text-gray-400 font-medium text-[11px]">
            Uploading Date
          </p>
          {item.images?.length > 1 && (
            <span className="text-[10px] font-black text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full">
              +{item.images.length - 1} More
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
