'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { FiPlus, FiX, FiLoader, FiCamera, FiFileText } from 'react-icons/fi';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Upload = ({
  prescriptionId,
  isFetching,
  libraryPreviews,
  previews,
  setPreviews,
  images,
  setImages,
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = e => {
    const files = Array.from(e.target.files);
    if (files.length + images.length + libraryPreviews.length > 5) {
      alert('Max 5 images allowed in total');
      return;
    }
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
    setImages(prev => [...prev, ...files]);
  };

  const removeLocalImage = index => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-gray-100 h-full min-h-[500px]">
      <h2 className="text-xl font-bold text-gray-900 mb-8">
        {prescriptionId ? 'Prescription Assets' : 'Upload Prescription'}
      </h2>

      {isFetching ? (
        <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-3">
          <FiLoader className="animate-spin" size={32} />
          <p className="text-sm font-bold uppercase tracking-widest">
            Accessing Library...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* 1. Show Library Images (Locked) */}
          {libraryPreviews.map((src, idx) => {
            const isPdf = src?.toLowerCase().endsWith('.pdf');
            return (
              <div
                key={`lib-${idx}`}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-blue-100 group bg-gray-50"
              >
                {isPdf ? (
                  <div className="w-full h-full flex items-center justify-center overflow-hidden pointer-events-none">
                    <Document
                      file={src}
                      loading={
                        <FiFileText
                          size={40}
                          className="text-gray-300 animate-pulse"
                        />
                      }
                    >
                      <Page
                        pageNumber={1}
                        width={250}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </Document>
                  </div>
                ) : (
                  <Image
                    src={src}
                    alt="Library Rx"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}
                <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-[9px] font-black uppercase rounded-md shadow-sm z-20">
                  Library
                </div>
              </div>
            );
          })}

          {/* 2. Show Newly Uploaded Images */}
          {previews.map((src, idx) => {
            const file = images[idx];
            const isPdf =
              file &&
              (file.type === 'application/pdf' ||
                file.name?.toLowerCase().endsWith('.pdf'));
            return (
              <div
                key={`local-${idx}`}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-100 group bg-gray-50"
              >
                {isPdf ? (
                  <div className="w-full h-full flex items-center justify-center overflow-hidden pointer-events-none">
                    <Document
                      file={src}
                      loading={
                        <FiFileText
                          size={40}
                          className="text-gray-300 animate-pulse"
                        />
                      }
                    >
                      <Page
                        pageNumber={1}
                        width={250}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </Document>
                  </div>
                ) : (
                  <Image src={src} alt="New Rx" fill className="object-cover" />
                )}
                <button
                  onClick={() => removeLocalImage(idx)}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20"
                >
                  <FiX />
                </button>
              </div>
            );
          })}

          {/* 3. Add More Box */}
          {libraryPreviews.length + images.length < 5 && (
            <div
              onClick={() => fileInputRef.current.click()}
              className="aspect-[4/3] border-2 border-dashed border-[#10B981]/30 bg-[#F0FDF4]/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#F0FDF4] transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-[#10B981] flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
                <FiPlus size={24} strokeWidth={3} />
              </div>
              <p className="text-[15px] font-bold text-[#10B981]">Add More</p>
              <p className="text-[12px] text-gray-400">Up to 5 total</p>
            </div>
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept="image/*,.pdf"
        onChange={handleFileChange}
      />

      <div className="mt-10 p-6 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
        <FiFileText className="text-gray-400" size={24} />
        <p className="text-sm text-gray-500 font-medium">
          {prescriptionId
            ? 'You can add more photos to this order if needed.'
            : 'Please upload clear photos of your prescription for accurate medicine verification.'}
        </p>
      </div>
    </div>
  );
};

export default Upload;