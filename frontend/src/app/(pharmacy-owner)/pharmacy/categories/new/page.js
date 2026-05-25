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
      console.error(err);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20 bg-[#FAF7F2]">
      <div className="flex items-center gap-6 border-b-4 border-[#DAD7CD] pb-6">
        <button
          onClick={() => router.back()}
          className="p-2 bg-[#3A5A40] text-white hover:bg-[#588157] transition-colors border border-[#DAD7CD] cursor-pointer"
        >
          <FiArrowLeft size={20} />
        </button>
        <div>
          <span className="font-mono text-xs font-bold text-[#8A8A78] uppercase tracking-widest">
            Store Records / Add / New Category
          </span>
          <h1 className="text-4xl font-black text-[#1B1B1B] tracking-tighter uppercase">
            Add New Category
          </h1>
        </div>
      </div>

      <div className="bg-white border border-[#DAD7CD] p-8 md:p-12">
        <div className="mb-10 border-b border-[#DAD7CD] pb-8">
          <h2 className="font-mono text-sm font-bold text-[#1B1B1B] uppercase tracking-widest">
            Category Details
          </h2>
          <p className="text-[#6B6B5E] mt-2 font-medium text-xs uppercase tracking-wide">
            Create a new classification for your medicines (e.g. Injections,
            Creams).
          </p>
        </div>
        <CategoryForm
          onSubmit={handleSubmit}
          isLoading={loading}
          categoryTree={categoryTree}
        />
      </div>
    </div>
  );
}
