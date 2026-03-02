'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import CategoryForm from '../components/CategoryForm';
import { useCategories } from '../../../hooks/useCategories';

export default function NewCategoryPage() {
  const router = useRouter();
  const { createCategory, getCategoryTree, categoryTree, loading } =
    useCategories();

  // Fetch the category tree on mount to populate the parent selection dropdown
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    getCategoryTree(token);
  }, [getCategoryTree]);

  const handleSubmit = async formData => {
    const token = localStorage.getItem('access_token');
    try {
      await createCategory(token, formData);
      router.push('/pharmacy/categories');
    } catch (err) {
      console.error('Failed to create category:', err);
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
            Add New Category
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Create a new classification for your products. You can nest this
            under an existing category to build a hierarchy.
          </p>
        </div>

        {/* Form wrapper set to full width */}
        <div className="w-full">
          <CategoryForm
            onSubmit={handleSubmit}
            isLoading={loading}
            categoryTree={categoryTree}
          />
        </div>
      </div>
    </div>
  );
}
