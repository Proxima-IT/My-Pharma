'use client';

import React, { useState, useMemo } from 'react';
import {
  FiStar,
  FiEdit3,
  FiChevronLeft,
  FiChevronRight,
  FiActivity,
  FiInfo,
  FiLayers,
  FiHelpCircle,
} from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { useReviews } from '../../../../hooks/useReviews';
import ReviewForm from './ReviewForm';
import ReviewCard from './ReviewCard';

/**
 * ProductDetailsTabs Component
 * Refactored: Support for high-fidelity Markdown rendering for medical metadata.
 * Features: Structured Medical Guide, Dynamic Specifications, and FAQ Parsing.
 */
const ProductDetailsTabs = ({ product, onReviewSuccess }) => {
  const [activeTab, setActiveTab] = useState('Description');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const { reviews, loading, pagination, fetchReviews } = useReviews(
    product?.id,
  );

  // 1. FAQ Parsing Logic (Stored as JSON string in Backend)
  const parsedFaqs = useMemo(() => {
    if (!product?.faq) return [];
    try {
      return JSON.parse(product.faq);
    } catch (e) {
      return [];
    }
  }, [product?.faq]);

  // 2. Medical Info Mapping (Markdown Fields)
  const medicalInfo = useMemo(() => {
    if (!product) return [];
    const fields = [
      { label: 'Indications', value: product.indications },
      {
        label: 'Dosage & Administration',
        value: product.dosage_administration,
      },
      { label: 'Pharmacology', value: product.pharmacology },
      { label: 'Side Effects', value: product.side_effects },
      { label: 'Contraindications', value: product.contraindications },
      { label: 'Precautions & Warnings', value: product.precautions_warnings },
      { label: 'Drug Interactions', value: product.interaction },
      { label: 'Pregnancy & Lactation', value: product.pregnancy_lactation },
      { label: 'Overdose Effects', value: product.overdose_effects },
      { label: 'Mode of Action', value: product.mode_of_action },
    ];
    return fields.filter(f => f.value && f.value.trim() !== '');
  }, [product]);

  // 3. Specification Logic
  const specs = useMemo(() => {
    if (!product) return [];
    const baseSpecs = [
      { label: 'Generic Name', value: product.ingredient_name || 'N/A' },
      { label: 'Brand', value: product.brand_name || 'N/A' },
      { label: 'Category', value: product.category_name || 'N/A' },
      { label: 'Therapeutic Class', value: product.therapeutic_class || 'N/A' },
      { label: 'Storage', value: product.storage_conditions || 'N/A' },
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

  const TabButton = ({ id, label, icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-6 md:px-8 py-3 rounded-full text-[13px] font-bold transition-all cursor-pointer whitespace-nowrap border flex items-center gap-2 ${
        activeTab === id
          ? 'bg-black text-white border-black'
          : 'bg-transparent text-gray-400 border-gray-100 hover:border-gray-200'
      }`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700">
      {/* Tab Navigation */}
      <div className="w-full overflow-x-auto no-scrollbar">
        <div className="bg-white border border-gray-100 rounded-full p-2 w-fit flex items-center gap-2">
          <TabButton id="Description" label="Overview" icon={<FiInfo />} />
          {medicalInfo.length > 0 && (
            <TabButton
              id="Medical"
              label="Medical Guide"
              icon={<FiActivity />}
            />
          )}
          <TabButton id="Specification" label="Technical" icon={<FiLayers />} />
          {parsedFaqs.length > 0 && (
            <TabButton id="FAQ" label="Q&A" icon={<FiHelpCircle />} />
          )}
          <TabButton id="Reviews" label="Reviews" icon={<FiStar />} />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-12 min-h-[400px]">
        {/* TAB: DESCRIPTION */}
        {activeTab === 'Description' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
              Product Overview
            </h2>
            <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed">
              <ReactMarkdown>
                {product.description || 'No description available.'}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* TAB: MEDICAL GUIDE (New) */}
        {activeTab === 'Medical' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
              Clinical Information
            </h2>
            <div className="grid grid-cols-1 gap-8">
              {medicalInfo.map((info, idx) => (
                <div key={idx} className="space-y-3">
                  <h4 className="text-[12px] font-black text-black uppercase tracking-widest border-l-4 border-black pl-3">
                    {info.label}
                  </h4>
                  <div className="prose prose-sm max-w-none text-gray-600 pl-4">
                    <ReactMarkdown>{info.value}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: SPECIFICATION */}
        {activeTab === 'Specification' && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 uppercase tracking-tight">
              Technical Data
            </h2>
            <div className="space-y-0">
              {specs.map((spec, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between w-full py-5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 px-2 transition-colors"
                >
                  <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1 sm:mb-0">
                    {spec.label}
                  </span>
                  <span className="text-[14px] font-bold text-gray-900 text-left sm:text-right uppercase">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: FAQ (New Dynamic Logic) */}
        {activeTab === 'FAQ' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {parsedFaqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 rounded-[24px] p-6 space-y-3 border border-gray-100"
                >
                  <h4 className="text-base font-bold text-black flex gap-3">
                    <span className="text-gray-300">Q.</span> {faq.question}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed pl-7">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: REVIEWS */}
        {activeTab === 'Reviews' && (
          <div className="space-y-12 animate-in fade-in duration-500">
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
                  ({totalCount} Total Reviews)
                </p>
              </div>

              <div className="flex-1 w-full max-w-md space-y-5">
                {[5, 4, 3, 2, 1].map(stars => (
                  <div key={stars} className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-8">
                      <FiStar
                        className="text-amber-400 fill-amber-400"
                        size={18}
                      />
                      <span className="text-sm font-bold text-gray-900">
                        {stars}
                      </span>
                    </div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full relative overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-black rounded-full"
                        style={{ width: `${stars === 5 ? 85 : 10}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!hasReviewed && !showReviewForm && (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-8 h-14 bg-[#1D3583] text-white rounded-full font-bold flex items-center gap-2 hover:brightness-110 transition-all cursor-pointer"
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

            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900">
                Recent User Feedback
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
                    No reviews yet for this product.
                  </h4>
                </div>
              )}

              {/* Pagination */}
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
