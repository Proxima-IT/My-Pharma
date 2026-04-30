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
 * Logic: Fetches categories intended for the sidebar and renders them as dynamic homepage sections.
 */
export default function Home() {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeSections = async () => {
      try {
        // Method A categories that are selected for the sidebar/navigation
        const res = await fetch(`${API_BASE_URL}/categories/sidebar-category/`);
        const data = await parseJsonResponse(res, []);

        // Filter to ensure only top-level categories that have products appear as sections
        // and sort them by sidebar_order
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

      {/* Circle Icon Slider (Uses is_featured_home internally) */}
      <FeaturedCategory />

      {/* 
        First Batch of Dynamic Sections (Indices 0, 1, 2)
        Interjected between the Hero/Categories and the Prescription Banner
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

      {/* 
        Second Batch of Dynamic Sections (Index 3 and onwards)
        Interjected between the Prescription and Booking banners
      */}
      {!isLoading &&
        sections
          .slice(3, 4)
          .map((category, index) => (
            <DynamicProductSection
              key={category.id}
              category={category}
              index={index + 3}
            />
          ))}

      <BookTestBanner />

      {!isLoading &&
        sections
          .slice(4)
          .map((category, index) => (
            <DynamicProductSection
              key={category.id}
              category={category}
              index={index + 4}
            />
          ))}

      <SmartHealthBundle />
      <DealsSection />
    </div>
  );
}
