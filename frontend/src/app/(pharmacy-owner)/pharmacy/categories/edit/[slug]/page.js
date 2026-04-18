'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import CategoryForm from '../../components/CategoryForm';
import { useCategories } from '../../../../hooks/useCategories';

/**
 * EditCategoryPage
 * Pharmacy Owner Zone: Handles updating existing categories including image data.
 * Design: Strictly rounded-none, high contrast industrial feel.
 */
export default function EditCategoryPage() {
  const router = useRouter();
  const { slug } = useParams();
  const {
    getCategoryDetails,
    getCategoryTree,
    updateCategory,
    categoryTree,
    loading,
  } = useCategories();

  const [category, setCategory] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Load existing category data and hierarchy for the dropdown
  useEffect(() => {
    if (!slug) return;
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      try {
        const details = await getCategoryDetails(token, slug);
        await getCategoryTree(token);
        setCategory(details);
      } catch (err) {
        console.error('Failed to load category details', err);
        router.push('/pharmacy/categories');
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchData();
  }, [slug, getCategoryDetails, getCategoryTree, router]);

  /**
   * Handles form submission.
   * @param {FormData} formData - Multipart data containing name, parent, is_active, and image.
   */
  const handleSubmit = async formData => {
    const token = localStorage.getItem('access_token');
    try {
      // updateCategory must handle FormData for image uploads
      const success = await updateCategory(token, slug, formData);
      if (success) {
        router.push('/pharmacy/categories');
      }
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center py-40 bg-[#FAF7F2]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#8A8A78] border-t-transparent animate-spin rounded-none" />
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-[#1B1B1B]">
            Syncing_Data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20 bg-[#FAF7F2]">
      {/* Page Header */}
      <div className="flex items-center gap-6 border-b-4 border-[#DAD7CD] pb-6">
        <button
          onClick={() => router.back()}
          className="p-3 bg-[#3A5A40] text-white hover:bg-black transition-colors border border-[#DAD7CD] cursor-pointer rounded-none"
        >
          <FiArrowLeft size={20} />
        </button>
        <div>
          <span className="font-mono text-[10px] font-bold text-[#8A8A78] uppercase tracking-[0.2em]">
            Registry / Update / Category
          </span>
          <h1 className="text-4xl font-black text-[#1B1B1B] tracking-tighter uppercase leading-none">
            Edit Category Details
          </h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-[#DAD7CD] p-8 md:p-12 rounded-none shadow-none">
        <div className="mb-10 border-b border-[#DAD7CD] pb-8">
          <h2 className="font-mono text-sm font-bold text-[#1B1B1B] uppercase tracking-widest">
            Configuration Panel
          </h2>
          <p className="text-[#6B6B5E] mt-3 font-medium text-xs uppercase tracking-wider">
            Modifying Object:{' '}
            <span className="text-[#3A5A40] font-black underline decoration-2 underline-offset-4">
              {category?.name}
            </span>
          </p>
        </div>

        {/* 
          CategoryForm now includes the Image Upload section. 
          The key prop ensures the component re-mounts once data is fetched.
        */}
        <CategoryForm
          key={category?.id || 'edit-category'}
          initialData={category}
          categoryTree={categoryTree}
          onSubmit={handleSubmit}
          isLoading={loading}
        />
      </div>

      {/* Internal System Meta */}
      <div className="font-mono text-[9px] text-[#B7B7A4] uppercase tracking-widest">
        Registry_ID: #{category?.id} | Slug: {slug}
      </div>
    </div>
  );
}
