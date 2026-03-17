'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';
import { FiArrowRight, FiSearch } from 'react-icons/fi';

/**
 * SearchSuggestions Component
 * Displays a floating list of product matches under the search bar.
 * Design: Public Premium (rounded-[24px], soft shadows).
 */
const SearchSuggestions = ({ suggestions, isLoading, onSelect, visible }) => {
  if (!visible) return null;

  return (
    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-[28px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
      <div className="max-h-[420px] overflow-y-auto no-scrollbar">
        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center gap-3 text-gray-400">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-(--color-primary-500) rounded-full animate-spin" />
            <p className="text-[11px] font-bold uppercase tracking-widest">
              Searching Catalog...
            </p>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="py-2">
            <div className="px-6 py-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Product Matches
              </span>
            </div>
            {suggestions.map(product => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                onClick={onSelect}
                className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors group"
              >
                <div className="relative w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                  <Image
                    src={getMediaUrl(product.image)}
                    alt={product.name}
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[15px] font-bold text-gray-900 truncate group-hover:text-(--color-primary-500) transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-[12px] text-gray-500 truncate font-medium">
                    {product.ingredient_name || product.category_name}
                  </p>
                </div>
                <div className="text-gray-300 group-hover:text-(--color-primary-500) transition-all transform group-hover:translate-x-1">
                  <FiArrowRight size={18} />
                </div>
              </Link>
            ))}
            <Link
              href={`/products?search=${suggestions[0]?.name}`}
              onClick={onSelect}
              className="flex items-center justify-center gap-2 py-4 bg-gray-50/50 text-(--color-primary-500) text-sm font-bold hover:bg-gray-50 transition-colors"
            >
              View all results <FiSearch size={14} />
            </Link>
          </div>
        ) : (
          <div className="p-10 text-center space-y-2">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
              <FiSearch size={24} />
            </div>
            <p className="text-sm font-bold text-gray-900">No products found</p>
            <p className="text-xs text-gray-500">Try a different keyword</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchSuggestions;
