'use client';

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { IoIosArrowDown } from 'react-icons/io';
import { IoReloadOutline } from 'react-icons/io5';
import { TbCurrencyTaka } from 'react-icons/tb';
import { FiFilter, FiChevronDown } from 'react-icons/fi';
import PopularProductCard from '../home/components/PopularProductCard';
import { useProductData } from '../../hooks/useProductData';
import Sidebar from '../../components/Sidebar';

const Products = () => {
  const searchParams = useSearchParams();
  const { loading, products } = useProductData();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // 1. Extract both Category and Search parameters
  const categoryFilter = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  // 2. Combined Filtering Logic
  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter by Category
    if (categoryFilter) {
      result = result.filter(
        product =>
          product.category_name?.toLowerCase() ===
            categoryFilter.toLowerCase() ||
          product.category?.toString() === categoryFilter,
      );
    }

    // Filter by Search Query (Case-insensitive name match)
    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      result = result.filter(
        product =>
          product.name?.toLowerCase().includes(term) ||
          product.category_name?.toLowerCase().includes(term),
      );
    }

    return result;
  }, [products, categoryFilter, searchQuery]);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
      {/* 1. Unified Sidebar Column (Collapsible on Mobile) */}
      <aside
        className="w-full lg:w-[360px] shrink-0 lg:sticky lg:top-36 lg:self-start lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="lg:hidden w-full flex items-center justify-between bg-white border border-gray-100 rounded-full px-6 py-4 mb-4 cursor-pointer transition-all active:scale-95"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-(--color-primary-25) flex items-center justify-center text-(--color-primary-500)">
              <FiFilter size={18} />
            </div>
            <span className="font-bold text-gray-900">
              Filters & Categories
            </span>
          </div>
          <FiChevronDown
            className={`text-gray-400 transition-transform duration-300 ${isMobileFilterOpen ? 'rotate-180' : ''}`}
            size={20}
          />
        </button>

        {/* Collapsible Content Wrapper */}
        <div
          className={`${isMobileFilterOpen ? 'flex' : 'hidden'} lg:flex flex-col gap-6 animate-in fade-in slide-in-from-top-2 duration-300`}
        >
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Product Filter
            </h2>
            <Link
              href="/products"
              className="text-xs font-bold text-(--color-primary-500) hover:underline uppercase tracking-widest"
            >
              Clear All
            </Link>
          </div>

          {/* Price Filter Card */}
          <div className="bg-white rounded-[32px] border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">
                Price Range
              </h3>
              <button className="text-gray-400 hover:text-(--color-primary-500) transition-colors cursor-pointer">
                <IoReloadOutline size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-50 border border-gray-100 rounded-full px-4 py-2.5 flex items-center gap-2">
                <TbCurrencyTaka className="text-gray-400" size={18} />
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full bg-transparent text-sm font-bold outline-none"
                />
              </div>
              <span className="text-gray-300">—</span>
              <div className="flex-1 bg-gray-50 border border-gray-100 rounded-full px-4 py-2.5 flex items-center gap-2">
                <TbCurrencyTaka className="text-gray-400" size={18} />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full bg-transparent text-sm font-bold outline-none"
                />
              </div>
            </div>
          </div>

          {/* Brands Filter Card */}
          <div className="bg-white rounded-[32px] border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">
                Brands
              </h3>
              <button className="text-gray-400 hover:text-(--color-primary-500) transition-colors cursor-pointer">
                <IoReloadOutline size={18} />
              </button>
            </div>

            <div className="space-y-1 max-h-[300px] overflow-y-auto no-scrollbar">
              {[
                'Renata Limited',
                'OSL Pharma',
                'Aristopharma',
                'ACI Limited',
                'Incepta',
              ].map((brand, idx) => (
                <label
                  key={brand}
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-3 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      defaultChecked={idx === 1}
                      className="w-5 h-5 rounded border-gray-300 text-(--color-primary-500) focus:ring-(--color-primary-500) cursor-pointer accent-(--color-primary-500)"
                    />
                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                      {brand}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-300 group-hover:text-gray-400">
                    114
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* GLOBAL CATEGORY SIDEBAR */}
          <Sidebar />
        </div>
      </aside>

      {/* 2. Main Products Grid Section */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 px-2">
          <h1 className="font-bold text-2xl text-gray-900 tracking-tight capitalize">
            {searchQuery ? (
              <>Search results for &quot;{searchQuery}&quot;</>
            ) : (
              <>
                {filteredProducts.length} items found{' '}
                {categoryFilter
                  ? `in ${categoryFilter.replace(/-/g, ' ')}`
                  : ''}
              </>
            )}
          </h1>

          <div className="flex items-center gap-4">
            <p className="text-gray-400 text-sm font-medium">Sort by:</p>
            <button className="bg-white border border-gray-100 rounded-full px-6 py-2.5 text-gray-900 flex gap-3 items-center text-sm font-bold cursor-pointer hover:bg-gray-50 transition-all">
              Newest First
              <IoIosArrowDown className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <PopularProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="w-full py-20 text-center">
            <p className="text-gray-400 font-medium text-lg">
              No products found matching your criteria.
            </p>
            <Link
              href="/products"
              className="text-(--color-primary-500) font-bold mt-2 inline-block hover:underline"
            >
              View all products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
