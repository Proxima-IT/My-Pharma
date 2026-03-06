'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import BrandForm from '../edit/[slug]/components/BrandForm';
import { useBrands } from '../../../hooks/useBrands';

export default function NewBrandPage() {
  const router = useRouter();
  const { createBrand, loading } = useBrands();

  const handleSubmit = async formData => {
    const token = localStorage.getItem('access_token');
    try {
      await createBrand(token, formData);
      router.push('/pharmacy/brands');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20 bg-(--color-admin-bg)">
      {/* Header Section */}
      <div className="flex items-center gap-6 border-b-4 border-(--color-admin-border) pb-6">
        <button
          onClick={() => router.back()}
          className="p-2 bg-(--color-admin-navy) text-white hover:bg-(--color-admin-accent) transition-colors rounded-none cursor-pointer border border-(--color-admin-border)"
        >
          <FiArrowLeft size={20} />
        </button>
        <div>
          <span className="font-mono text-xs font-bold text-(--color-admin-primary) uppercase tracking-widest">
            Store Records / Add / New Company
          </span>
          <h1 className="text-4xl font-black text-(--color-admin-navy) tracking-tighter uppercase">
            Add New Company
          </h1>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-(--color-admin-card) border border-(--color-admin-border) p-8 md:p-12 rounded-none">
        <div className="mb-10 border-b border-(--color-admin-border) pb-8">
          <h2 className="font-mono text-sm font-bold text-(--color-admin-navy) uppercase tracking-widest">
            New Company Details
          </h2>
          <p className="text-(--color-text-secondary) mt-2 font-medium text-xs uppercase tracking-wide">
            Add a new medicine company or manufacturer to your shop list.
          </p>
        </div>

        {/* Form wrapper */}
        <div className="w-full">
          <BrandForm onSubmit={handleSubmit} isLoading={loading} />
        </div>
      </div>

      {/* Decorative System Footer */}
      <div className="flex justify-between items-center px-4 font-mono text-[10px] text-(--color-text-secondary) uppercase tracking-[0.3em]">
        <span>Status: Waiting for Information</span>
        <span>System: v1.0.4</span>
      </div>
    </div>
  );
}
