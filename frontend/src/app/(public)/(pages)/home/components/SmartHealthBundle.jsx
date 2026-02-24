'use client';

import React from 'react';
import BundleSlider from './BundleSlider';

const SmartHealthBundle = ({ cardsToShow = 3 }) => {
  return (
    <div className="pt-[70px] px-4 w-full overflow-hidden">
      <BundleSlider cardsToShow={cardsToShow} />
    </div>
  );
};

export default SmartHealthBundle;
