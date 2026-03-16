'use client';

import React from 'react';
import FeaturedCategory from '../home/components/FeaturedCategory';
import PopularProduct from '../home/components/PopularProduct';

const CategoriesPage = () => {
  return (
    <div className="w-full space-y-16 pb-20 animate-in fade-in duration-700">
      <FeaturedCategory />
      <PopularProduct />
    </div>
  );
};

export default CategoriesPage;
