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
      <Sponsors />
      <FeaturedCategory />
      <UploadPrescriptionBanner />
      <PopularProduct />
      <BookTestBanner />
      {/* Set to show 3 cards in a row on desktop */}
      <SmartHealthBundle cardsToShow={3} />
      <DealsSection />
    </div>
  );
}
