'use client';

import React, { useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { IoReloadOutline } from 'react-icons/io5';
import { TbCurrencyTaka } from 'react-icons/tb';
import { FiFilter, FiChevronDown } from 'react-icons/fi';
import PopularBundleCard from '../home/components/PopularBundleCard';
import { useBundleData } from '../../hooks/useBundleData';
import {
  getComboDisplayOriginalPrice,
  getComboDisplayPrice,
} from '@/app/(public)/lib/comboPricing';

const CombosPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. URL Params
  const searchQuery = searchParams.get('search') || '';

  // 2. State Declarations
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [hasDiscount, setHasDiscount] = useState('');

  // 3. Data Hook
  const { loading, bundles } = useBundleData();

  // 4. Filtering Logic (Client-side for bundles)
  const filteredBundles = useMemo(() => {
    let result = bundles;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        b =>
          (b.name && b.name.toLowerCase().includes(query)) ||
          (b.title && b.title.toLowerCase().includes(query)) ||
          (b.description && b.description.toLowerCase().includes(query)),
      );
    }

    if (minPrice) {
      result = result.filter(
        b => getComboDisplayPrice(b) >= parseFloat(minPrice),
      );
    }
    if (maxPrice) {
      result = result.filter(
        b => getComboDisplayPrice(b) <= parseFloat(maxPrice),
      );
    }

    if (hasDiscount === 'true') {
      result = result.filter(b => {
        const displayPrice = getComboDisplayPrice(b);
        const originalPrice = getComboDisplayOriginalPrice(b);
        return originalPrice !== null && originalPrice > displayPrice;
      });
    }

    return result;
  }, [bundles, searchQuery, minPrice, maxPrice, hasDiscount]);

  // 5. Handlers
  const clearAllFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setHasDiscount('');
    router.push('/combos');
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
      <aside className="w-full lg:w-[360px] shrink-0 lg:sticky lg:top-36 lg:self-start lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto pr-2 lg:pr-4 [scrollbar-width:thin] [scrollbar-color:var(--color-gray-200)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
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
              Combo Filter
            </h2>
            <button
              onClick={clearAllFilters}
              className="text-xs font-bold text-(--color-primary-500) hover:underline uppercase tracking-widest cursor-pointer"
            >
              Clear All
            </button>
          </div>

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

          <div className="bg-white rounded-[32px] border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">
                Discount
              </h3>
              <button
                onClick={() => setHasDiscount('')}
                className="text-gray-400 hover:text-(--color-primary-500) transition-colors cursor-pointer"
              >
                <IoReloadOutline size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-2xl transition-all group">
                <input
                  type="radio"
                  name="discount"
                  checked={hasDiscount === ''}
                  onChange={() => setHasDiscount('')}
                  className="w-5 h-5 rounded border-gray-300 text-(--color-primary-500) focus:ring-(--color-primary-500) cursor-pointer accent-(--color-primary-500)"
                />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                  All Combos
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-2xl transition-all group">
                <input
                  type="radio"
                  name="discount"
                  checked={hasDiscount === 'true'}
                  onChange={() => setHasDiscount('true')}
                  className="w-5 h-5 rounded border-gray-300 text-(--color-primary-500) focus:ring-(--color-primary-500) cursor-pointer accent-(--color-primary-500)"
                />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                  On Discount
                </span>
              </label>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 px-2">
          <h1 className="font-bold text-2xl text-gray-900 tracking-tight">
            {searchQuery ? (
              <>Search results for &quot;{searchQuery}&quot;</>
            ) : (
              <>{filteredBundles.length} items found</>
            )}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {filteredBundles.map(bundle => (
            <PopularBundleCard key={bundle.id} bundle={bundle} />
          ))}
        </div>

        {filteredBundles.length === 0 && (
          <div className="w-full py-20 text-center bg-white rounded-[40px] border border-gray-100">
            <p className="text-gray-400 font-medium text-lg">
              No combos found matching your criteria.
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

export default CombosPage;
