'use client';

import React from 'react';
import BundleSlider from './BundleSlider';

const SmartHealthBundle = ({ compact }) => {
  return (
    <div className="px-4 w-full overflow-hidden">
      {/* 
        Removed the hardcoded cardsToShow prop to allow BundleSlider 
        to use its internal 4-breakpoint responsive logic.
      */}
      <BundleSlider compact={compact} />
    </div>
  );
};

export default SmartHealthBundle;
