'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import BrandForm from './components/BrandForm';
import { useBrands } from '../../../../hooks/useBrands';

export default function EditBrandPage() {
  const router = useRouter();
  const { slug } = useParams();
  const { getBrandDetails, updateBrand, loading } = useBrands();
  const [brand, setBrand] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    getBrandDetails(token, slug)
      .then(setBrand)
      .catch(() => router.push('/pharmacy/brands'));
  }, [slug, getBrandDetails, router]);

  const handleSubmit = async formData => {
    const token = localStorage.getItem('access_token');
    try {
      await updateBrand(token, slug, formData);
      router.push('/pharmacy/brands');
    } catch (err) {
      console.error(err);
    }
  };

  if (!brand && loading)
    return (
      <div className="flex items-center justify-center py-40 bg-(--color-admin-bg)">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-(--color-admin-primary) border-t-transparent rounded-none animate-spin" />
          <p className="font-mono text-xs font-bold text-(--color-admin-navy) uppercase tracking-widest">
            Loading_Data...
          </p>
        </div>
      </div>
    );

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
            Store Records / Edit / Brand
          </span>
          <h1 className="text-4xl font-black text-(--color-admin-navy) tracking-tighter uppercase">
            Edit Brand Details
          </h1>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="bg-(--color-admin-card) border border-(--color-admin-border) p-8 md:p-12 rounded-none">
        <div className="mb-10 border-b border-(--color-admin-border) pb-8">
          <h2 className="font-mono text-sm font-bold text-(--color-admin-navy) uppercase tracking-widest">
            Brand Settings
          </h2>
          <p className="text-(--color-text-secondary) mt-2 font-medium text-xs uppercase tracking-wide">
            Changing information for:{' '}
            <span className="text-(--color-admin-primary) font-black underline decoration-2">
              {brand?.name}
            </span>
          </p>
        </div>

        {/* Form wrapper */}
        <div className="w-full">
          <BrandForm
            key={brand?.id || 'edit'}
            initialData={brand}
            onSubmit={handleSubmit}
            isLoading={loading}
          />
        </div>
      </div>

      {/* Simplified System Footer */}
      <div className="flex justify-between items-center px-4 font-mono text-[10px] text-(--color-text-secondary) uppercase tracking-[0.2em]">
        <span>System: Operational</span>
        <span>ID: {brand?.id || '000'}</span>
      </div>
    </div>
  );
}
