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
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-bold tracking-tight">
            Loading Brand Data...
          </p>
        </div>
      </div>
    );

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 font-bold text-sm hover:text-gray-900 transition-colors group cursor-pointer"
        >
          <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />{' '}
          BACK TO LIST
        </button>
      </div>

      {/* Full Width Card Container */}
      <div className="bg-white rounded-[40px] border border-gray-100 p-8 md:p-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Edit Brand
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Update the details and visibility for{' '}
            <span className="text-(--color-primary-500)">{brand?.name}</span>.
          </p>
        </div>

        {/* Removed max-w-3xl to allow form to fill the card */}
        <div className="w-full">
          <BrandForm
            key={brand?.id || 'edit'}
            initialData={brand}
            onSubmit={handleSubmit}
            isLoading={loading}
          />
        </div>
      </div>
    </div>
  );
}
