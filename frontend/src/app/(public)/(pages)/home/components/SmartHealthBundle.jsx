'use client';

import React from 'react';
import BundleSlider from './BundleSlider';

const SmartHealthBundle = () => {
  return (
    <div className="pt-[70px] px-4 w-full overflow-hidden">
      {/* 
        Removed the hardcoded cardsToShow prop to allow BundleSlider 
        to use its internal 4-breakpoint responsive logic.
      */}
      <BundleSlider />
    </div>
  );
};

export default SmartHealthBundle;
