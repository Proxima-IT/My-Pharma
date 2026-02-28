'use client';

import { useRef, useState, useEffect } from 'react';
import { MdArrowForwardIos } from 'react-icons/md';
import BundleCard from './BundleCard';
import { useBundleData } from '@/app/(public)/hooks/useBundleData';

export default function BundleSlider({ cardsToShow }) {
  const { bundles } = useBundleData();
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      checkScrollButtons();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
      const scrollAmount = container.clientWidth;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  /**
   * 4-Breakpoint Width Calculation
   */
  const getCardWidth = () => {
    if (windowWidth === 0) return '100%'; // SSR Fallback

    // 1. If a specific override is passed (like cardsToShow={1} in Product Page), respect it
    if (cardsToShow === 1) return '100%';

    // 2. Standard 4-Breakpoint Logic
    if (windowWidth < 640) {
      return '100%'; // 4. Phone Screen: 1 Card
    }
    if (windowWidth < 1024) {
      return 'calc((100% - 20px) / 2)'; // 3. Tab Screen: 2 Cards
    }
    if (windowWidth < 1280) {
      return 'calc((100% - 20px) / 2)'; // 2. Laptop Screen: 2 Cards
    }

    return 'calc((100% - 40px) / 3)'; // 1. Large Screen: 3 Cards
  };

  return (
    <div className="relative w-full animate-in fade-in duration-700">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="font-bold text-xl sm:text-2xl text-gray-900 tracking-tight">
          Smart health bundles at better value
        </h1>
        <div className="flex items-center gap-3">
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
      </div>

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollButtons}
        className="flex gap-5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory touch-pan-x pb-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {bundles.map(bundle => (
          <div
            key={bundle.id}
            className="flex-shrink-0 snap-start"
            style={{ width: getCardWidth() }}
          >
            <BundleCard bundle={bundle} />
          </div>
        ))}
      </div>
    </div>
  );
}
