'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import CategoryForm from '../../components/CategoryForm';
import { useCategories } from '../../../../hooks/useCategories';

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

  useEffect(() => {
    if (!slug) return;
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      try {
        const details = await getCategoryDetails(token, slug);
        await getCategoryTree(token);
        setCategory(details);
      } catch (err) {
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
      console.error(err);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center py-40 bg-(--color-admin-bg)">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-(--color-admin-primary) border-t-transparent animate-spin" />
          <p className="font-mono text-xs font-bold uppercase tracking-widest">
            Loading_Data...
          </p>
        </div>
      </div>
    );
  }

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
            Store Records / Edit / Group
          </span>
          <h1 className="text-4xl font-black text-(--color-admin-navy) tracking-tighter uppercase">
            Edit Group Details
          </h1>
        </div>
      </div>

      <div className="bg-(--color-admin-card) border border-(--color-admin-border) p-8 md:p-12">
        <div className="mb-10 border-b border-(--color-admin-border) pb-8">
          <h2 className="font-mono text-sm font-bold text-(--color-admin-navy) uppercase tracking-widest">
            Group Settings
          </h2>
          <p className="text-(--color-text-secondary) mt-2 font-medium text-xs uppercase tracking-wide">
            Changing details for:{' '}
            <span className="text-(--color-admin-primary) font-black underline">
              {category?.name}
            </span>
          </p>
        </div>
        <CategoryForm
          key={category?.id || 'edit'}
          initialData={category}
          categoryTree={categoryTree}
          onSubmit={handleSubmit}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
