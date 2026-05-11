'use client';

import React, { useEffect, useState } from 'react';
import HeroCarousel from './(public)/(pages)/home/components/HeroCarousel';
import FeaturedCategory from './(public)/(pages)/home/components/FeaturedCategory';
import UploadPrescriptionBanner from './(public)/(pages)/home/components/UploadPrescriptionBanner';
import DynamicProductSection from './(public)/(pages)/home/components/DynamicProductSection';
import PopularProduct from './(public)/(pages)/home/components/PopularProduct';
import BookTestBanner from './(public)/(pages)/home/components/BookTestBanner';
import SmartHealthBundle from './(public)/(pages)/home/components/SmartHealthBundle';
import DealsSection from './(public)/(pages)/home/components/DealsSection';

import { API_BASE_URL, parseJsonResponse } from '@/app/(shared)/lib/apiConfig';

/**
 * Home Page Controller
 * Refactored: Replaced static sections with dynamic category-driven sections.
 * Logic: Fetches featured categories and renders them while respecting the manual banner placement.
 */
export default function Home() {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeSections = async () => {
      try {
        // Fetch all categories with the home section filter
        // FIX: Using the correct backend field name 'is_home_categoery' to ensure filtering works.
        const res = await fetch(
          `${API_BASE_URL}/categories/?is_home_categoery=true&is_active=true`,
        );
        const data = await parseJsonResponse(res, { results: [] });

        const categoryList = Array.isArray(data) ? data : data.results || [];

        // Sort by the featured_order (or sidebar_order as fallback)
        const sorted = categoryList.sort(
          (a, b) => (a.featured_order || 0) - (b.featured_order || 0),
        );

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
    <div className="flex flex-col gap-10 lg:gap-16 bg-[#F2F3F5]">
      <HeroCarousel />

      {/* Circle Icon Bar (Driven by is_featured_home flag) */}
      <FeaturedCategory />

      <UploadPrescriptionBanner />

      {/* Popular Products – always shown regardless of category flags */}
      <PopularProduct />

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

      <SmartHealthBundle />

      <DealsSection />

      {/* 
        Second Batch of Dynamic Sections (Index 3 and onwards)
        Interjected between the Prescription and Booking banners
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
    </div>
  );
}
