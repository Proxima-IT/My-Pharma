'use client';

import React from 'react';

/**
 * AlternativeProductCard
 * Currently set to "Not Available" as per database state.
 * Adheres to the "Relaxing Vibe": No shadows, high rounding, subtle borders.
 */
const AlternativeProductCard = () => {
  return (
    <div className="w-full bg-white border border-gray-100 rounded-[24px] p-10 flex items-center justify-center transition-all">
      <span className="text-[16px] font-bold text-gray-400 uppercase tracking-widest">
        Not Available
      </span>
    </div>
  );
};

export default AlternativeProductCard;
