'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MdArrowForwardIos } from 'react-icons/md';
import {
  API_BASE_URL,
  getMediaUrl,
  parseJsonResponse,
} from '@/app/(shared)/lib/apiConfig';

/**
 * FeaturedCategory Component
 * Updated: Enhanced circular category icons with a #EBEBFE border and a modern minimal shadow.
 * Logic: Filters top-level nodes of the tree for the 'is_featured_home' flag.
 */
const FeaturedCategory = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const fetchFeaturedFromTree = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/categories/tree/`);
        const data = await parseJsonResponse(res, []);

        const featuredRoots = (Array.isArray(data) ? data : []).filter(
          item => item.is_featured_home === true,
        );

        featuredRoots.sort(
          (a, b) => (a.featured_order || 0) - (b.featured_order || 0),
        );

        setFeaturedProducts(featuredRoots);
      } catch (error) {
        console.error('Error filtering featured categories from tree:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeaturedFromTree();
  }, []);

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 10);
      setCanScrollRight(
        container.scrollLeft <
          container.scrollWidth - container.clientWidth - 10,
      );
    }
  };

  const scroll = direction => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  if (isLoading && featuredProducts.length === 0) {
    return (
      <div className="px-4 w-full h-40 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-100 border-t-(--color-primary-500) rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 w-full">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-bold text-lg lg:text-2xl text-gray-900 tracking-tight uppercase">
          Featured Categories
        </h1>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 mr-4">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                canScrollLeft
                  ? 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50 cursor-pointer'
                  : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
              }`}
            >
              <MdArrowForwardIos className="rotate-180" size={16} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                canScrollRight
                  ? 'bg-black text-white border-black hover:bg-gray-800 cursor-pointer'
                  : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
              }`}
            >
              <MdArrowForwardIos size={16} />
            </button>
          </div>

          <Link href="/categories">
            <button className="border border-gray-100 bg-white rounded-full px-4 lg:px-6 py-2 lg:py-3 text-[#233b8c] flex gap-2 lg:gap-3 items-center text-xs lg:text-sm font-bold cursor-pointer hover:bg-gray-50 transition-all shadow-none uppercase tracking-widest">
              View All
              <MdArrowForwardIos size={14} />
            </button>
          </Link>
        </div>
      </div>

      {/* Slider Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollButtons}
        className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-8 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {featuredProducts.map(item => (
          <Link
            href={`/category/${item.slug}`}
            key={item.id}
            className="flex-shrink-0 flex flex-col items-center text-center snap-start group cursor-pointer
                       w-[calc((100%-24px)/2.5)] 
                       md:w-[calc((100%-80px)/4.5)] 
                       xl:w-[calc((100%-120px)/6.5)]"
          >
            {/* Image Wrapper with updated border and modern minimal shadow */}
            <div className="relative bg-(--color-imageBG) rounded-full w-full aspect-square flex items-center justify-center overflow-hidden p-4 sm:p-6 xl:p-10 border-[2px] border-[#EBEBFE] transition-all group-hover:border-(--color-primary-100) shadow-[0_8px_20px_rgba(0,0,0,0.04)] group-hover:shadow-[0_12px_30px_rgba(35,59,140,0.08)]">
              <div className="relative w-full h-full">
                <Image
                  src={getMediaUrl(item.image) || '/assets/images/applogo.png'}
                  alt={item.name}
                  fill
                  className="object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                  unoptimized
                />
              </div>
            </div>

            {/* Category Info */}
            <div className="mt-4 space-y-1">
              <h3 className="font-bold text-xs sm:text-sm lg:text-base text-gray-900 leading-tight group-hover:text-(--color-primary-500) transition-colors line-clamp-1 uppercase">
                {item.name}
              </h3>
              <p className="text-[10px] sm:text-xs lg:text-sm text-gray-400 font-black uppercase tracking-tighter">
                {item.product_count || 0} Products
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FeaturedCategory;
