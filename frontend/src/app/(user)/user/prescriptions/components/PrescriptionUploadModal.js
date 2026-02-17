'use client';
import React, { useState } from 'react';
import { FiX, FiUploadCloud, FiFile, FiCheckCircle } from 'react-icons/fi';
import UiButton from '@/app/(public)/components/UiButton';
import UiInput from '@/app/(public)/components/UiInput';

export default function PrescriptionUploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
}) {
  const [file, setFile] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = e => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Strict validation for JPG, PNG, and PDF
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload only JPG, PNG, or PDF files.');
      setFile(null);
      e.target.value = ''; // Reset the input
      return;
    }

    // Optional: Check file size (10MB limit as per docs)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size allowed is 10MB.');
      setFile(null);
      e.target.value = '';
      return;
    }

    setError('');
    setFile(selectedFile);
  };

  const handleUpload = async e => {
    e.preventDefault();
    if (!file) {
      setError('Please select a prescription image or PDF.');
      return;
    }

    setIsLoading(true);
    setError('');

    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('file', file);
    if (patientName) formData.append('patient_name_on_rx', patientName);

    try {
      const response = await fetch('http://localhost:8000/api/prescriptions/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed. Please try again.');

      onUploadSuccess();
      onClose();
      // Reset form
      setFile(null);
      setPatientName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Upload Prescription
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleUpload} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 animate-shake">
              {error}
            </div>
          )}

          <UiInput
            label="Patient Name (Optional)"
            placeholder="Name as written on prescription"
            value={patientName}
            onChange={e => setPatientName(e.target.value)}
          />

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-gray-600">
              Prescription File
            </label>
            <div className="relative group">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full py-10 px-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 group-hover:border-primary-500 transition-all">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary-500 shadow-sm">
                  <FiUploadCloud size={24} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-700">
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG or PDF (Max 10MB)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <UiButton type="submit" isLoading={isLoading}>
              START UPLOAD
            </UiButton>
          </div>
        </form>
      </div>
    </div>
  );
}
