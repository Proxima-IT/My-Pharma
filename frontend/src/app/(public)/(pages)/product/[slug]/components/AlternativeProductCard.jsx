'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { productApi } from '../../../../api/productApi';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';

/**
 * AlternativeProductCard
 * Displays cheaper generic alternatives in a horizontal row layout.
 * Design: Public Zone (rounded-[24px], strictly NO shadows).
 */
const AlternativeProductCard = ({ currentProduct }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCheaperAlternatives = async () => {
      if (!currentProduct?.ingredient) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Query parameters: Match ingredient, target generics, filter available, sort by price.
        const params = {
          ingredient_id: currentProduct.ingredient,
          is_generic: true,
          available: true,
          ordering: 'price',
        };

        const response = await productApi.getProducts(params);

        // Filter out current product and ensure suggestions are actually cheaper
        const cheaperItems = response.results.filter(
          item =>
            item.id !== currentProduct.id &&
            parseFloat(item.price) < parseFloat(currentProduct.price),
        );

        setSuggestions(cheaperItems);
      } catch (error) {
        console.error('Failed to fetch generic suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCheaperAlternatives();
  }, [currentProduct]);

  if (loading) {
    return (
      <div className="w-full bg-white border border-gray-100 rounded-[32px] p-10 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-4 border-(--color-primary-500) border-t-transparent rounded-full animate-spin" />
        <span className="text-[14px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">
          Searching suggestions...
        </span>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="w-full bg-gray-50/50 border border-dashed border-gray-200 rounded-[32px] p-10 flex items-center justify-center">
        <span className="text-[14px] font-bold text-gray-400 uppercase tracking-widest text-center">
          No cheaper alternatives found
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {suggestions.map(item => (
        <Link
          key={item.id}
          href={`/product/${item.slug}`}
          className="flex flex-row items-center gap-4 p-4 bg-white border border-gray-100 rounded-[24px] hover:bg-gray-50 transition-all group shadow-none"
        >
          {/* Image Container */}
          <div className="relative w-20 h-20 bg-gray-50 rounded-[16px] overflow-hidden flex-shrink-0 shadow-none">
            <Image
              src={getMediaUrl(item.image)}
              alt={item.name}
              fill
              className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
              unoptimized
            />
          </div>

          {/* Info Container */}
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-(--color-primary-500) uppercase tracking-widest block mb-1">
              {item.brand_name || 'Generic'}
            </span>
            <h4 className="text-[14px] font-bold text-gray-900 truncate uppercase tracking-tight leading-tight">
              {item.name}
            </h4>
            <p className="text-[11px] text-gray-500 font-medium mb-2">
              {item.dosage} {item.unit_name}
            </p>

            <div className="flex items-center gap-2">
              <span className="text-[15px] font-black text-gray-900">
                ৳{item.price}
              </span>
              {parseFloat(item.original_price) > parseFloat(item.price) && (
                <span className="text-[11px] text-gray-400 line-through font-bold">
                  ৳{item.original_price}
                </span>
              )}
            </div>
          </div>

          {/* Savings Badge */}
          <div className="hidden sm:flex flex-col items-end">
            <div className="bg-green-50 text-green-700 text-[10px] font-black px-3 py-1 rounded-full border border-green-100 uppercase tracking-tighter shadow-none">
              -
              {Math.round(
                ((currentProduct.price - item.price) / currentProduct.price) *
                  100,
              )}
              %
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default AlternativeProductCard;
