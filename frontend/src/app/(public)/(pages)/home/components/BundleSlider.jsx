"use client";

import { useRef, useState } from "react";
import { MdArrowForwardIos } from "react-icons/md";
import BundleCard from "./BundleCard";
import { useBundleData } from "@/app/(public)/hooks/useBundleData";

export default function BundleSlider({ cardsToShow = 3 }) {
  const { bundles } = useBundleData();

  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // ====== CHECK SCROLL POSITION ======
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

  // ====== SCROLL LEFT ======
  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.offsetWidth * 0.8; // 80% of container width
      container.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  // ====== SCROLL RIGHT ======
  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.offsetWidth * 0.8; // 80% of container width
      container.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  return (
    <div className="relative">
      {/* ====== NAVIGATION BUTTONS ====== */}
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl">
          Smart health bundles at better value
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`border rounded-full p-2 sm:p-3 rotate-180 flex items-center transition-all ${
              canScrollLeft
                ? "bg-white text-black border-info-500/20 hover:bg-gray-50 cursor-pointer"
                : "bg-gray-100 text-black border-[#00000033] cursor-not-allowed opacity-70"
            }`}
            aria-label="Previous"
          >
            <MdArrowForwardIos size={16} />
          </button>

          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`border rounded-full p-2 sm:p-3 flex items-center transition-all ${
              canScrollRight
                ? "bg-black text-white border-info-500/10 hover:bg-gray-800 cursor-pointer"
                : "bg-gray-400 text-gray-200 border-gray-300 cursor-not-allowed opacity-50"
            }`}
            aria-label="Next"
          >
            <MdArrowForwardIos size={16} />
          </button>
        </div>
      </div>

      {/* ====== SCROLLABLE CONTAINER ====== */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollButtons}
        className="flex gap-3 sm:gap-5 mt-7 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth touch-pan-x"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* ====== RENDER CARDS ====== */}
        {bundles.map((bundle) => (
          <div
            key={bundle.id}
            className="bundle-card-wrapper flex-shrink-0"
            style={{
              width: `calc((100% - ${(cardsToShow - 1) * 20}px) / ${cardsToShow})`,
              minWidth: "100px",
              maxWidth: "300px",
            }}
          >
            <BundleCard bundle={bundle} />
          </div>
        ))}
      </div>

      {/* ====== MOBILE SCROLL INDICATOR ====== */}
      <div className="sm:hidden flex justify-center gap-2 mt-4">
        {Array.from({ length: Math.ceil(bundles.length / cardsToShow) }).map(
          (_, idx) => (
            <div key={idx} className="w-2 h-2 rounded-full bg-gray-300" />
          ),
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
