'use client';

import React, { useEffect, useState } from 'react';
import HeroCarousel from './(public)/(pages)/home/components/HeroCarousel';
import FeaturedCategory from './(public)/(pages)/home/components/FeaturedCategory';
import UploadPrescriptionBanner from './(public)/(pages)/home/components/UploadPrescriptionBanner';
import DynamicProductSection from './(public)/(pages)/home/components/DynamicProductSection';
import BookTestBanner from './(public)/(pages)/home/components/BookTestBanner';
import SmartHealthBundle from './(public)/(pages)/home/components/SmartHealthBundle';
import DealsSection from './(public)/(pages)/home/components/DealsSection';
import { API_BASE_URL, parseJsonResponse } from '@/app/(shared)/lib/apiConfig';

/**
 * Home Page Controller
 * Updated: Section creation logic now uses the dedicated 'is_home_section' flag on Categories.
 * Logic:
 * 1. Fetches categories from the main registry.
 * 2. Filters for categories explicitly marked as homepage sections.
 * 3. Maintains manual positioning of promotional banners.
 */
export default function Home() {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeSections = async () => {
      try {
        // Fetch all categories with the home section filter
        // Note: Using is_home_section=true as the new flag on the category table
        const res = await fetch(
          `${API_BASE_URL}/categories/?is_home_section=true&is_active=true`,
        );
        const data = await parseJsonResponse(res, { results: [] });

        const categoryList = Array.isArray(data) ? data : data.results || [];

        // Sort by the featured_order (or sidebar_order as fallback)
        const sorted = categoryList.sort(
          (a, b) => (a.featured_order || 0) - (b.featured_order || 0),
        );

        setSections(sorted);
      } catch (error) {
        console.error('Failed to fetch dynamic home sections:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeSections();
  }, []);

  return (
    <div className="flex flex-col gap-10 lg:gap-16 bg-white">
      <HeroCarousel />

      {/* Circle Icon Bar (Driven by is_featured_home flag) */}
      <FeaturedCategory />

      {/* 
        Group 1: Top 3 Sections
        Placed before the first major promotional banner.
      */}
      {!isLoading &&
        sections
          .slice(0, 3)
          .map((category, index) => (
            <DynamicProductSection
              key={category.id}
              category={category}
              index={index}
            />
          ))}

      <UploadPrescriptionBanner />

      <BookTestBanner />

      {/* 
        Group 2: Remaining Sections
        Placed after the middle banners.
      */}
      {!isLoading &&
        sections
          .slice(3)
          .map((category, index) => (
            <DynamicProductSection
              key={category.id}
              category={category}
              index={index + 3}
            />
          ))}

      <SmartHealthBundle />
      <DealsSection />
    </div>
  );
}
