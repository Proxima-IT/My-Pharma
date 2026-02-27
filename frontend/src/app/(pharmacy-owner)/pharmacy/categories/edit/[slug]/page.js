'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import CategoryForm from '../../components/CategoryForm';
import { useCategories } from '../../../../hooks/useCategories';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug;

  const {
    getCategoryDetails,
    getCategoryTree,
    updateCategory,
    categoryTree,
    loading,
  } = useCategories();

  const [category, setCategory] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      try {
        // Fetch both the specific category details and the tree for the dropdown
        const details = await getCategoryDetails(token, slug);
        await getCategoryTree(token);
        setCategory(details);
      } catch (err) {
        console.error('Error fetching category data:', err);
        router.push('/pharmacy/categories');
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchData();
  }, [slug, getCategoryDetails, getCategoryTree, router]);

  const handleSubmit = async formData => {
    const token = localStorage.getItem('access_token');
    try {
      await updateCategory(token, slug, formData);
      router.push('/pharmacy/categories');
    } catch (err) {
      console.error('Failed to update category:', err);
    }
  };

  // Loading State UI
  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-bold tracking-tight">
            Loading Category Data...
          </p>
        </div>
      </div>
    );
  }

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
            Edit Category
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Modify the details for{' '}
            <span className="text-(--color-primary-500)">{category?.name}</span>
            . Changing the parent will move this category and all its sub-items.
          </p>
        </div>

        {/* Form wrapper */}
        <div className="w-full">
          <CategoryForm
            key={category?.id || 'edit-category'}
            initialData={category}
            categoryTree={categoryTree}
            onSubmit={handleSubmit}
            isLoading={loading}
          />
        </div>
      </div>
    </div>
  );
}
