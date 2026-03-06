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
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20 bg-(--color-admin-bg)">
      <div className="flex items-center gap-6 border-b-4 border-(--color-admin-border) pb-6">
        <button
          onClick={() => router.back()}
          className="p-2 bg-(--color-admin-navy) text-white hover:bg-(--color-admin-accent) transition-colors border border-(--color-admin-border) cursor-pointer"
        >
          <FiArrowLeft size={20} />
        </button>
        <div>
          <span className="font-mono text-xs font-bold text-(--color-admin-primary) uppercase tracking-widest">
            Store Records / Add / New Group
          </span>
          <h1 className="text-4xl font-black text-(--color-admin-navy) tracking-tighter uppercase">
            Add New Group
          </h1>
        </div>
      </div>

      <div className="bg-(--color-admin-card) border border-(--color-admin-border) p-8 md:p-12">
        <div className="mb-10 border-b border-(--color-admin-border) pb-8">
          <h2 className="font-mono text-sm font-bold text-(--color-admin-navy) uppercase tracking-widest">
            Group Details
          </h2>
          <p className="text-(--color-text-secondary) mt-2 font-medium text-xs uppercase tracking-wide">
            Create a new way to group your medicines (e.g. Injections, Creams).
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
