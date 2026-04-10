'use client';

import React from 'react';
import PopularProductCard from '../../../home/components/PopularProductCard';

/**
 * Renders generic alternatives from GET /api/products/:slug/ (field generic_alternatives).
 */
const AlternativeProductCard = ({ alternatives = [] }) => {
  const list = Array.isArray(alternatives) ? alternatives : [];

  if (list.length === 0) {
    return (
      <div className="w-full bg-white border border-gray-100 rounded-[24px] p-10 flex items-center justify-center transition-all">
        <span className="text-[16px] font-bold text-gray-400 uppercase tracking-widest text-center">
          No generic alternatives in catalog
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {list.map(item => (
        <PopularProductCard key={item.id} product={item} />
      ))}
    </div>
  );
};

export default AlternativeProductCard;
