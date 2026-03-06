'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import UserForm from '../components/UserForm';
import { useUserAdmin } from '../../../hooks/useUserAdmin'; // Fixed Path

export default function NewUserPage() {
  const router = useRouter();
  const { createUser, isUpdating, error } = useUserAdmin();

  const handleSubmit = async formData => {
    const success = await createUser(formData);
    if (success) {
      router.push('/admin/users');
    }
  };

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col items-start gap-8">
        {/* Go Back Button */}
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

        {/* Title Group */}
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-[#1B1B1B] tracking-tighter uppercase leading-none">
            Add New Person
          </h1>
          <p className="text-[13px] text-[#6B6B5E] font-medium">
            Enter the details of the person you want to add to the system.
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white border border-gray-100 p-8 md:p-12">
        <div className="mb-10 border-b border-gray-50 pb-6">
          <h2 className="font-mono text-sm font-bold text-[#1B1B1B] uppercase tracking-widest">
            Account Information
          </h2>
        </div>

        <UserForm onSubmit={handleSubmit} isLoading={isUpdating} />

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 font-mono text-[11px] font-bold uppercase text-center">
            Something went wrong: {error}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="font-mono text-[10px] text-[#B7B7A4] uppercase tracking-[0.2em]">
        Status: Ready
      </div>
    </div>
  );
}
