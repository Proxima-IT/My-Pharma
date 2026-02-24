'use client';

import { useRef, useState, useEffect } from 'react';
import { MdArrowForwardIos } from 'react-icons/md';
import BundleCard from './BundleCard';
import { useBundleData } from '@/app/(public)/hooks/useBundleData';

export default function BundleSlider({ cardsToShow = 3 }) {
  const { bundles } = useBundleData();
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [windowWidth, setWindowWidth] = useState(0);

  // Track window width for responsive inline styles
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

  // Calculate width based on screen size
  const getCardWidth = () => {
    if (windowWidth < 640) return '100%'; // Mobile: 1 card
    if (windowWidth < 1024) return 'calc((100% - 20px) / 2)'; // Tablet: 2 cards

    // Desktop: Dynamic based on prop
    const gap = 20;
    return `calc((100% - ${(cardsToShow - 1) * gap}px) / ${cardsToShow})`;
  };

  return (
    <div className="relative w-full">
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
        className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory touch-pan-x pb-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {bundles.map(bundle => (
          <div
            key={bundle.id}
            className="flex-shrink-0 snap-center"
            style={{ width: getCardWidth() }}
          >
            <BundleCard bundle={bundle} />
          </div>
        ))}
      </div>
    </div>
  );
}
