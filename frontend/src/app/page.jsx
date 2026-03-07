'use client';

import React from 'react';
import HeroCarousel from './(public)/(pages)/home/components/HeroCarousel';
import Sponsors from './(public)/(pages)/home/components/Sponsors';
import FeaturedCategory from './(public)/(pages)/home/components/FeaturedCategory';
import UploadPrescriptionBanner from './(public)/(pages)/home/components/UploadPrescriptionBanner';
import PopularProduct from './(public)/(pages)/home/components/PopularProduct';
import BookTestBanner from './(public)/(pages)/home/components/BookTestBanner';
import SmartHealthBundle from './(public)/(pages)/home/components/SmartHealthBundle';
import DealsSection from './(public)/(pages)/home/components/DealsSection';

export default function Home() {
  return (
    <div className="flex flex-col gap-10 lg:gap-16">
      <HeroCarousel />
      <FeaturedCategory />
      <PopularProduct />
      <UploadPrescriptionBanner />
      <PopularProduct />
      <BookTestBanner />
      {/* 
        Removed hardcoded cardsToShow prop to allow the component 
        to handle responsive grid layouts internally (Large: 3, Laptop: 2).
      */}
      <SmartHealthBundle />
      <DealsSection />
    </div>
  );
}
