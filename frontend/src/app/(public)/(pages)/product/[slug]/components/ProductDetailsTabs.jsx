'use client';

import React, { useState, useMemo } from 'react';
import { FiStar, FiEdit3, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useReviews } from '../../../../hooks/useReviews';
import ReviewForm from './ReviewForm';
import ReviewCard from './ReviewCard';

/**
 * ProductDetailsTabs Component
 * Features: Restored Specs, Bolder Bars, and Dynamic Pagination (Always Shown).
 */
const ProductDetailsTabs = ({ product, onReviewSuccess }) => {
  const [activeTab, setActiveTab] = useState('Description');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const { reviews, loading, pagination, fetchReviews } = useReviews(
    product?.id,
  );

  // 1. Specification Logic
  const specs = useMemo(() => {
    if (!product) return [];
    const baseSpecs = [
      { label: 'Generic Name', value: product.ingredient_name || 'N/A' },
      { label: 'Brand', value: product.brand_name || 'N/A' },
      { label: 'Category', value: product.category_name || 'N/A' },
      { label: 'Dosage', value: product.dosage || 'N/A' },
      { label: 'Unit / Pack Size', value: product.unit_label || 'N/A' },
    ];
    const customSpecs = Object.entries(product.specifications || {}).map(
      ([key, val]) => ({
        label: key,
        value: val,
      }),
    );
    return [...baseSpecs, ...customSpecs];
  }, [product]);

  // 2. Dynamic Pagination Calculation
  const totalCount = pagination?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  const handlePageChange = newPage => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    fetchReviews(newPage);
  };

  const hasReviewed = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const userData = localStorage.getItem('user');
    if (!userData) return false;
    try {
      const user = JSON.parse(userData);
      return reviews.some(r => r.user === user.id);
    } catch (e) {
      return false;
    }
  }, [reviews]);

  if (!product) return null;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700">
      {/* Tab Navigation */}
      <div className="w-full overflow-x-auto no-scrollbar">
        <div className="bg-white border border-gray-100 rounded-full p-2 w-fit flex items-center gap-2">
          {['Description', 'Specification', 'Rating & Reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 rounded-full text-[14px] font-bold transition-all cursor-pointer whitespace-nowrap border ${
                activeTab === tab
                  ? 'bg-black text-white border-black'
                  : 'bg-transparent text-gray-400 border-gray-100 hover:border-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-12">
        {activeTab === 'Description' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-gray-900">
              Medicine Overview of {product.name}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {product.description || 'No description available.'}
            </p>
          </div>
        )}

        {activeTab === 'Specification' && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Product Specifications
            </h2>
            <div className="space-y-1">
              {specs.map((spec, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between w-full py-5 border-b border-gray-50 last:border-0"
                >
                  <span className="text-[13px] text-gray-400 font-black uppercase tracking-widest mb-1 sm:mb-0">
                    {spec.label}
                  </span>
                  <span className="text-[15px] sm:text-[18px] font-bold text-gray-900 text-left sm:text-right">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Rating & Reviews' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Summary Section */}
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-24">
              <div className="text-center md:text-left">
                <div className="flex items-baseline justify-center md:justify-start">
                  <span className="text-8xl font-bold text-gray-900">
                    {parseFloat(product.rating_avg || 0).toFixed(1)}
                  </span>
                  <span className="text-4xl font-bold text-gray-300 ml-3">
                    /5
                  </span>
                </div>
                <p className="text-gray-500 font-bold text-lg mt-2">
                  ({totalCount} Reviews)
                </p>
              </div>

              {/* Bolder Progress Bars */}
              <div className="flex-1 w-full max-w-md space-y-5">
                {[5, 4, 3, 2, 1].map(stars => {
                  const percentage = stars === 5 ? 85 : stars === 4 ? 15 : 2;
                  return (
                    <div key={stars} className="flex items-center gap-4">
                      <div className="flex items-center gap-2 w-8">
                        <FiStar
                          className="text-amber-400 fill-amber-400"
                          size={20}
                        />
                        <span className="text-sm font-bold text-gray-900">
                          {stars}
                        </span>
                      </div>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full relative">
                        <div
                          className="absolute left-0 top-0 h-full bg-black rounded-full flex items-center justify-end"
                          style={{ width: `${percentage}%` }}
                        >
                          <div className="w-2.5 h-2.5 bg-black rounded-full translate-x-1 border border-white" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {!hasReviewed && !showReviewForm && (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-8 h-14 bg-[#1D3583] text-white rounded-full font-bold flex items-center gap-2 hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-blue-900/10"
                >
                  <FiEdit3 /> Write a Review
                </button>
              </div>
            )}

            {showReviewForm && (
              <ReviewForm
                productId={product.id}
                onReviewSubmitted={() => {
                  fetchReviews();
                  setShowReviewForm(false);
                  if (onReviewSuccess) onReviewSuccess();
                }}
                onCancel={() => setShowReviewForm(false)}
              />
            )}

            {/* Review List */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900">
                Recent Reviews
              </h3>
              {loading ? (
                <div className="py-10 flex justify-center">
                  <div className="w-8 h-8 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map(review => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center bg-gray-50/50 rounded-[32px] border border-dashed border-gray-200">
                  <FiStar className="mx-auto text-gray-300 mb-4" size={48} />
                  <h4 className="text-lg font-bold text-gray-900">
                    No reviews yet
                  </h4>
                </div>
              )}

              {/* Dynamic Pagination - Always Shown */}
              <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-50">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                  Showing{' '}
                  {totalCount > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0} to{' '}
                  {Math.min(currentPage * PAGE_SIZE, totalCount)} of{' '}
                  {totalCount}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 cursor-pointer"
                  >
                    <FiChevronLeft />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    p => (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-10 h-10 rounded-full font-bold text-sm transition-all cursor-pointer ${currentPage === p ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-600'}`}
                      >
                        {p}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 cursor-pointer"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsTabs;
