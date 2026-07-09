'use client';

import { useRef, useState, useEffect } from 'react';
import { MdArrowForwardIos } from 'react-icons/md';
import BundlePreviewCard from './BundlePreviewCard';
import { useBundleData } from '@/app/(public)/hooks/useBundleData';

/**
 * ProductBundleSlider
 * A compact, single-card bundle slider built for the Product Single page sidebar.
 * Uses the button-less BundlePreviewCard variant.
 */
export default function ProductBundleSlider() {
  const { bundles, loading } = useBundleData();
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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

  useEffect(() => {
    // Re-check on mount once content is rendered
    const timer = setTimeout(checkScrollButtons, 100);
    return () => clearTimeout(timer);
  }, [bundles]);

  const scroll = direction => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  if (loading) {
    return (
      <div className="w-full py-10 flex justify-center items-center">
        <div className="w-8 h-8 border-[3px] border-gray-100 border-t-(--color-primary-500) rounded-full animate-spin" />
      </div>
    );
  }

  if (bundles.length === 0) return null;

  return (
    <div className="relative w-full">
      {/* Header & Navigation Arrows (inline layout) */}
      <div className="flex items-center justify-between mb-4 px-0.5">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
          Bundle/Combo Package
        </h3>
        {bundles.length > 2 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                canScrollLeft
                  ? 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50 cursor-pointer'
                  : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
              }`}
            >
              <MdArrowForwardIos className="rotate-180" size={10} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                canScrollRight
                  ? 'bg-black text-white border-black hover:bg-gray-800 cursor-pointer'
                  : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
              }`}
            >
              <MdArrowForwardIos size={10} />
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Container — two cards visible side-by-side */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollButtons}
        className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory touch-pan-x"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {bundles.map(bundle => (
          <div
            key={bundle.id}
            className="flex-shrink-0 snap-start w-[calc(50%-6px)]"
          >
            <BundlePreviewCard bundle={bundle} />
          </div>
        ))}
      </div>
    </div>
  );
}
