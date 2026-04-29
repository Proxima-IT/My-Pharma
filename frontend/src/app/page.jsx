'use client';

import React from 'react';
import HeroCarousel from './(public)/(pages)/home/components/HeroCarousel';
import FeaturedCategory from './(public)/(pages)/home/components/FeaturedCategory';
import UploadPrescriptionBanner from './(public)/(pages)/home/components/UploadPrescriptionBanner';
import PopularProduct from './(public)/(pages)/home/components/PopularProduct';
import NaturaCare from './(public)/(pages)/home/components/NaturaCare';
import UnileverDeals from './(public)/(pages)/home/components/UnileverDeals';
import BoostBalance from './(public)/(pages)/home/components/BoostBalance';
import BookTestBanner from './(public)/(pages)/home/components/BookTestBanner';
import SmartHealthBundle from './(public)/(pages)/home/components/SmartHealthBundle';
import DealsSection from './(public)/(pages)/home/components/DealsSection';

/**
 * Home Page Controller
 * Updated: Integrated Boost & Balance wellness section.
 */
export default function Home() {
  return (
    <div className="flex flex-col gap-10 lg:gap-16">
      <HeroCarousel />
      <FeaturedCategory />

      <PopularProduct />
      <NaturaCare />
      <UnileverDeals />

      <UploadPrescriptionBanner />

      <BookTestBanner />

      {/* New Wellness Section */}
      <BoostBalance />

      <SmartHealthBundle />
      <DealsSection />
    </div>
  );
}
