'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const { loading, products } = useProductData();

  // States for filters
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // 1. Extract URL parameters
  const categoryFilter = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  // 2. Fetch Brands from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch(
          'http://localhost:8000/api/brands/?is_active=true',
        );
        const data = await response.json();
        setBrands(data.results || data);
      } catch (err) {
        console.error('Failed to fetch brands:', err);
      }
    };
    fetchBrands();
  }, []);

  // 3. Combined Filtering Logic
  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter by Category
    if (categoryFilter) {
      result = result.filter(
        product =>
          product.category_name?.toLowerCase() ===
            categoryFilter.toLowerCase() ||
          product.category?.toString() === categoryFilter ||
          product.category_slug === categoryFilter,
      );
    }

    // Filter by Search Query
    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      result = result.filter(
        product =>
          product.name?.toLowerCase().includes(term) ||
          product.ingredient_name?.toLowerCase().includes(term),
      );
    }

    // Filter by Price Range
    if (minPrice) {
      result = result.filter(p => parseFloat(p.price) >= parseFloat(minPrice));
    }
    if (maxPrice) {
      result = result.filter(p => parseFloat(p.price) <= parseFloat(maxPrice));
    }

    // Filter by Selected Brands
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand_name));
    }

    return result;
  }, [
    products,
    categoryFilter,
    searchQuery,
    minPrice,
    maxPrice,
    selectedBrands,
  ]);

  const toggleBrand = brandName => {
    setSelectedBrands(prev =>
      prev.includes(brandName)
        ? prev.filter(b => b !== brandName)
        : [...prev, brandName],
    );
  };

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setMinPrice('');
    setMaxPrice('');
    router.push('/products');
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
      {/* 1. Sidebar Column with Custom Thin Scrollbar */}
      <aside
        className={`
          w-full lg:w-[360px] shrink-0 lg:sticky lg:top-36 lg:self-start lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto 
          pr-2 lg:pr-4
          /* Firefox thin scrollbar */
          [scrollbar-width:thin] [scrollbar-color:var(--color-gray-200)_transparent]
          /* Chrome/Safari/Edge thin scrollbar */
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-gray-200
          [&::-webkit-scrollbar-thumb]:rounded-full
          hover:[&::-webkit-scrollbar-thumb]:bg-gray-300
        `}
      >
        {/* Mobile Filter Toggle */}
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

        <div
          className={`${isMobileFilterOpen ? 'flex' : 'hidden'} lg:flex flex-col gap-6 animate-in fade-in slide-in-from-top-2 duration-300`}
        >
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Product Filter
            </h2>
            <button
              onClick={clearAllFilters}
              className="text-xs font-bold text-(--color-primary-500) hover:underline uppercase tracking-widest cursor-pointer"
            >
              Clear All
            </button>
          </div>

          {/* Price Filter Card */}
          <div className="bg-white rounded-[32px] border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">
                Price Range
              </h3>
              <button
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="text-gray-400 hover:text-(--color-primary-500) transition-colors cursor-pointer"
              >
                <IoReloadOutline size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-50 border border-gray-100 rounded-full px-4 py-2.5 flex items-center gap-2">
                <TbCurrencyTaka className="text-gray-400" size={18} />
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold outline-none"
                />
              </div>
              <span className="text-gray-300">—</span>
              <div className="flex-1 bg-gray-50 border border-gray-100 rounded-full px-4 py-2.5 flex items-center gap-2">
                <TbCurrencyTaka className="text-gray-400" size={18} />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
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
              <button
                onClick={() => setSelectedBrands([])}
                className="text-gray-400 hover:text-(--color-primary-500) transition-colors cursor-pointer"
              >
                <IoReloadOutline size={18} />
              </button>
            </div>

            <div
              className="space-y-1 max-h-[300px] overflow-y-auto 
              [scrollbar-width:thin] [scrollbar-color:var(--color-gray-100)_transparent]
              [&::-webkit-scrollbar]:w-1
              [&::-webkit-scrollbar-thumb]:bg-gray-100
              [&::-webkit-scrollbar-thumb]:rounded-full
            "
            >
              {brands.map(brand => (
                <label
                  key={brand.id}
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-3 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand.name)}
                      onChange={() => toggleBrand(brand.name)}
                      className="w-5 h-5 rounded border-gray-300 text-(--color-primary-500) focus:ring-(--color-primary-500) cursor-pointer accent-(--color-primary-500)"
                    />
                    <span
                      className={`text-sm font-medium transition-colors ${selectedBrands.includes(brand.name) ? 'text-gray-900 font-bold' : 'text-gray-600 group-hover:text-gray-900'}`}
                    >
                      {brand.name}
                    </span>
                  </div>
                </label>
              ))}
              {brands.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">
                  No brands available
                </p>
              )}
            </div>
          </div>

          <Sidebar />
        </div>
      </aside>

      {/* 2. Main Products Grid */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 px-2">
          <h1 className="font-bold text-2xl text-gray-900 tracking-tight">
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <PopularProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="w-full py-20 text-center bg-white rounded-[40px] border border-gray-100">
            <p className="text-gray-400 font-medium text-lg">
              No products found matching your criteria.
            </p>
            <button
              onClick={clearAllFilters}
              className="text-(--color-primary-500) font-bold mt-2 inline-block hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
