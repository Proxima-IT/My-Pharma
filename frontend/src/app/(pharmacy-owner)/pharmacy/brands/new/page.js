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
            Add New Brand
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Create a new manufacturer profile for your products.
          </p>
        </div>

        {/* Form wrapper set to full width */}
        <div className="w-full">
          <BrandForm onSubmit={handleSubmit} isLoading={loading} />
        </div>
      </div>
    </div>
  );
}
