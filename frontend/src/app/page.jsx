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
 * Refactored: Uses Sidebar Category endpoint to drive the main product sections.
 * Logic:
 * 1. Fetches categories from the sidebar-category API.
 * 2. Filters for top-level categories (no parent) to create main homepage sections.
 * 3. Respects manual placement of promotional banners.
 */
export default function Home() {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeSections = async () => {
      try {
        // Fetch categories designated for navigation/sidebar to use as big sections
        const res = await fetch(`${API_BASE_URL}/categories/sidebar-category/`);
        const data = await parseJsonResponse(res, []);

        // Filter: Only show top-level categories as sections (children stay in dropdowns)
        // Sort: Follow the sidebar_order defined in the Admin Category Manager
        const sorted = (Array.isArray(data) ? data : data.results || [])
          .filter(cat => !cat.parent)
          .sort((a, b) => (a.sidebar_order || 0) - (b.sidebar_order || 0));

        setSections(sorted);
      } catch (error) {
        console.error('Failed to fetch home sections:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeSections();
  }, []);

  return (
    <div className="flex flex-col gap-10 lg:gap-16">
      <HeroCarousel />

      {/* Dynamic Circle Icons (Driven by is_featured_home) */}
      <FeaturedCategory />

      {/* 
        First Group of Sections (Indices 0, 1, 2)
        Equivalent to: Popular Products, Natura Care, Unilever Deals
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
        Remaining Sections (Index 3 and onwards)
        Equivalent to: Boost & Balance and any future added sections
      */}
      {!isLoading &&
        sections.slice(3).map((category, index) => (
          <DynamicProductSection
            key={category.id}
            category={category}
            index={index + 3} // Offset to maintain color rotation
          />
        ))}

      <SmartHealthBundle />
      <DealsSection />
    </div>
  );
}
